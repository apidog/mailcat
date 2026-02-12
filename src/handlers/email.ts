import type { Env, Email } from '../types';
import { createStore } from '../store-factory';
import { generateId } from '../utils/crypto';

// Parse email address from "Name <email@example.com>" format
function parseEmailAddress(raw: string): { name?: string; email: string } {
  const match = raw.match(/^(?:"?([^"]*)"?\s+)?<?([^>]+@[^>]+)>?$/);
  if (match) {
    return {
      name: match[1]?.trim() || undefined,
      email: match[2].trim().toLowerCase(),
    };
  }
  return { email: raw.trim().toLowerCase() };
}

// Extract local part from email address
function getLocalPart(email: string): string {
  const atIndex = email.indexOf('@');
  return atIndex > 0 ? email.substring(0, atIndex).toLowerCase() : email.toLowerCase();
}

// Simple MIME parser for email content
function parseMimeContent(raw: string): { text: string; html?: string } {
  // Check for multipart
  const boundaryMatch = raw.match(/boundary="?([^"\r\n]+)"?/i);
  
  if (!boundaryMatch) {
    // Not multipart - check content type
    const isHtml = /content-type:\s*text\/html/i.test(raw);
    const bodyStart = raw.indexOf('\r\n\r\n');
    const body = bodyStart > 0 ? raw.substring(bodyStart + 4) : raw;
    
    // Handle quoted-printable
    let decoded = body;
    if (/content-transfer-encoding:\s*quoted-printable/i.test(raw)) {
      decoded = decodeQuotedPrintable(body);
    } else if (/content-transfer-encoding:\s*base64/i.test(raw)) {
      try {
        decoded = atob(body.replace(/\s/g, ''));
      } catch {
        decoded = body;
      }
    }
    
    if (isHtml) {
      return { text: htmlToText(decoded), html: decoded };
    }
    return { text: decoded };
  }
  
  const boundary = boundaryMatch[1];
  const parts = raw.split(`--${boundary}`);
  
  let text = '';
  let html: string | undefined;
  
  for (const part of parts) {
    if (part.trim() === '' || part.trim() === '--') continue;
    
    const isTextPart = /content-type:\s*text\/plain/i.test(part);
    const isHtmlPart = /content-type:\s*text\/html/i.test(part);
    
    if (!isTextPart && !isHtmlPart) continue;
    
    const bodyStart = part.indexOf('\r\n\r\n');
    if (bodyStart < 0) continue;
    
    let content = part.substring(bodyStart + 4).trim();
    
    // Handle encoding
    if (/content-transfer-encoding:\s*quoted-printable/i.test(part)) {
      content = decodeQuotedPrintable(content);
    } else if (/content-transfer-encoding:\s*base64/i.test(part)) {
      try {
        content = atob(content.replace(/\s/g, ''));
      } catch {
        // Keep original
      }
    }
    
    if (isTextPart && !text) {
      text = content;
    } else if (isHtmlPart) {
      html = content;
    }
  }
  
  // If no text part, derive from HTML
  if (!text && html) {
    text = htmlToText(html);
  }
  
  return { text, html };
}

// Decode quoted-printable encoding
function decodeQuotedPrintable(input: string): string {
  return input
    .replace(/=\r?\n/g, '') // Soft line breaks
    .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => 
      String.fromCharCode(parseInt(hex, 16))
    );
}

// Strip HTML tags and convert to plain text
function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Email handler for Cloudflare Email Routing
export async function handleEmail(
  message: EmailMessage,
  env: Env
): Promise<void> {
  // Get recipient mailbox name and domain
  const toAddress = message.to.toLowerCase();
  const mailboxName = getLocalPart(toAddress);
  const toDomain = toAddress.split('@')[1];
  
  // Read raw email content first (stream can only be read once)
  const rawEmail = await new Response(message.raw).text();
  
  // Route staging emails to staging worker via Service Binding
  if (env.STAGING_EMAIL_DOMAIN && toDomain === env.STAGING_EMAIL_DOMAIN && env.STAGING_WORKER) {
    console.log(`Forwarding to STAGING WORKER for ${toAddress}`);
    
    try {
      const response = await env.STAGING_WORKER.fetch('https://internal/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Email': 'true',
        },
        body: JSON.stringify({
          from: message.from,
          to: message.to,
          rawEmail,
        }),
      });
      
      if (!response.ok) {
        console.error(`Staging worker returned ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to forward to staging worker:', error);
    }
    return;
  }
  
  // Process locally for production emails
  const store = createStore(env);
  
  // Check if mailbox exists
  const mailbox = await store.getMailboxByName(mailboxName);
  if (!mailbox) {
    // Silently drop - no mailbox for this address
    console.log(`Dropping email: no mailbox for ${toAddress}`);
    return;
  }
  
  // Check size limit (1 MB)
  if (rawEmail.length > 1024 * 1024) {
    console.log(`Dropping email: too large (${rawEmail.length} bytes)`);
    return;
  }
  
  // Parse the email
  const { name: fromName, email: fromEmail } = parseEmailAddress(message.from);
  const { text, html } = parseMimeContent(rawEmail);
  
  // Extract subject from raw (message.headers doesn't have it reliably)
  const subjectMatch = rawEmail.match(/^subject:\s*(.+)$/mi);
  const subject = subjectMatch ? subjectMatch[1].trim() : '(no subject)';
  
  // Create email record
  const email: Email = {
    id: generateId(),
    mailboxName,
    from: fromEmail,
    fromName,
    to: toAddress,
    subject,
    bodyText: text,
    bodyHtml: html,
    receivedAt: Date.now(),
    read: false,
    size: rawEmail.length,
  };
  
  // Store the email
  await store.storeEmail(email);
  
  console.log(`Stored email ${email.id} for ${mailboxName}: "${subject}" from ${fromEmail}`);
}

/**
 * Handle internal email forwarded via Service Binding
 * This runs on the staging worker with staging code
 */
export async function handleInternalEmail(
  from: string,
  to: string,
  rawEmail: string,
  env: Env
): Promise<void> {
  const store = createStore(env);
  
  const toAddress = to.toLowerCase();
  const mailboxName = getLocalPart(toAddress);
  
  // Check if mailbox exists
  const mailbox = await store.getMailboxByName(mailboxName);
  if (!mailbox) {
    console.log(`Dropping internal email: no mailbox for ${toAddress}`);
    return;
  }
  
  // Check size limit (1 MB)
  if (rawEmail.length > 1024 * 1024) {
    console.log(`Dropping internal email: too large (${rawEmail.length} bytes)`);
    return;
  }
  
  // Parse the email
  const { name: fromName, email: fromEmail } = parseEmailAddress(from);
  const { text, html } = parseMimeContent(rawEmail);
  
  // Extract subject from raw
  const subjectMatch = rawEmail.match(/^subject:\s*(.+)$/mi);
  const subject = subjectMatch ? subjectMatch[1].trim() : '(no subject)';
  
  // Create email record
  const email: Email = {
    id: generateId(),
    mailboxName,
    from: fromEmail,
    fromName,
    to: toAddress,
    subject,
    bodyText: text,
    bodyHtml: html,
    receivedAt: Date.now(),
    read: false,
    size: rawEmail.length,
  };
  
  // Store the email
  await store.storeEmail(email);
  
  console.log(`[INTERNAL] Stored email ${email.id} for ${mailboxName}: "${subject}" from ${fromEmail}`);
}

// Type for Cloudflare Email Message
interface EmailMessage {
  from: string;
  to: string;
  raw: ReadableStream;
  headers: Headers;
}

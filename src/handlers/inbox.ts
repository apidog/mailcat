/**
 * Inbox and email handlers
 */

import type { IStore } from '../store-factory';
import { extractData } from '../utils/extractor';
import { json, error, noContent, toISO8601 } from '../utils/response';

/**
 * GET /inbox - List emails in mailbox
 */
export async function handleGetInbox(
  mailbox: { email: string; name: string },
  url: URL,
  store: IStore
): Promise<Response> {
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0');
  
  const emails = await store.getEmailsByMailbox(mailbox.name, limit, offset);
  const stats = await store.getMailboxStats(mailbox.name);
  const total = stats.emailCount;
  const unread = stats.unreadCount;
  const hasMore = offset + emails.length < total;
  
  // Convert timestamps to ISO 8601
  const emailsWithISO = emails.map(e => ({
    ...e,
    receivedAt: toISO8601(e.receivedAt),
  }));
  
  return json({
    data: emailsWithISO,
    meta: {
      mailbox: mailbox.email,
      unread,
      pagination: {
        offset,
        limit,
        totalCount: total,
        hasMore,
      },
      ...(unread > 0 && {
        agentHints: {
          suggestion: `You have ${unread} unread email${unread > 1 ? 's' : ''} to process`,
          tip: 'Emails auto-delete after 1 hour',
          nextSteps: [
            'Read unread emails with GET /emails/{id}',
            'Use extracted code field for verification',
          ],
        },
      }),
    },
  });
}

/**
 * GET /emails/:id - Get single email with extraction
 */
export async function handleGetEmail(
  emailId: string,
  mailbox: { name: string },
  store: IStore
): Promise<Response> {
  const email = await store.getEmail(emailId);
  
  if (!email || email.mailboxName !== mailbox.name) {
    return error('not_found', 'Email not found', 404);
  }
  
  // Mark as read
  await store.markEmailRead(emailId);
  
  // Extract verification codes and links
  const extracted = extractData(email.bodyText, email.bodyHtml);
  
  // Build agentHints based on what was extracted
  const agentHints: Record<string, unknown> = {};
  if (extracted.code) {
    agentHints.suggestion = 'Use the extracted verification code';
    agentHints.tip = 'Verification codes typically expire in 5-10 minutes';
    agentHints.nextSteps = ['Submit the code to complete verification'];
  } else if (extracted.links && extracted.links.length > 0) {
    agentHints.suggestion = 'Click the verification link to complete';
    agentHints.nextSteps = ['Open the verification link'];
  }
  
  return json({
    data: {
      email: {
        id: email.id,
        from: email.from,
        fromName: email.fromName,
        to: email.to,
        subject: email.subject,
        text: email.bodyText,
        html: email.bodyHtml,
        receivedAt: toISO8601(email.receivedAt),
        size: email.size,
      },
      code: extracted.code,
      links: extracted.links,
    },
    ...(Object.keys(agentHints).length > 0 && {
      meta: { agentHints },
    }),
  });
}

/**
 * DELETE /emails/:id - Delete email
 */
export async function handleDeleteEmail(
  emailId: string,
  mailbox: { name: string },
  store: IStore
): Promise<Response> {
  const deleted = await store.deleteEmail(emailId, mailbox.name);
  
  if (!deleted) {
    return error('not_found', 'Email not found', 404);
  }
  
  return noContent();
}

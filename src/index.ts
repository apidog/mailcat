import type { Env } from './types';
import { handleApi } from './handlers/api';
import { handleEmail, handleInternalEmail } from './handlers/email';
import { getHomePage } from './pages/home';
import { OG_IMAGE_BASE64 } from './assets/og-image';
import { getFavicon } from './assets/favicon';
import { getLogo } from './assets/logo';
import { StoreD1 } from './store-d1';

export default {
  // HTTP request handler (API)
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Redirect www to root domain
    if (url.hostname === `www.${env.EMAIL_DOMAIN}`) {
      url.hostname = env.EMAIL_DOMAIN;
      return Response.redirect(url.toString(), 301);
    }
    
    // Redirect api.domain to main domain for non-API paths
    // API endpoints stay on api.domain, docs redirect to main domain
    if (url.hostname === `api.${env.EMAIL_DOMAIN}`) {
      // Redirect root to main site
      if (url.pathname === '/' || url.pathname === '') {
        return Response.redirect(`https://${env.EMAIL_DOMAIN}/`, 301);
      }
      // Redirect skill.md to main site
      if (url.pathname === '/skill.md') {
        return Response.redirect(`https://${env.EMAIL_DOMAIN}/skill.md`, 301);
      }
    }
    
    let path = url.pathname;
    
    // Normalize path
    if (path !== '/' && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    
    // Internal email endpoint (called via Service Binding from production)
    if (path === '/internal/email' && request.method === 'POST') {
      const isInternal = request.headers.get('X-Internal-Email') === 'true';
      if (!isInternal) {
        return new Response('Forbidden', { status: 403 });
      }
      
      try {
        const data = await request.json() as { from: string; to: string; rawEmail: string };
        await handleInternalEmail(data.from, data.to, data.rawEmail, env);
        return new Response('OK', { status: 200 });
      } catch (error) {
        console.error('Internal email error:', error);
        return new Response('Error', { status: 500 });
      }
    }
    
    // Serve favicon
    if (path === '/favicon.ico') {
      return getFavicon();
    }
    
    // Serve logo
    if (path === '/logo.svg') {
      return getLogo();
    }
    
    // Serve OG image
    if (path === '/og-image.png') {
      const imageBuffer = Uint8Array.from(atob(OG_IMAGE_BASE64), c => c.charCodeAt(0));
      return new Response(imageBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
    
    // Root endpoint - show homepage or JSON info
    if (path === '/') {
      const accept = request.headers.get('Accept') || '';
      
      // HTML homepage for browsers
      if (accept.includes('text/html')) {
        return new Response(getHomePage(env.EMAIL_DOMAIN), {
          headers: { 'Content-Type': 'text/html' },
        });
      }
      
      // JSON response for API clients
      return new Response(JSON.stringify({
        name: 'mailcat',
        description: 'Receive-only email service for AI agents',
        domain: env.EMAIL_DOMAIN,
        api_docs: `/skill.md`,
        health: '/health',
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Handle API routes
    return handleApi(request, env, path);
  },

  // Email handler (Cloudflare Email Routing)
  async email(message: EmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {
    await handleEmail(message, env);
  },

  // Scheduled handler (Cron Trigger) - cleanup expired data
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    if (!env.DB) {
      console.log('Cleanup skipped: D1 not configured');
      return;
    }
    
    const store = new StoreD1(env.DB, parseInt(env.EMAIL_RETENTION_MS));
    const result = await store.cleanupExpired();
    console.log(`Cleanup completed: ${result.mailboxes} mailboxes, ${result.emails} emails deleted`);
  },
};

// Type for Cloudflare Email Message
interface EmailMessage {
  from: string;
  to: string;
  raw: ReadableStream;
  headers: Headers;
}

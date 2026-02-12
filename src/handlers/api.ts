/**
 * API Router
 * 
 * Routes requests to appropriate handlers
 */

import type { Env } from '../types';
import { createStore } from '../store-factory';
import { corsPreflightResponse, error } from '../utils/response';
import { authenticate } from '../utils/auth';

// Handlers
import { handleCreateMailbox, handleGetStats } from './mailbox';
import { handleGetInbox, handleGetEmail, handleDeleteEmail } from './inbox';
import { handleHealthCheck, handleSkillMd } from './docs';

/**
 * Main API request handler
 */
export async function handleApi(
  request: Request,
  env: Env,
  path: string
): Promise<Response> {
  const store = createStore(env);
  const url = new URL(request.url);
  const method = request.method;
  
  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  // ============================================
  // Public Endpoints (no auth required)
  // ============================================
  
  // POST /mailboxes - Create a new mailbox
  if (path === '/mailboxes' && method === 'POST') {
    return handleCreateMailbox(request, env, store);
  }
  
  // GET /health - Health check
  if (path === '/health' && method === 'GET') {
    return handleHealthCheck();
  }
  
  // GET /skill.md - AI agent documentation
  if (path === '/skill.md' && method === 'GET') {
    return handleSkillMd(env.EMAIL_DOMAIN);
  }

  // ============================================
  // Protected Endpoints (auth required)
  // ============================================
  
  const { mailbox, error: authError } = await authenticate(request, store);
  if (authError) return authError;
  if (!mailbox) return error('unauthorized', 'Authentication failed', 401);
  
  // GET /inbox - List emails
  if (path === '/inbox' && method === 'GET') {
    return handleGetInbox(mailbox, url, store);
  }
  
  // GET/DELETE /emails/:id - Email operations
  const emailMatch = path.match(/^\/emails\/([a-f0-9-]+)$/);
  if (emailMatch) {
    const emailId = emailMatch[1];
    
    if (method === 'GET') {
      return handleGetEmail(emailId, mailbox, store);
    }
    
    if (method === 'DELETE') {
      return handleDeleteEmail(emailId, mailbox, store);
    }
  }
  
  // GET /stats - Mailbox statistics
  if (path === '/stats' && method === 'GET') {
    return handleGetStats(mailbox, store);
  }
  
  // 404 for unknown endpoints
  return error('not_found', 'The requested endpoint does not exist', 404);
}

/**
 * Mailbox creation and management handlers
 */

import type { Env } from '../types';
import type { IStore } from '../store-factory';
import { checkRateLimitWithBackend } from '../store-factory';
import { generateToken, hashToken } from '../utils/crypto';
import { generateEmailName, isValidName } from '../utils/names';
import { json, error, toISO8601 } from '../utils/response';
import { hasTestBypass, rateLimitHeaders } from '../utils/auth';

/**
 * POST /mailboxes - Create a new mailbox
 */
export async function handleCreateMailbox(
  request: Request,
  env: Env,
  store: IStore
): Promise<Response> {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  
  // Rate limit: 60 registrations per hour per IP (1 per minute average)
  const rateLimit = await checkRateLimitWithBackend(env, ip, 'register', 60, 3600000);
  const rlHeaders = rateLimitHeaders(rateLimit);
  
  // Skip rate limit enforcement for test requests with valid bypass token
  if (!rateLimit.allowed && !hasTestBypass(request, env)) {
    return error(
      'rate_limit_exceeded', 
      'Too many requests. Please try again later.', 
      429,
      {
        ...rlHeaders,
        'Retry-After': String(rateLimit.resetAt - Math.floor(Date.now() / 1000)),
      }
    );
  }
  
  let name: string;
  
  // Check for custom name in request body
  try {
    const body = await request.json() as { name?: string };
    if (body.name) {
      if (!isValidName(body.name)) {
        return error('invalid_name', 'Invalid name. Use 3-30 lowercase letters, numbers, hyphens, or underscores.', 400);
      }
      if (await store.nameExists(body.name)) {
        return error('name_taken', 'This mailbox name is already in use.', 409);
      }
      name = body.name;
    } else {
      name = await generateUniqueName(store);
    }
  } catch {
    // No body or invalid JSON - generate random name
    name = await generateUniqueName(store);
  }
  
  const token = generateToken();
  const tokenHash = await hashToken(token);
  const mailbox = await store.createMailbox(name, tokenHash, env.EMAIL_DOMAIN);
  
  return json({
    data: {
      email: mailbox.email,
      token,  // Only time we return the raw token!
    },
    meta: {
      agentHints: {
        suggestion: 'Store the token securely - it cannot be recovered',
        tip: 'Poll GET /inbox every 5-10 minutes for incoming emails',
        nextSteps: [
          'Save token to secure storage',
          'Poll GET /inbox for incoming emails',
          'Read emails with GET /emails/{id}',
        ],
      },
    },
  }, 201, rlHeaders);
}

/**
 * Generate a unique mailbox name
 */
async function generateUniqueName(store: IStore): Promise<string> {
  let name = generateEmailName();
  while (await store.nameExists(name)) {
    name = generateEmailName();
  }
  return name;
}

/**
 * GET /stats - Mailbox statistics
 */
export async function handleGetStats(
  mailbox: { email: string; name: string; createdAt: number; lastActivity: number },
  store: IStore
): Promise<Response> {
  const stats = await store.getMailboxStats(mailbox.name);
  
  return json({
    data: {
      email: mailbox.email,
      createdAt: toISO8601(mailbox.createdAt),
      lastActivity: toISO8601(mailbox.lastActivity),
      emailCount: stats.emailCount,
      unreadCount: stats.unreadCount,
      totalSize: stats.totalSize,
    },
    ...(stats.unreadCount > 0 && {
      meta: {
        agentHints: {
          suggestion: `You have ${stats.unreadCount} unread email${stats.unreadCount > 1 ? 's' : ''}`,
          nextSteps: ['Poll /inbox to retrieve unread emails'],
        },
      },
    }),
  });
}

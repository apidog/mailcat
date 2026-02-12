/**
 * Authentication and rate limiting utilities
 */

import type { Env } from '../types';
import type { IStore } from '../store-factory';
import { hashToken } from './crypto';
import { error } from './response';

/**
 * Authenticate request using Bearer token
 * Returns the mailbox if valid, or an error response
 */
export async function authenticate(
  request: Request,
  store: IStore
): Promise<{ mailbox: Awaited<ReturnType<typeof store.getMailboxByToken>>; error?: Response }> {
  const auth = request.headers.get('Authorization');
  
  if (!auth || !auth.startsWith('Bearer ')) {
    return { 
      mailbox: null, 
      error: error('unauthorized', 'Missing or invalid Authorization header', 401) 
    };
  }
  
  const token = auth.slice(7);
  const tokenHash = await hashToken(token);
  const mailbox = await store.getMailboxByToken(tokenHash);
  
  if (!mailbox) {
    return { 
      mailbox: null, 
      error: error('invalid_token', 'The provided authentication token is invalid or expired', 401) 
    };
  }
  
  return { mailbox };
}

/**
 * Check if request has valid test bypass token
 * Used to skip rate limits in CI/testing
 */
export function hasTestBypass(request: Request, env: Env): boolean {
  const testToken = request.headers.get('X-Test-Token');
  return !!(env.TEST_BYPASS_TOKEN && testToken === env.TEST_BYPASS_TOKEN);
}

/**
 * Rate limit info returned from checkRateLimit
 */
export interface RateLimitInfo {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;  // Unix timestamp in seconds
}

/**
 * IETF Rate Limit headers (draft-ietf-httpapi-ratelimit-headers)
 */
export function rateLimitHeaders(info: RateLimitInfo): Record<string, string> {
  return {
    'RateLimit-Limit': String(info.limit),
    'RateLimit-Remaining': String(info.remaining),
    'RateLimit-Reset': String(info.resetAt),
  };
}

/**
 * Rate limiting using KV with IETF standard headers
 */
export async function checkRateLimit(
  kv: KVNamespace,
  ip: string,
  action: string,
  limit: number,
  windowMs: number
): Promise<RateLimitInfo> {
  const key = `ratelimit:${action}:${ip}`;
  const windowSec = Math.ceil(windowMs / 1000);
  const resetAt = Math.ceil(Date.now() / 1000) + windowSec;
  
  const data = await kv.get(key);
  const count = data ? parseInt(data, 10) : 0;
  
  if (count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt,
    };
  }
  
  await kv.put(key, String(count + 1), {
    expirationTtl: windowSec,
  });
  
  return {
    allowed: true,
    limit,
    remaining: limit - count - 1,
    resetAt,
  };
}

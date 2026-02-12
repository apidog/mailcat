/**
 * Store Factory
 * 
 * Creates the appropriate store based on STORAGE_BACKEND env var
 * - "d1" (default): Use D1 SQL database
 * - "kv": Use KV namespace (legacy)
 */

import type { Env, Mailbox, Email, EmailSummary } from './types';
import { StoreD1 } from './store-d1';
import { Store as StoreKV } from './store-kv';

/**
 * Common store interface for both D1 and KV backends
 */
export interface IStore {
  // Mailbox operations
  createMailbox(name: string, tokenHash: string, domain: string): Promise<Mailbox>;
  getMailboxByName(name: string): Promise<Mailbox | null>;
  getMailboxByToken(tokenHash: string): Promise<Mailbox | null>;
  nameExists(name: string): Promise<boolean>;
  updateLastActivity(name: string): Promise<void>;
  
  // Email operations
  storeEmail(email: Email): Promise<void>;
  getEmail(id: string): Promise<Email | null>;
  markEmailRead(id: string): Promise<void>;
  deleteEmail(id: string, mailboxName: string): Promise<boolean>;
  getEmailsByMailbox(mailboxName: string, limit?: number, offset?: number): Promise<EmailSummary[]>;
  
  // Stats
  getMailboxStats(mailboxName: string): Promise<{
    emailCount: number;
    unreadCount: number;
    totalSize: number;
  }>;
}

/**
 * Adapter to make KV store conform to IStore interface
 */
class StoreKVAdapter implements IStore {
  constructor(private store: StoreKV) {}
  
  createMailbox(name: string, tokenHash: string, domain: string): Promise<Mailbox> {
    return this.store.createMailbox(name, tokenHash, domain);
  }
  
  getMailboxByName(name: string): Promise<Mailbox | null> {
    return this.store.getMailboxByName(name);
  }
  
  getMailboxByToken(tokenHash: string): Promise<Mailbox | null> {
    return this.store.getMailboxByToken(tokenHash);
  }
  
  nameExists(name: string): Promise<boolean> {
    return this.store.nameExists(name);
  }
  
  updateLastActivity(name: string): Promise<void> {
    return this.store.updateLastActivity(name);
  }
  
  storeEmail(email: Email): Promise<void> {
    return this.store.storeEmail(email);
  }
  
  getEmail(id: string): Promise<Email | null> {
    return this.store.getEmail(id);
  }
  
  markEmailRead(id: string): Promise<void> {
    return this.store.markEmailRead(id);
  }
  
  deleteEmail(id: string, mailboxName: string): Promise<boolean> {
    return this.store.deleteEmail(id, mailboxName);
  }
  
  async getEmailsByMailbox(mailboxName: string, limit: number = 50, offset: number = 0): Promise<EmailSummary[]> {
    const { emails } = await this.store.getInbox(mailboxName, limit, offset);
    return emails;
  }
  
  async getMailboxStats(mailboxName: string): Promise<{
    emailCount: number;
    unreadCount: number;
    totalSize: number;
  }> {
    const stats = await this.store.getStats(mailboxName);
    return {
      emailCount: stats.totalEmails,
      unreadCount: stats.unreadEmails,
      totalSize: stats.totalSize,
    };
  }
}

/**
 * Create a store instance based on environment configuration
 */
export function createStore(env: Env): IStore {
  const backend = env.STORAGE_BACKEND?.toLowerCase() || 'd1';
  const retentionMs = parseInt(env.EMAIL_RETENTION_MS);
  
  if (backend === 'kv') {
    if (!env.MAILCAT) {
      throw new Error('KV namespace MAILCAT is required when STORAGE_BACKEND=kv');
    }
    return new StoreKVAdapter(new StoreKV(env.MAILCAT, retentionMs));
  }
  
  // Default to D1
  if (!env.DB) {
    throw new Error('D1 database DB is required when STORAGE_BACKEND=d1');
  }
  return new StoreD1(env.DB, retentionMs);
}

/**
 * Check rate limit - always uses KV for performance
 * KV is better suited for high-frequency rate limiting operations
 */
export async function checkRateLimitWithBackend(
  env: Env,
  ip: string,
  action: string,
  limit: number,
  windowMs: number
): Promise<{
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}> {
  if (!env.MAILCAT) {
    throw new Error('KV namespace MAILCAT is required for rate limiting');
  }
  const { checkRateLimit } = await import('./utils/auth');
  return checkRateLimit(env.MAILCAT, ip, action, limit, windowMs);
}

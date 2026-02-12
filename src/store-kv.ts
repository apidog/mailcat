import type { Env, Mailbox, Email, EmailSummary } from './types';

// Key prefixes for KV storage
const MAILBOX_PREFIX = 'mailbox:';
const TOKEN_PREFIX = 'token:';
const EMAIL_PREFIX = 'email:';
const EMAIL_LIST_PREFIX = 'emails:';

export class Store {
  constructor(private kv: KVNamespace, private retentionMs: number) {}

  // === Mailbox Operations ===
  
  async createMailbox(name: string, tokenHash: string, domain: string): Promise<Mailbox> {
    const now = Date.now();
    const mailbox: Mailbox = {
      email: `${name}@${domain}`,
      name,
      tokenHash,
      createdAt: now,
      lastActivity: now,
    };
    
    // Store mailbox by name
    await this.kv.put(
      `${MAILBOX_PREFIX}${name}`,
      JSON.stringify(mailbox)
    );
    
    // Store token -> name mapping for auth
    await this.kv.put(
      `${TOKEN_PREFIX}${tokenHash}`,
      name
    );
    
    // Initialize email list
    await this.kv.put(
      `${EMAIL_LIST_PREFIX}${name}`,
      JSON.stringify([])
    );
    
    return mailbox;
  }
  
  async getMailboxByName(name: string): Promise<Mailbox | null> {
    const data = await this.kv.get(`${MAILBOX_PREFIX}${name}`);
    return data ? JSON.parse(data) : null;
  }
  
  async getMailboxByToken(tokenHash: string): Promise<Mailbox | null> {
    const name = await this.kv.get(`${TOKEN_PREFIX}${tokenHash}`);
    if (!name) return null;
    return this.getMailboxByName(name);
  }
  
  async nameExists(name: string): Promise<boolean> {
    const mailbox = await this.getMailboxByName(name);
    return mailbox !== null;
  }
  
  async updateLastActivity(name: string): Promise<void> {
    const mailbox = await this.getMailboxByName(name);
    if (mailbox) {
      mailbox.lastActivity = Date.now();
      await this.kv.put(`${MAILBOX_PREFIX}${name}`, JSON.stringify(mailbox));
    }
  }

  // === Email Operations ===
  
  async storeEmail(email: Email): Promise<void> {
    // Store the email with expiration
    await this.kv.put(
      `${EMAIL_PREFIX}${email.id}`,
      JSON.stringify(email),
      { expirationTtl: Math.ceil(this.retentionMs / 1000) }
    );
    
    // Add to mailbox's email list
    const listKey = `${EMAIL_LIST_PREFIX}${email.mailboxName}`;
    const listData = await this.kv.get(listKey);
    const emailIds: string[] = listData ? JSON.parse(listData) : [];
    emailIds.unshift(email.id); // Add to front (newest first)
    
    // Keep only recent emails
    const maxEmails = 100;
    if (emailIds.length > maxEmails) {
      emailIds.splice(maxEmails);
    }
    
    await this.kv.put(listKey, JSON.stringify(emailIds));
    
    // Update mailbox activity
    await this.updateLastActivity(email.mailboxName);
  }
  
  async getEmail(id: string): Promise<Email | null> {
    const data = await this.kv.get(`${EMAIL_PREFIX}${id}`);
    return data ? JSON.parse(data) : null;
  }
  
  async markEmailRead(id: string): Promise<void> {
    const email = await this.getEmail(id);
    if (email) {
      email.read = true;
      await this.kv.put(
        `${EMAIL_PREFIX}${id}`,
        JSON.stringify(email),
        { expirationTtl: Math.ceil(this.retentionMs / 1000) }
      );
    }
  }
  
  async deleteEmail(id: string, mailboxName: string): Promise<boolean> {
    const email = await this.getEmail(id);
    if (!email || email.mailboxName !== mailboxName) {
      return false;
    }
    
    // Delete the email
    await this.kv.delete(`${EMAIL_PREFIX}${id}`);
    
    // Remove from list
    const listKey = `${EMAIL_LIST_PREFIX}${mailboxName}`;
    const listData = await this.kv.get(listKey);
    if (listData) {
      const emailIds: string[] = JSON.parse(listData);
      const filtered = emailIds.filter(eid => eid !== id);
      await this.kv.put(listKey, JSON.stringify(filtered));
    }
    
    return true;
  }
  
  async getInbox(mailboxName: string, limit = 20, offset = 0): Promise<{
    emails: EmailSummary[];
    total: number;
    unread: number;
  }> {
    const listKey = `${EMAIL_LIST_PREFIX}${mailboxName}`;
    const listData = await this.kv.get(listKey);
    const emailIds: string[] = listData ? JSON.parse(listData) : [];
    
    // Filter out expired emails and get summaries
    const validEmails: EmailSummary[] = [];
    let unread = 0;
    
    for (const id of emailIds) {
      const email = await this.getEmail(id);
      if (email) {
        if (!email.read) unread++;
        validEmails.push({
          id: email.id,
          from: email.from,
          subject: email.subject,
          receivedAt: email.receivedAt,
          read: email.read,
        });
      }
    }
    
    // Update list to remove expired
    if (validEmails.length !== emailIds.length) {
      await this.kv.put(
        listKey,
        JSON.stringify(validEmails.map(e => e.id))
      );
    }
    
    return {
      emails: validEmails.slice(offset, offset + limit),
      total: validEmails.length,
      unread,
    };
  }
  
  async getStats(mailboxName: string): Promise<{
    totalEmails: number;
    unreadEmails: number;
    totalSize: number;
  }> {
    const { total, unread } = await this.getInbox(mailboxName, 1000, 0);
    
    // Calculate total size
    let totalSize = 0;
    const listData = await this.kv.get(`${EMAIL_LIST_PREFIX}${mailboxName}`);
    if (listData) {
      const emailIds: string[] = JSON.parse(listData);
      for (const id of emailIds) {
        const email = await this.getEmail(id);
        if (email) totalSize += email.size;
      }
    }
    
    return {
      totalEmails: total,
      unreadEmails: unread,
      totalSize,
    };
  }
}

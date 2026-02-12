import type { Mailbox, Email, EmailSummary } from './types';

/**
 * D1-based storage for MailCat
 * 
 * Schema is managed via D1 migrations (db/migrations/)
 * Run: npx wrangler d1 migrations apply mailcat --remote
 */
export class StoreD1 {
  constructor(private db: D1Database, private retentionMs: number) {}

  // === Mailbox Operations ===

  async createMailbox(name: string, tokenHash: string, domain: string): Promise<Mailbox> {
    
    const now = Date.now();
    const email = `${name}@${domain}`;

    // Mailboxes never expire (expires_at = NULL)
    await this.db
      .prepare(
        `INSERT INTO mailboxes (name, email, token_hash, created_at, last_activity, expires_at)
         VALUES (?, ?, ?, ?, ?, NULL)`
      )
      .bind(name, email, tokenHash, now, now)
      .run();

    return {
      email,
      name,
      tokenHash,
      createdAt: now,
      lastActivity: now,
    };
  }

  async getMailboxByName(name: string): Promise<Mailbox | null> {
    const result = await this.db
      .prepare(
        `SELECT name, email, token_hash, created_at, last_activity
         FROM mailboxes
         WHERE name = ?`
      )
      .bind(name)
      .first<{
        name: string;
        email: string;
        token_hash: string;
        created_at: number;
        last_activity: number;
      }>();

    if (!result) return null;

    return {
      name: result.name,
      email: result.email,
      tokenHash: result.token_hash,
      createdAt: result.created_at,
      lastActivity: result.last_activity,
    };
  }

  async nameExists(name: string): Promise<boolean> {
    const result = await this.db
      .prepare(`SELECT 1 FROM mailboxes WHERE name = ?`)
      .bind(name)
      .first();
    return result !== null;
  }

  async getMailboxByToken(tokenHash: string): Promise<Mailbox | null> {
    const result = await this.db
      .prepare(
        `SELECT name, email, token_hash, created_at, last_activity
         FROM mailboxes
         WHERE token_hash = ?`
      )
      .bind(tokenHash)
      .first<{
        name: string;
        email: string;
        token_hash: string;
        created_at: number;
        last_activity: number;
      }>();

    if (!result) return null;

    return {
      name: result.name,
      email: result.email,
      tokenHash: result.token_hash,
      createdAt: result.created_at,
      lastActivity: result.last_activity,
    };
  }

  async updateLastActivity(name: string): Promise<void> {
    const now = Date.now();

    await this.db
      .prepare(
        `UPDATE mailboxes
         SET last_activity = ?
         WHERE name = ?`
      )
      .bind(now, name)
      .run();
  }

  // === Email Operations ===

  async storeEmail(email: Email): Promise<void> {
    const expiresAt = Date.now() + this.retentionMs;

    await this.db
      .prepare(
        `INSERT INTO emails (id, mailbox_name, from_address, from_name, to_address, subject, body_text, body_html, received_at, read, size, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        email.id,
        email.mailboxName,
        email.from,
        email.fromName || null,
        email.to,
        email.subject,
        email.bodyText,
        email.bodyHtml || null,
        email.receivedAt,
        email.read ? 1 : 0,
        email.size,
        expiresAt
      )
      .run();

    // Update mailbox activity
    await this.updateLastActivity(email.mailboxName);
  }

  async getEmail(id: string): Promise<Email | null> {
    const result = await this.db
      .prepare(
        `SELECT id, mailbox_name, from_address, from_name, to_address, subject, body_text, body_html, received_at, read, size
         FROM emails
         WHERE id = ? AND expires_at > ?`
      )
      .bind(id, Date.now())
      .first<{
        id: string;
        mailbox_name: string;
        from_address: string;
        from_name: string | null;
        to_address: string;
        subject: string;
        body_text: string;
        body_html: string | null;
        received_at: number;
        read: number;
        size: number;
      }>();

    if (!result) return null;

    return {
      id: result.id,
      mailboxName: result.mailbox_name,
      from: result.from_address,
      fromName: result.from_name || undefined,
      to: result.to_address,
      subject: result.subject,
      bodyText: result.body_text,
      bodyHtml: result.body_html || undefined,
      receivedAt: result.received_at,
      read: result.read === 1,
      size: result.size,
    };
  }

  async markEmailRead(id: string): Promise<void> {
    await this.db
      .prepare(`UPDATE emails SET read = 1 WHERE id = ?`)
      .bind(id)
      .run();
  }

  async deleteEmail(id: string, mailboxName: string): Promise<boolean> {
    const result = await this.db
      .prepare(`DELETE FROM emails WHERE id = ? AND mailbox_name = ?`)
      .bind(id, mailboxName)
      .run();

    return (result.meta?.changes ?? 0) > 0;
  }

  async getEmailsByMailbox(
    mailboxName: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<EmailSummary[]> {
    const results = await this.db
      .prepare(
        `SELECT id, from_address, subject, received_at, read
         FROM emails
         WHERE mailbox_name = ? AND expires_at > ?
         ORDER BY received_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(mailboxName, Date.now(), limit, offset)
      .all<{
        id: string;
        from_address: string;
        subject: string;
        received_at: number;
        read: number;
      }>();

    return (results.results || []).map((row) => ({
      id: row.id,
      from: row.from_address,
      subject: row.subject,
      receivedAt: row.received_at,
      read: row.read === 1,
    }));
  }

  async getEmailCount(mailboxName: string): Promise<number> {
    const result = await this.db
      .prepare(
        `SELECT COUNT(*) as count
         FROM emails
         WHERE mailbox_name = ? AND expires_at > ?`
      )
      .bind(mailboxName, Date.now())
      .first<{ count: number }>();

    return result?.count ?? 0;
  }

  async getMailboxStats(mailboxName: string): Promise<{
    emailCount: number;
    unreadCount: number;
    totalSize: number;
  }> {
    const result = await this.db
      .prepare(
        `SELECT 
           COUNT(*) as email_count,
           SUM(CASE WHEN read = 0 THEN 1 ELSE 0 END) as unread_count,
           COALESCE(SUM(size), 0) as total_size
         FROM emails
         WHERE mailbox_name = ? AND expires_at > ?`
      )
      .bind(mailboxName, Date.now())
      .first<{
        email_count: number;
        unread_count: number;
        total_size: number;
      }>();

    return {
      emailCount: result?.email_count ?? 0,
      unreadCount: result?.unread_count ?? 0,
      totalSize: result?.total_size ?? 0,
    };
  }

  // === Cleanup Operations ===

  /**
   * Clean up expired mailboxes and emails
   * Should be called periodically (e.g., via cron trigger)
   */
  async cleanupExpired(): Promise<{ mailboxes: number; emails: number }> {
    const now = Date.now();

    // Only clean up expired emails; mailboxes never expire
    const emailResult = await this.db
      .prepare(`DELETE FROM emails WHERE expires_at <= ?`)
      .bind(now)
      .run();

    return {
      mailboxes: 0,
      emails: emailResult.meta?.changes ?? 0,
    };
  }
}

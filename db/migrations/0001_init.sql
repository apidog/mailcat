-- MailCat D1 Schema
-- Mailboxes and emails storage with automatic expiration

-- Mailboxes table
CREATE TABLE IF NOT EXISTS mailboxes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  token_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_activity INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

-- Index for token lookup (auth)
CREATE INDEX IF NOT EXISTS idx_mailboxes_token_hash ON mailboxes(token_hash);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_mailboxes_expires_at ON mailboxes(expires_at);

-- Emails table
CREATE TABLE IF NOT EXISTS emails (
  id TEXT PRIMARY KEY,
  mailbox_name TEXT NOT NULL,
  from_address TEXT NOT NULL,
  from_name TEXT,
  to_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  body_html TEXT,
  received_at INTEGER NOT NULL,
  read INTEGER DEFAULT 0,
  size INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (mailbox_name) REFERENCES mailboxes(name) ON DELETE CASCADE
);

-- Index for mailbox email listing
CREATE INDEX IF NOT EXISTS idx_emails_mailbox_name ON emails(mailbox_name);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_emails_expires_at ON emails(expires_at);

-- Index for received_at ordering
CREATE INDEX IF NOT EXISTS idx_emails_received_at ON emails(mailbox_name, received_at DESC);

-- Note: Rate limiting uses KV, not D1 (for better performance)

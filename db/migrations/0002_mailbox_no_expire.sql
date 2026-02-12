-- Mailboxes should never expire (only emails expire)
-- SQLite doesn't support ALTER COLUMN, so we recreate the table

-- Create new table without NOT NULL on expires_at
CREATE TABLE mailboxes_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  token_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_activity INTEGER NOT NULL,
  expires_at INTEGER
);

-- Copy data
INSERT INTO mailboxes_new (id, name, email, token_hash, created_at, last_activity, expires_at)
  SELECT id, name, email, token_hash, created_at, last_activity, NULL FROM mailboxes;

-- Drop old table
DROP TABLE mailboxes;

-- Rename new table
ALTER TABLE mailboxes_new RENAME TO mailboxes;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_mailboxes_token_hash ON mailboxes(token_hash);

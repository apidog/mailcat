export interface Env {
  // Database bindings
  DB?: D1Database;         // D1 database (preferred)
  MAILCAT?: KVNamespace;   // KV namespace (legacy)
  
  // Storage backend selection: "d1" (default) or "kv"
  STORAGE_BACKEND?: string;
  
  STAGING_WORKER?: Fetcher;  // Service binding to staging worker for email forwarding
  EMAIL_DOMAIN: string;
  STAGING_EMAIL_DOMAIN?: string;  // Domain to route to staging worker (e.g., staging.mailcat.ai)
  EMAIL_RETENTION_MS: string;
  WEBHOOK_SECRET?: string;
  TEST_BYPASS_TOKEN?: string;  // Token to bypass rate limits in tests
}

// Cloudflare Service Binding type
interface Fetcher {
  fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
}

export interface Mailbox {
  email: string;
  name: string;
  tokenHash: string;
  createdAt: number;
  lastActivity: number;
}

export interface Email {
  id: string;
  mailboxName: string;
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  receivedAt: number;
  read: boolean;
  size: number;
}

export interface EmailSummary {
  id: string;
  from: string;
  subject: string;
  receivedAt: number;
  read: boolean;
}

export interface ExtractedData {
  code: string | null;
  links: string[] | null;
}

/**
 * Standard API response envelope
 * Following the strict envelope pattern: data + meta
 */
export interface ApiResponse {
  data?: unknown;
  meta?: {
    agentHints?: {
      suggestion?: string;
      tip?: string;
      nextSteps?: string[];
      warning?: string;
    };
    pagination?: {
      offset?: number;
      limit?: number;
      totalCount?: number;
      hasMore?: boolean;
    };
    [key: string]: unknown;
  };
}

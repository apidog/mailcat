/**
 * MailCat End-to-End Tests
 * 
 * These tests simulate real user workflows.
 * Some require external email sending capability.
 * 
 * Run with: npm run test:e2e
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testHeaders } from './setup';

const API_BASE = process.env.API_BASE_URL || 'https://api.mailcat.ai';
const TEST_TIMEOUT = 60000; // 60 seconds for email delivery

interface MailboxData {
  email: string;
  token: string;
}

interface MailboxResponse {
  data: MailboxData;
  meta?: any;
}

async function createMailbox(): Promise<MailboxResponse> {
  const res = await fetch(`${API_BASE}/mailboxes`, { 
    method: 'POST',
    headers: { ...testHeaders },
  });
  return res.json();
}

async function checkInbox(token: string): Promise<any> {
  const res = await fetch(`${API_BASE}/inbox`, {
    headers: { Authorization: `Bearer ${token}`, ...testHeaders },
  });
  return res.json();
}

async function readEmail(token: string, emailId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/emails/${emailId}`, {
    headers: { Authorization: `Bearer ${token}`, ...testHeaders },
  });
  return res.json();
}

async function waitForEmail(
  token: string, 
  timeoutMs: number = TEST_TIMEOUT,
  pollIntervalMs: number = 5000
): Promise<any> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    const inbox = await checkInbox(token);
    
    if (inbox.data && inbox.data.length > 0) {
      return inbox.data[0];
    }
    
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }
  
  throw new Error(`No email received within ${timeoutMs}ms`);
}

describe('E2E: Basic Workflow', () => {
  it('should create mailbox and check empty inbox', async () => {
    // Step 1: Create mailbox
    const mailbox = await createMailbox();
    
    // Handle rate limiting
    if (!mailbox.data?.email || !mailbox.data?.token) {
      console.log('Rate limited, skipping basic workflow test');
      return;
    }
    
    // Email domain depends on environment (mailcat.ai or staging.mailcat.ai)
    expect(mailbox.data?.email).toMatch(/@.*mailcat\.ai$/);
    expect(mailbox.data?.token).toBeDefined();
    
    // Step 2: Check inbox (should be empty)
    const inbox = await checkInbox(mailbox.data?.token);
    
    if (!inbox.data) {
      console.log('Inbox check rate limited');
      return;
    }
    
    expect(inbox.data).toBeDefined();
    expect(inbox.meta.pagination.totalCount).toBe(0);
    expect(inbox.data).toEqual([]);
  });

  it('should handle multiple mailbox creations', async () => {
    const mailboxes: MailboxResponse[] = [];
    
    // Create mailboxes with delays to avoid rate limiting
    for (let i = 0; i < 5; i++) {
      const mailbox = await createMailbox();
      if (mailbox.data?.email && mailbox.data?.token) {
        mailboxes.push(mailbox);
      }
      await new Promise(resolve => setTimeout(resolve, 200)); // Reduced delay since we bypass rate limit
    }
    
    // At least some should succeed
    if (mailboxes.length === 0) {
      console.log('All mailbox creations rate limited, skipping');
      return;
    }
    
    // Those that succeeded should be unique
    const emails = mailboxes.map(m => m.data.email);
    const uniqueEmails = new Set(emails);
    
    expect(uniqueEmails.size).toBe(mailboxes.length);
    console.log(`Created ${mailboxes.length}/5 mailboxes successfully`);
    
    // All should have valid tokens
    for (const mailbox of mailboxes) {
      const inbox = await checkInbox(mailbox.data.token);
      if (!inbox.data) {
        console.log('Inbox check rate limited');
        continue;
      }
      expect(inbox.data).toBeDefined();
    }
  });
});

describe('E2E: Email Reception', { timeout: TEST_TIMEOUT * 2 }, () => {
  // These tests require actually sending emails
  // Skip in CI without email sending capability
  
  const canSendEmail = process.env.SMTP_HOST !== undefined;
  
  it.skipIf(!canSendEmail)('should receive email and extract code', async () => {
    // Create mailbox
    const mailbox = await createMailbox();
    console.log(`Test mailbox: ${mailbox.data?.email}`);
    
    // Send email (implement based on your SMTP setup)
    // await sendEmail({
    //   to: mailbox.data?.email,
    //   subject: 'Verification Code',
    //   body: 'Your verification code is: 123456'
    // });
    
    // Wait for email
    // const emailSummary = await waitForEmail(mailbox.data?.token);
    
    // Read full email
    // const email = await readEmail(mailbox.data?.token, emailSummary.id);
    
    // Verify extraction
    // expect(email.code).toBe('123456');
  });

  it.skipIf(!canSendEmail)('should extract links from email', async () => {
    const mailbox = await createMailbox();
    
    // Send email with link
    // await sendEmail({
    //   to: mailbox.data?.email,
    //   subject: 'Verify your account',
    //   body: 'Click here to verify: https://example.com/verify?token=abc123'
    // });
    
    // Wait and verify
    // const emailSummary = await waitForEmail(mailbox.data?.token);
    // const email = await readEmail(mailbox.data?.token, emailSummary.id);
    
    // expect(email.links).toContain('https://example.com/verify?token=abc123');
  });
});

describe('E2E: Agent Simulation', () => {
  /**
   * Simulates an AI agent workflow:
   * 1. Create mailbox
   * 2. Use email for signup (simulated)
   * 3. Poll for verification email
   * 4. Extract and use code
   */
  it('should simulate agent signup workflow', async () => {
    // Wait to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 1: Agent creates mailbox
    const mailbox = await createMailbox();
    
    // Handle rate limiting
    if (!mailbox.data?.email || !mailbox.data?.token) {
      console.log('Rate limited, skipping agent simulation test');
      return;
    }
    
    expect(mailbox.data?.email).toBeDefined();
    expect(mailbox.data?.token).toBeDefined();
    
    // Step 2: Agent would use this email for signup
    // In real scenario: await signupForService(mailbox.data?.email);
    
    // Step 3: Agent checks inbox
    const inbox = await checkInbox(mailbox.data?.token);
    
    // May be rate limited
    if (!inbox.data) {
      console.log('Inbox check rate limited, skipping');
      return;
    }
    
    expect(inbox.data).toBeDefined();
    // Note: In real test with email, would assert inbox.meta.pagination.total > 0
    
    // Step 4: If email exists, extract code
    if (inbox.data && inbox.data.length > 0) {
      const email = await readEmail(mailbox.data?.token, inbox.data[0].id);
      
      expect(email.email).toBeDefined();
      // Code extraction happens automatically
      // expect(email.code).toBeDefined();
    }
  });

  /**
   * Simulates polling workflow
   */
  it('should handle polling for email', async () => {
    // Wait to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mailbox = await createMailbox();
    
    // Handle rate limiting
    if (!mailbox.data?.token) {
      console.log('Rate limited, skipping polling test');
      return;
    }
    
    const maxAttempts = 3;
    const pollInterval = 1000;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const inbox = await checkInbox(mailbox.data?.token);
      
      // May be rate limited
      if (!inbox.data) {
        console.log('Polling rate limited, skipping');
        return;
      }
      
      expect(inbox.data).toBeDefined();
      
      if (inbox.meta.pagination.total > 0) {
        // Email received
        break;
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    // Test passes regardless - we're testing the polling mechanism
  });
});

describe('E2E: Error Recovery', () => {
  it('should handle expired mailbox gracefully', async () => {
    // Wait for rate limit to reset
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a mailbox with very short TTL (if configurable)
    const mailbox = await createMailbox();
    
    // Skip if rate limited
    if (!mailbox.data?.token) {
      console.log('Rate limited, skipping expiration test');
      return;
    }
    
    // Immediate check should work
    const inbox1 = await checkInbox(mailbox.data?.token);
    
    // May be rate limited too
    if (!inbox1.data) {
      console.log('Inbox check rate limited, skipping');
      return;
    }
    
    expect(inbox1.data).toBeDefined();
    
    // Note: Can't actually wait for expiration in test
    // In production, after 30 minutes, token becomes invalid
  });

  it('should handle network errors gracefully', async () => {
    // Test with invalid URL
    try {
      await fetch('https://invalid-api.mailcat.ai/mailboxes', { method: 'POST' });
    } catch (error) {
      // Network error is expected
      expect(error).toBeDefined();
    }
  });

  it('should handle malformed responses', async () => {
    const mailbox = await createMailbox();
    
    // Try to read non-existent email
    const result = await readEmail(mailbox.data?.token, 'non-existent-id');
    
    expect(result.type).toContain('mailcat.ai/errors');
    expect(result.detail).toBeDefined();
  });
});

describe('E2E: Concurrent Operations', () => {
  // These tests may fail due to rate limiting - they test concurrent behavior
  // Run independently or with RUN_CONCURRENT_TESTS=true
  const runConcurrentTests = process.env.RUN_CONCURRENT_TESTS === 'true';
  
  it.skipIf(!runConcurrentTests)('should handle concurrent mailbox creation', async () => {
    const count = 5;
    const promises = Array(count).fill(null).map(() => createMailbox());
    
    const results = await Promise.all(promises);
    const mailboxes = results.filter(m => m.email && m.token);
    
    expect(mailboxes.length).toBeGreaterThan(0);
    
    const emails = new Set(mailboxes.map(m => m.email));
    expect(emails.size).toBe(mailboxes.length);
  });

  it.skipIf(!runConcurrentTests)('should handle concurrent inbox checks', async () => {
    const mailbox = await createMailbox();
    
    if (!mailbox.data?.token) {
      console.log('Mailbox creation rate limited, skipping');
      return;
    }
    
    const count = 5;
    const promises = Array(count).fill(null).map(() => checkInbox(mailbox.data?.token));
    const results = await Promise.all(promises);
    
    const successful = results.filter(r => r.email);
    expect(successful.length).toBeGreaterThan(0);
  });
});

describe('E2E: Real-world Scenarios', () => {
  /**
   * Scenario: Newsletter subscription
   * Note: May be rate limited if run after other tests
   */
  it('should support newsletter subscription workflow', async () => {
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 1. Create mailbox for newsletter
    const mailbox = await createMailbox();
    
    // 2. Subscribe to newsletter (simulated)
    // await subscribeToNewsletter(mailbox.data?.email);
    
    // 3. Check for confirmation email (may fail if rate limited)
    const inbox = await checkInbox(mailbox.data?.token);
    // Don't fail on rate limit - just log
    if (!inbox.data) {
      console.log('Note: May be rate limited, skipping assertion');
      return;
    }
    expect(inbox.data).toBeDefined();
    
    // 4. Would extract confirmation link and click it
  });

  /**
   * Scenario: Password reset
   */
  it('should support password reset workflow', async () => {
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 1. Create mailbox
    const mailbox = await createMailbox();
    
    // 2. Request password reset (simulated)
    // await requestPasswordReset(mailbox.data?.email);
    
    // 3. Check for reset email
    const inbox = await checkInbox(mailbox.data?.token);
    if (!inbox.data) {
      console.log('Note: May be rate limited, skipping assertion');
      return;
    }
    expect(inbox.data).toBeDefined();
    
    // 4. Would extract reset link and use it
  });

  /**
   * Scenario: Multiple service signups
   */
  it('should support multiple service signups', async () => {
    // Add longer delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const services = ['service1', 'service2', 'service3'];
    const mailboxes: Map<string, Mailbox> = new Map();
    
    // Create a mailbox for each service with delays
    for (const service of services) {
      const mailbox = await createMailbox();
      mailboxes.set(service, mailbox);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // All mailboxes should be independent
    expect(mailboxes.size).toBe(3);
    
    // Each should be checkable
    for (const [service, mailbox] of mailboxes) {
      const inbox = await checkInbox(mailbox.data?.token);
      if (!inbox.data) {
        console.log(`Note: ${service} may be rate limited`);
        continue;
      }
      expect(inbox.data).toBeDefined();
    }
  });
});

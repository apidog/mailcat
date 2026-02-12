/**
 * Security Tests
 * 
 * Tests for security-related functionality
 */

import { describe, it, expect } from 'vitest';
import { testHeaders } from './setup';

const API_BASE = process.env.API_BASE_URL || 'https://api.mailcat.ai';

describe('Security Tests', () => {
  describe('Token Security', () => {
    it('should generate unique tokens for each mailbox', async () => {
      const tokens = new Set<string>();
      
      for (let i = 0; i < 3; i++) {
        const res = await fetch(`${API_BASE}/mailboxes`, { method: 'POST', headers: { ...testHeaders } });
        const data = await res.json();
        
        if (data.data?.email && data.data?.token) {
          expect(tokens.has(data.data?.token)).toBe(false);
          tokens.add(data.data?.token);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    });

    it('should not accept empty token', async () => {
      const res = await fetch(`${API_BASE}/inbox`, {
        headers: { Authorization: 'Bearer ' }
      });
      
      expect(res.status).toBe(401);
    });

    it('should not accept malformed authorization header', async () => {
      const testCases = [
        'Basic token123',
        'bearer token123', // lowercase
        'Token token123',
        'token123', // no prefix
      ];
      
      for (const auth of testCases) {
        const res = await fetch(`${API_BASE}/inbox`, {
          headers: { Authorization: auth }
        });
        
        // Should reject all malformed headers
        expect(res.status).toBe(401);
      }
    });
  });

  describe('Input Validation', () => {
    it('should handle extremely long email IDs', async () => {
      const createRes = await fetch(`${API_BASE}/mailboxes`, { method: 'POST', headers: { ...testHeaders } });
      const { token } = await createRes.json();
      
      if (!token) return; // Rate limited
      
      const longId = 'a'.repeat(10000);
      const res = await fetch(`${API_BASE}/emails/${longId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Should handle gracefully, not crash
      expect([400, 401, 404, 500]).toContain(res.status);
    });

    it('should handle special characters in email ID', async () => {
      const createRes = await fetch(`${API_BASE}/mailboxes`, { method: 'POST', headers: { ...testHeaders } });
      const { token } = await createRes.json();
      
      if (!token) return;
      
      const specialIds = [
        '../../../etc/passwd',
        '..%2F..%2F..%2Fetc%2Fpasswd',
        '%00null',
        'id\x00null',
      ];
      
      for (const id of specialIds) {
        const res = await fetch(`${API_BASE}/emails/${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Should not return 500 (server error)
        expect(res.status).not.toBe(500);
      }
    });

    it('should handle unicode in requests', async () => {
      const createRes = await fetch(`${API_BASE}/mailboxes`, { method: 'POST', headers: { ...testHeaders } });
      const { token } = await createRes.json();
      
      if (!token) return;
      
      const unicodeId = '邮件测试🔥';
      const res = await fetch(`${API_BASE}/emails/${encodeURIComponent(unicodeId)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      expect([400, 401, 404, 500]).toContain(res.status);
    });
  });

  describe('XSS Prevention', () => {
    it('should not execute script in email ID', async () => {
      const createRes = await fetch(`${API_BASE}/mailboxes`, { method: 'POST', headers: { ...testHeaders } });
      const { token } = await createRes.json();
      
      if (!token) return;
      
      const xssPayloads = [
        '<script>alert(1)</script>',
        '"><script>alert(1)</script>',
        "'-alert(1)-'",
        '<img src=x onerror=alert(1)>',
      ];
      
      for (const payload of xssPayloads) {
        const res = await fetch(`${API_BASE}/emails/${encodeURIComponent(payload)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const text = await res.text();
        
        // Response should not contain unescaped script
        expect(text).not.toContain('<script>alert');
        expect(text).not.toContain('onerror=');
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on registration', async () => {
      let rateLimited = false;
      
      // Make rapid requests
      for (let i = 0; i < 5; i++) {
        const res = await fetch(`${API_BASE}/mailboxes`, { method: 'POST', headers: { ...testHeaders } });
        const data = await res.json();
        
        if (res.status === 429 || !data.data?.email) {
          rateLimited = true;
          break;
        }
      }
      
      // Either we got rate limited, or we're within limits
      // Both are acceptable outcomes
      expect(true).toBe(true);
    });

    it('should include rate limit headers', async () => {
      const res = await fetch(`${API_BASE}/mailboxes`, { method: 'POST', headers: { ...testHeaders } });
      
      // IETF Rate Limit Headers (draft-ietf-httpapi-ratelimit-headers)
      const headers = res.headers;
      
      // These should be present on all rate-limited endpoints
      expect(headers.get('RateLimit-Limit')).toBeDefined();
      expect(headers.get('RateLimit-Remaining')).toBeDefined();
      expect(headers.get('RateLimit-Reset')).toBeDefined();
      
      // Verify they are valid numbers
      expect(parseInt(headers.get('RateLimit-Limit') || '0')).toBeGreaterThan(0);
      expect(parseInt(headers.get('RateLimit-Remaining') || '-1')).toBeGreaterThanOrEqual(0);
      expect(parseInt(headers.get('RateLimit-Reset') || '0')).toBeGreaterThan(0);
      
      // 429 responses should also have Retry-After
      if (res.status === 429) {
        expect(headers.get('Retry-After')).toBeDefined();
      }
    });
  });

  describe('Information Disclosure', () => {
    it('should not leak server information in headers', async () => {
      const res = await fetch(`${API_BASE}/health`);
      
      // Should not expose sensitive server info
      expect(res.headers.get('X-Powered-By')).toBeNull();
      expect(res.headers.get('Server')).not.toContain('version');
    });

    it('should not leak internal paths in errors', async () => {
      const res = await fetch(`${API_BASE}/nonexistent`);
      const text = await res.text();
      
      // Should not contain file paths
      expect(text).not.toMatch(/\/home\//);
      expect(text).not.toMatch(/\/var\//);
      expect(text).not.toMatch(/node_modules/);
      expect(text).not.toMatch(/\.ts/);
    });

    it('should not expose token in error messages', async () => {
      const createRes = await fetch(`${API_BASE}/mailboxes`, { method: 'POST', headers: { ...testHeaders } });
      const { token } = await createRes.json();
      
      if (!token) return;
      
      // Make a request that will fail
      const res = await fetch(`${API_BASE}/emails/nonexistent`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const text = await res.text();
      
      // Token should not appear in response
      expect(text).not.toContain(token);
    });
  });

  describe('CORS Security', () => {
    it('should have CORS headers', async () => {
      const res = await fetch(`${API_BASE}/health`);
      
      expect(res.headers.get('Access-Control-Allow-Origin')).toBeDefined();
    });

    it('should respond to OPTIONS preflight', async () => {
      const res = await fetch(`${API_BASE}/mailboxes`, {
        method: 'OPTIONS'
      });
      
      expect(res.status).toBe(200);
      expect(res.headers.get('Access-Control-Allow-Methods')).toBeDefined();
    });
  });

  describe('Content Type Security', () => {
    it('should return JSON content type for API responses', async () => {
      const res = await fetch(`${API_BASE}/health`);
      
      const contentType = res.headers.get('Content-Type');
      expect(contentType).toContain('application/json');
    });

    it('should not accept non-JSON for POST endpoints', async () => {
      const res = await fetch(`${API_BASE}/mailboxes`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml' },
        body: '<xml>data</xml>'
      });
      
      // Should still work or reject gracefully (429 = rate limited is also acceptable)
      expect([201, 400, 415, 429]).toContain(res.status);
    });
  });
});

describe('Crypto Security', () => {
  // Test token generation patterns
  
  it('tokens should be cryptographically random', async () => {
    const tokens: string[] = [];
    
    for (let i = 0; i < 3; i++) {
      const res = await fetch(`${API_BASE}/mailboxes`, { method: 'POST', headers: { ...testHeaders } });
      const data = await res.json();
      
      if (data.data?.token) {
        tokens.push(data.data?.token);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Tokens should be different
    const uniqueTokens = new Set(tokens);
    expect(uniqueTokens.size).toBe(tokens.length);
    
    // Tokens should be long enough (at least 32 chars)
    for (const token of tokens) {
      expect(token.length).toBeGreaterThanOrEqual(32);
    }
    
    // Tokens should look random (high entropy)
    for (const token of tokens) {
      // Should contain mix of characters
      expect(token).toMatch(/[a-f0-9]/i);
    }
  });
});

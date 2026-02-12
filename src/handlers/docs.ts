/**
 * Documentation endpoints
 */

import { json, corsHeaders, toISO8601 } from '../utils/response';

/**
 * GET /health - Health check
 */
export function handleHealthCheck(): Response {
  return json({
    data: {
      status: 'healthy',
      version: '1.0.0',
      timestamp: toISO8601(Date.now()),
    },
  });
}

/**
 * GET /skill.md - Serve skill documentation for AI agents
 */
export function handleSkillMd(domain: string): Response {
  const skillMd = `---
name: mailcat
version: 1.0.0
description: Give your AI agent (e.g., OpenClaw) its own email address. Instant mailbox, auto verification code extraction.
homepage: https://${domain}
api_base: https://api.${domain}
license: MIT
---

# 🐱 MailCat

**Email superpowers for AI agents.** Create a mailbox in one API call. Verification codes extracted automatically.

## Quick Setup

\`\`\`bash
# Get your mailbox
curl -X POST https://api.${domain}/mailboxes

# Response: { "data": { "email": "azure-fox-7@${domain}", "token": "..." }, "meta": {...} }
\`\`\`

That's it. Your agent now has an email address.

---

## Why MailCat?

Your AI agent needs to sign up for services, but gets stuck at "verify your email". MailCat solves this:

1. **Instant mailbox** — No forms, no captcha, one API call
2. **Auto extraction** — Verification codes (\`code\`) and confirm links (\`links\`) parsed automatically  
3. **Agent-friendly** — Simple REST API, Bearer token auth
4. **Privacy-first** — Receive only, auto-delete after expiry

---

## Reading Emails

\`\`\`bash
# List inbox
curl -H "Authorization: Bearer TOKEN" https://api.${domain}/inbox

# Read specific email (with auto-extracted code/links)
curl -H "Authorization: Bearer TOKEN" https://api.${domain}/emails/<ID>
\`\`\`

**Response (Strict Envelope):**
\`\`\`json
{
  "data": {
    "email": { "from": "noreply@example.com", "subject": "Verify", "text": "Code: 847291" },
    "code": "847291",
    "links": ["https://example.com/verify?t=xyz"]
  },
  "meta": {
    "agentHints": { "suggestion": "Use the extracted verification code" }
  }
}
\`\`\`

The \`data.code\` field contains the extracted verification code. No regex needed.

---

## Full API

| Endpoint | Method | Auth | What it does |
|----------|--------|------|--------------|
| \`/mailboxes\` | POST | — | Create mailbox → \`{email, token}\` |
| \`/inbox\` | GET | ✓ | List emails |
| \`/emails/{id}\` | GET | ✓ | Read email + extracted \`code\`/\`links\` |
| \`/emails/{id}\` | DELETE | ✓ | Delete email |
| \`/stats\` | GET | ✓ | Mailbox stats |
| \`/health\` | GET | — | Service status |

**Auth:** \`Authorization: Bearer YOUR_TOKEN\`

---

## Auto-Extraction

MailCat automatically extracts from incoming emails:

**Verification Codes:** 6-digit codes, OTPs, PINs, passcodes
**Action Links:** Verify/confirm URLs, password reset links, magic login links

The extracted data appears in \`code\` and \`links\` fields — no parsing needed.

---

## Tips for Agents

- **Set up periodic checking** — Emails auto-delete after 1 hour, check every 10-15 min
- **Use the \`code\` field directly** — Don't regex parse emails, we handle extraction
- **Custom names available** — POST /mailboxes with \`{"name": "mybot"}\` for \`mybot@${domain}\`
- **Store your token securely** — It's only shown once at registration

---

## Limits

| What | Limit |
|------|-------|
| Mailbox lifetime | Permanent (never expires) |
| Email retention | 1 hour (default) |
| Email size | 1 MB |
| Rate limit | 60 mailboxes/hour per IP |
| Attachments | Not supported |
| Sending | Receive only |

---

## Standards

- **Timestamps**: ISO 8601 format (\`2025-02-21T08:00:00Z\`)
- **Rate Limiting**: IETF headers (\`RateLimit-Limit\`, \`RateLimit-Remaining\`, \`RateLimit-Reset\`)
- **Errors**: RFC 9457 Problem Details
`;

  return new Response(skillMd, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      ...corsHeaders,
    },
  });
}

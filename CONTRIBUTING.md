# Contributing to MailCat

## API Change Checklist

When modifying the API (endpoints, response format, headers, etc.), **check ALL these locations**:

### 1. Source Code
- [ ] `src/handlers/*.ts` - Handler implementations
- [ ] `src/utils/response.ts` - Response helpers
- [ ] `src/types.ts` - Type definitions

### 2. Documentation
- [ ] `openapi.yaml` - OpenAPI spec (schemas, examples, headers)
- [ ] `src/handlers/docs.ts` - skill.md template (dynamic)
- [ ] `docs/API.md` - Static API documentation
- [ ] `README.md` - Quick start examples

### 3. Tests
- [ ] `test/api.test.ts` - Interface types & assertions
- [ ] `test/e2e.test.ts` - E2E test expectations
- [ ] `test/security.test.ts` - Security assertions (headers, etc.)

### 4. SDKs (if applicable)
- [ ] `sdk/python/mailcat.py`
- [ ] `sdk/javascript/mailcat.js`
- [ ] `examples/*.py`, `examples/*.js`

---

## Quick Grep Commands

```bash
# Find all timestamp references
grep -rn "timestamp\|receivedAt\|createdAt" src/ test/ docs/ --include="*.ts" --include="*.md" --include="*.yaml"

# Find all rate limit references
grep -rn "RateLimit\|rate.limit\|req/min\|req/hour" src/ test/ docs/ --include="*.ts" --include="*.md" --include="*.yaml"

# Find all version references
grep -rn "version.*1\." src/ docs/ --include="*.ts" --include="*.yaml" --include="*.md"

# Find response format patterns
grep -rn "success.*true\|\"data\":\|\"meta\":" src/ test/ docs/ --include="*.ts" --include="*.md"
```

---

## Standards We Follow

- **Timestamps**: ISO 8601 / RFC 3339 (`2025-02-21T08:00:00Z`)
- **Rate Limiting**: IETF draft-ietf-httpapi-ratelimit-headers
- **Errors**: RFC 9457 Problem Details
- **Response Envelope**: `{ data: ..., meta: { agentHints, pagination } }`

---

## Before Merging

1. Run `npm test` - all tests pass
2. Run `npm run deploy` - deploys successfully  
3. Verify live API: `curl https://api.mailcat.ai/health`
4. Check skill.md: `curl https://mailcat.ai/skill.md | tail -20`

# MailCat API Documentation

Base URL: `https://api.mailcat.ai`

## Standards Compliance

- **Timestamps**: ISO 8601 / RFC 3339 format (`2025-02-21T08:00:00Z`)
- **Rate Limiting**: IETF draft-ietf-httpapi-ratelimit-headers
- **Errors**: RFC 9457 Problem Details

## Authentication

Most endpoints require a Bearer token:

```
Authorization: Bearer YOUR_TOKEN
```

Tokens are returned when creating a mailbox and cannot be recovered.

---

## Response Format

All responses use a strict envelope pattern:

```json
{
  "data": { ... },
  "meta": {
    "agentHints": { ... },
    "pagination": { ... }
  }
}
```

---

## Endpoints

### Health Check

Check if the API is operational.

```
GET /health
```

**Response:**
```json
{
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2025-02-21T08:00:00Z"
  }
}
```

---

### Create Mailbox

Create a new disposable mailbox.

```
POST /mailboxes
```

**Request Body (optional):**
```json
{
  "name": "custom-name"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "email": "swift-coral-42@mailcat.ai",
    "token": "a1b2c3d4e5f6..."
  },
  "meta": {
    "agentHints": {
      "suggestion": "Store the token securely - it cannot be recovered",
      "nextSteps": ["Save token", "Poll /inbox for emails"]
    }
  }
}
```

**Rate Limit Headers:**
```
RateLimit-Limit: 60
RateLimit-Remaining: 59
RateLimit-Reset: 1708502400
```

---

### Check Inbox

Get list of emails in the mailbox.

```
GET /inbox?limit=20&offset=0
```

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "from": "noreply@example.com",
      "subject": "Verify your email",
      "receivedAt": "2025-02-21T08:00:00Z",
      "read": false
    }
  ],
  "meta": {
    "mailbox": "swift-coral-42@mailcat.ai",
    "unread": 1,
    "pagination": {
      "offset": 0,
      "limit": 20,
      "totalCount": 1,
      "hasMore": false
    },
    "agentHints": {
      "suggestion": "You have 1 unread email to process"
    }
  }
}
```

---

### Read Email

Get full email content with extracted verification data.

```
GET /emails/{id}
```

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "data": {
    "email": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "from": "noreply@example.com",
      "fromName": "Example Service",
      "to": "swift-coral-42@mailcat.ai",
      "subject": "Verify your email",
      "text": "Your verification code is 847291...",
      "html": "<p>Your verification code is <b>847291</b>...</p>",
      "receivedAt": "2025-02-21T08:00:00Z",
      "size": 1024
    },
    "code": "847291",
    "links": ["https://example.com/verify?token=xyz789"]
  },
  "meta": {
    "agentHints": {
      "suggestion": "Use the extracted verification code",
      "tip": "Verification codes typically expire in 5-10 minutes"
    }
  }
}
```

**Note:** `code` contains auto-extracted verification codes. `links` contains verification/action URLs.

---

### Delete Email

Delete an email from the mailbox.

```
DELETE /emails/{id}
```

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:** `204 No Content`

---

### Mailbox Stats

Get mailbox statistics.

```
GET /stats
```

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "data": {
    "email": "swift-coral-42@mailcat.ai",
    "createdAt": "2025-02-21T07:00:00Z",
    "lastActivity": "2025-02-21T08:00:00Z",
    "totalEmails": 3,
    "unreadEmails": 1,
    "totalSize": 5120
  },
  "meta": {
    "agentHints": {
      "suggestion": "You have 1 unread email"
    }
  }
}
```

---

## Error Responses

Errors follow RFC 9457 Problem Details:

```json
{
  "type": "https://mailcat.ai/errors/not_found",
  "title": "Not Found",
  "status": 404,
  "detail": "Email not found"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (deleted) |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict (name taken) |
| 429 | Rate Limited |

---

## Rate Limiting

Uses IETF standard headers:

| Header | Description |
|--------|-------------|
| `RateLimit-Limit` | Max requests in window |
| `RateLimit-Remaining` | Remaining requests |
| `RateLimit-Reset` | Unix timestamp when window resets |
| `Retry-After` | Seconds to wait (on 429) |

### Limits

| Endpoint | Limit |
|----------|-------|
| POST /mailboxes | 60/hour per IP |
| Other endpoints | No hard limit |

---

## Code Extraction

MailCat automatically extracts verification codes from emails:

### Supported Formats

- `Your code is 123456`
- `Code: 123456`
- `OTP: 123456`
- `PIN: 1234`
- `验证码：123456` (Chinese)
- `123456 is your verification code`

### Supported Link Patterns

- Verify links (`/verify`, `/confirm`)
- Password reset links (`/reset`)
- Activation links (`/activate`)
- Unsubscribe links

---

## Examples

### cURL

```bash
# Create mailbox
curl -X POST https://api.mailcat.ai/mailboxes

# Check inbox
curl -H "Authorization: Bearer TOKEN" https://api.mailcat.ai/inbox

# Read email
curl -H "Authorization: Bearer TOKEN" https://api.mailcat.ai/emails/EMAIL_ID
```

### Python

```python
import requests

# Create mailbox
r = requests.post("https://api.mailcat.ai/mailboxes")
response = r.json()
token = response["data"]["token"]
email = response["data"]["email"]

# Check inbox
r = requests.get(
    "https://api.mailcat.ai/inbox",
    headers={"Authorization": f"Bearer {token}"}
)
emails = r.json()["data"]

# Read email
if emails:
    r = requests.get(
        f"https://api.mailcat.ai/emails/{emails[0]['id']}",
        headers={"Authorization": f"Bearer {token}"}
    )
    code = r.json()["data"]["code"]  # Extracted verification code
```

### JavaScript

```javascript
// Create mailbox
const res = await fetch("https://api.mailcat.ai/mailboxes", { method: "POST" });
const response = await res.json();
const { email, token } = response.data;

// Check inbox
const inbox = await fetch("https://api.mailcat.ai/inbox", {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json());

// Read email
if (inbox.data.length > 0) {
  const emailRes = await fetch(`https://api.mailcat.ai/emails/${inbox.data[0].id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());
  
  console.log("Verification code:", emailRes.data.code);
}
```

---

## OpenAPI Spec

Full OpenAPI 3.1 specification available at:
- YAML: https://api.mailcat.ai/openapi.yaml (if served)
- Local: [openapi.yaml](../openapi.yaml)

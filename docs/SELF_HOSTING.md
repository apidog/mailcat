# Self-Hosting MailCat

This guide walks you through deploying MailCat on your own Cloudflare account.

## Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)
- [Node.js](https://nodejs.org/) 18+ installed
- A domain (can use Cloudflare's free subdomain)
- ~10 minutes

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/mailneural/mailcat.git
cd mailcat
npm install
```

### 2. Login to Cloudflare

```bash
npx wrangler login
```

This opens a browser window for authentication.

### 3. Create KV Namespace

```bash
npx wrangler kv:namespace create MAILCAT
```

Copy the `id` from the output. You'll need it next.

### 4. Configure wrangler.toml

Edit `wrangler.toml`:

```toml
name = "mailcat"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "MAILCAT"
id = "YOUR_KV_NAMESPACE_ID"  # <-- Paste the ID here

[vars]
EMAIL_DOMAIN = "mail.yourdomain.com"  # <-- Your domain
EMAIL_RETENTION_MS = "3600000"  # 1 hour
```

### 5. Deploy

```bash
npx wrangler deploy
```

Note the worker URL (e.g., `mailcat.your-subdomain.workers.dev`).

### 6. Configure DNS

In Cloudflare Dashboard → DNS:

| Type | Name | Content | Priority |
|------|------|---------|----------|
| MX | mail | your-worker.workers.dev | 10 |
| TXT | mail | v=spf1 include:_spf.mx.cloudflare.net ~all | - |

### 7. Configure Email Routing

In Cloudflare Dashboard → Email → Email Routing:

1. Enable Email Routing for your domain
2. Add a catch-all rule:
   - Action: Send to Worker
   - Worker: mailcat

### 8. Test It

```bash
# Create mailbox
curl -X POST https://your-worker.workers.dev/mailboxes

# Send a test email to the returned address
# Then check inbox
curl -H "Authorization: Bearer YOUR_TOKEN" https://your-worker.workers.dev/inbox
```

## Custom Domain (Optional)

To use a custom domain like `api.mailcat.yourdomain.com`:

### 1. Add Custom Domain to Worker

In Cloudflare Dashboard → Workers → mailcat → Settings → Triggers:

1. Click "Add Custom Domain"
2. Enter your domain (e.g., `api.mail.yourdomain.com`)
3. Cloudflare automatically handles DNS and SSL

### 2. Update Configuration

Update `EMAIL_DOMAIN` in `wrangler.toml`:

```toml
[vars]
EMAIL_DOMAIN = "mail.yourdomain.com"
```

Redeploy:

```bash
npx wrangler deploy
```

## Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `EMAIL_DOMAIN` | Domain for email addresses | Required |
| `EMAIL_RETENTION_MS` | Email retention in ms | 3600000 (1 hour) |

### Customization

#### Longer Retention

```toml
[vars]
EMAIL_RETENTION_MS = "3600000"  # 1 hour
```

#### Rate Limits

Edit `src/handlers/api.ts`:

```typescript
// Change from 60 to your limit
const allowed = await checkRateLimit(env.MAILCAT, ip, 'register', 60, 3600000);
```

#### Email Name Format

Edit `src/utils/names.ts` to customize generated names.

## Monitoring

### View Logs

```bash
npx wrangler tail
```

### Health Check

```bash
curl https://your-worker.workers.dev/health
```

## Upgrading

```bash
git pull origin main
npm install
npx wrangler deploy
```

## Troubleshooting

### Emails Not Arriving

1. Check MX records are correct
2. Verify Email Routing is enabled
3. Check Worker is set as catch-all destination
4. View logs: `npx wrangler tail`

### Rate Limit Errors

Your IP may be rate limited. Wait an hour or adjust rate limits.

### KV Errors

Ensure KV namespace ID is correct in `wrangler.toml`.

## Costs

Cloudflare's free tier includes:
- 100,000 Worker requests/day
- 1 GB KV storage
- Unlimited Email Routing

This is more than enough for most use cases.

## Security Considerations

- Tokens are SHA-256 hashed before storage
- Emails auto-delete after retention period
- No logs are kept
- Consider adding Cloudflare WAF rules for additional protection

## Support

- GitHub Issues: https://github.com/mailneural/mailcat/issues
- Discord: [link]

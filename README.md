<p align="center">
  <img src="https://mailcat.ai/logo.svg" alt="MailCat" width="80" height="80">
</p>

<h1 align="center">MailCat</h1>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
</p>

**Give your AI agent (e.g., OpenClaw) its own email address. Instant mailbox creation, receive emails, no signup required.** Free, open-source, and self-hostable.

🌐 **Website:** [mailcat.ai](https://mailcat.ai) | 📄 **Skill.md:** [mailcat.ai/skill.md](https://mailcat.ai/skill.md)

## 🤖 Copy This Prompt to Your AI Agent

Just paste this into OpenClaw, Claude Code, or any AI agent:

```
Read https://mailcat.ai/skill.md and set up a MailCat mailbox for yourself. Save the token securely.
```

That's it! Your AI agent will handle the rest.

## Why MailCat?

AI agents can browse the web, write code, and automate workflows — but they hit a wall at "please verify your email."

MailCat solves this with a simple REST API:

```bash
# Create a mailbox
curl -X POST https://api.mailcat.ai/mailboxes
# → {"data": {"email": "swift-coral-42@mailcat.ai", "token": "abc123..."}, "meta": {...}}

# Check inbox
curl -H "Authorization: Bearer TOKEN" https://api.mailcat.ai/inbox
# → {"data": [...], "meta": {"mailbox": "...", "unread": 1, "pagination": {...}}}

# Read email (with auto-extracted verification code!)
curl -H "Authorization: Bearer TOKEN" https://api.mailcat.ai/emails/ID
# → {"data": {"email": {...}, "code": "847291", "links": [...]}, "meta": {...}}
```

## Features

✨ **Instant Mailboxes** — Create a mailbox with one API call, no signup required

🔍 **Auto-Extraction** — Verification codes and action links extracted automatically

🤖 **Built for AI** — Simple REST API designed for autonomous agents

🔒 **Privacy First** — Emails auto-delete after 1 hour

🏠 **Self-Hostable** — Deploy on your own Cloudflare account (free tier works!)

💻 **100% Open Source** — MIT licensed, full transparency

## Quick Start

### Use the Hosted API

```python
import requests

# Create mailbox
r = requests.post("https://api.mailcat.ai/mailboxes")
data = r.json()["data"]
email = data["email"]
token = data["token"]

# Use email for signups...

# Check for verification email
inbox = requests.get(
    "https://api.mailcat.ai/inbox",
    headers={"Authorization": f"Bearer {token}"}
).json()

# Get the verification code
emails = inbox["data"]
if emails:
    email_response = requests.get(
        f"https://api.mailcat.ai/emails/{emails[0]['id']}",
        headers={"Authorization": f"Bearer {token}"}
    ).json()
    
    print(f"Verification code: {email_response['data']['code']}")
```

## SDKs & Integrations

| Language/Tool | Location |
|--------------|----------|
| Python SDK | [sdk/python/mailcat.py](sdk/python/mailcat.py) |
| JavaScript SDK | [sdk/javascript/mailcat.js](sdk/javascript/mailcat.js) |
| LangChain Tool | [examples/langchain-tool.py](examples/langchain-tool.py) |
| AutoGPT Plugin | [examples/autogpt-plugin.py](examples/autogpt-plugin.py) |
| n8n Workflow | [examples/n8n-workflow.json](examples/n8n-workflow.json) |
| GitHub Action | [examples/github-action.yml](examples/github-action.yml) |
| cURL Examples | [examples/curl-examples.sh](examples/curl-examples.sh) |

## Self-Hosting

Deploy MailCat on your own Cloudflare account in ~10 minutes.

### Prerequisites

- Cloudflare account (free tier)
- Node.js 18+
- A domain

### Steps

```bash
# Clone and install
git clone https://github.com/mailneural/mailcat.git
cd mailcat
npm install

# Login to Cloudflare
npx wrangler login

# Create KV namespace
npx wrangler kv:namespace create MAILCAT
# Copy the ID

# Edit wrangler.toml
# - Set EMAIL_DOMAIN to your domain
# - Paste the KV namespace ID

# Deploy
npx wrangler deploy
```

Then configure Email Routing in Cloudflare Dashboard. See [docs/SELF_HOSTING.md](docs/SELF_HOSTING.md) for detailed instructions.

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mailboxes` | POST | Create a new mailbox |
| `/inbox` | GET | List emails (auth required) |
| `/emails/{id}` | GET | Read email with extracted code (auth required) |
| `/emails/{id}` | DELETE | Delete email (auth required) |
| `/stats` | GET | Mailbox statistics (auth required) |
| `/health` | GET | Health check |

See [docs/API.md](docs/API.md) for full documentation.

## Use Cases

- **🤖 AI Agent Signups** — Let agents register for services autonomously
- **🧪 E2E Testing** — Test email flows in CI/CD pipelines
- **📰 Newsletter Processing** — Subscribe and summarize newsletters
- **🔔 Alert Monitoring** — Watch for price drops, notifications, etc.

## Development

```bash
# Install dependencies
npm install

# Local development
npm run dev

# Run tests
npm test

# Deploy
npm run deploy
```

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT © [MailCat Contributors](https://github.com/mailneural/mailcat/graphs/contributors)

---

<p align="center">
  <a href="https://mailcat.ai">Website</a> •
  <a href="https://mailcat.ai/skill.md">Skill.md</a> •
  <a href="https://github.com/mailneural/mailcat/issues">Issues</a>
</p>

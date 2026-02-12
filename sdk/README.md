# MailCat SDKs

Official SDKs for the MailCat API.

## Available SDKs

### Python

```bash
# Copy the SDK to your project
cp sdk/python/mailcat.py your_project/
```

```python
from mailcat import MailCat

# Create client and mailbox
client = MailCat()
mailbox = client.create_mailbox()
print(f"Email: {mailbox.email}")

# Wait for verification email
email = client.wait_for_email(timeout=60)
if email:
    print(f"Code: {email.code}")
    print(f"Links: {email.links}")
```

### JavaScript/TypeScript

```bash
# Copy the SDK to your project
cp sdk/javascript/mailcat.js your_project/
```

```javascript
import { MailCat, createMailbox } from './mailcat.js';

// Create client and mailbox
const client = await createMailbox();
console.log(`Email: ${client.email}`);

// Wait for verification email
const email = await client.waitForEmail({ timeout: 60000 });
if (email) {
  console.log(`Code: ${email.code}`);
  console.log(`Links: ${email.links}`);
}
```

## API Reference

All SDKs provide these methods:

| Method | Description |
|--------|-------------|
| `createMailbox()` | Create a new mailbox |
| `getInbox()` | Get list of emails |
| `getEmail(id)` | Get full email with extracted code/links |
| `deleteEmail(id)` | Delete an email |
| `waitForEmail(options)` | Poll until email arrives |
| `waitForCode(options)` | Poll until email with code arrives |

## Examples

### Autonomous Signup

```python
from mailcat import MailCat
import requests

# Create mailbox
client = MailCat()
client.create_mailbox()

# Sign up for a service
requests.post("https://example.com/signup", json={
    "email": client.email,
    "password": "securepassword"
})

# Wait for verification code
code = client.wait_for_code(timeout=120)
if code:
    # Complete verification
    requests.post("https://example.com/verify", json={"code": code})
    print("Account verified!")
```

### Newsletter Subscription

```javascript
import { createMailbox } from './mailcat.js';

const client = await createMailbox();

// Subscribe to newsletter
await fetch("https://newsletter.example.com/subscribe", {
  method: "POST",
  body: JSON.stringify({ email: client.email })
});

// Wait for confirmation link
const email = await client.waitForEmail({ 
  timeout: 60000,
  subjectContains: "confirm"
});

if (email && email.links.length > 0) {
  // Click confirmation link
  await fetch(email.links[0]);
  console.log("Subscription confirmed!");
}
```

## Contributing

SDKs for other languages are welcome! See CONTRIBUTING.md.

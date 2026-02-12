#!/bin/bash
# MailCat API - cURL Examples
# 
# Quick reference for using the MailCat API with cURL

API_BASE="https://api.mailcat.ai"

echo "=== MailCat API Examples ==="
echo ""

# 1. Create a mailbox
echo "1. Creating mailbox..."
RESPONSE=$(curl -s -X POST "$API_BASE/register")
echo "$RESPONSE" | jq .

# Extract token and email
TOKEN=$(echo "$RESPONSE" | jq -r '.token')
EMAIL=$(echo "$RESPONSE" | jq -r '.email')

echo ""
echo "Email: $EMAIL"
echo "Token: $TOKEN"
echo ""

# 2. Check inbox (empty)
echo "2. Checking inbox..."
curl -s -H "Authorization: Bearer $TOKEN" "$API_BASE/inbox" | jq .
echo ""

# 3. Check health
echo "3. Health check..."
curl -s "$API_BASE/health" | jq .
echo ""

# 4. Get API docs
echo "4. API documentation available at:"
echo "   $API_BASE/skill.md"
echo ""

# Example: Wait for email and get code
echo "=== Example: Wait for verification code ==="
echo ""
echo "# Create mailbox"
echo 'RESPONSE=$(curl -s -X POST https://api.mailcat.ai/register)'
echo 'TOKEN=$(echo $RESPONSE | jq -r ".token")'
echo 'EMAIL=$(echo $RESPONSE | jq -r ".email")'
echo ""
echo "# Use \$EMAIL to sign up for something..."
echo ""
echo "# Poll for email"
echo 'while true; do'
echo '  INBOX=$(curl -s -H "Authorization: Bearer $TOKEN" https://api.mailcat.ai/inbox)'
echo '  COUNT=$(echo $INBOX | jq -r ".count")'
echo '  if [ "$COUNT" -gt "0" ]; then'
echo '    EMAIL_ID=$(echo $INBOX | jq -r ".emails[0].id")'
echo '    EMAIL_DATA=$(curl -s -H "Authorization: Bearer $TOKEN" https://api.mailcat.ai/email/$EMAIL_ID)'
echo '    CODE=$(echo $EMAIL_DATA | jq -r ".code")'
echo '    echo "Verification code: $CODE"'
echo '    break'
echo '  fi'
echo '  sleep 10'
echo 'done'

echo ""
echo "=== Done ==="

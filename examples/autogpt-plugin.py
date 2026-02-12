"""
MailCat AutoGPT Plugin

Provides email capabilities for AutoGPT agents.

Installation:
    1. Copy this file to your AutoGPT plugins directory
    2. Enable in .env: ALLOWLISTED_PLUGINS=mailcat

Commands:
    - mailcat_create: Create a new email mailbox
    - mailcat_inbox: Check inbox for new emails
    - mailcat_read: Read an email and get verification code
    - mailcat_wait: Wait for an email to arrive
"""

import requests
import time
from typing import Any, Dict, List, Optional, TypedDict, TypeVar

PromptGenerator = TypeVar("PromptGenerator")


class MailCatPlugin:
    """
    MailCat plugin for AutoGPT.
    
    Enables AI agents to receive emails and extract verification codes.
    """
    
    def __init__(self):
        self._api_url = "https://api.mailcat.ai"
        self._token: Optional[str] = None
        self._email: Optional[str] = None
    
    def can_handle_on_response(self) -> bool:
        return False
    
    def can_handle_post_prompt(self) -> bool:
        return True
    
    def can_handle_on_planning(self) -> bool:
        return False
    
    def can_handle_post_planning(self) -> bool:
        return False
    
    def can_handle_pre_instruction(self) -> bool:
        return False
    
    def can_handle_on_instruction(self) -> bool:
        return False
    
    def can_handle_post_instruction(self) -> bool:
        return False
    
    def can_handle_pre_command(self) -> bool:
        return False
    
    def can_handle_post_command(self) -> bool:
        return False
    
    def can_handle_chat_completion(
        self,
        messages: Dict[Any, Any],
        model: str,
        temperature: float,
        max_tokens: int,
    ) -> bool:
        return False
    
    def can_handle_text_embedding(self, text: str) -> bool:
        return False
    
    def can_handle_user_input(self, user_input: str) -> bool:
        return False
    
    def can_handle_report(self) -> bool:
        return False
    
    def post_prompt(self, prompt: PromptGenerator) -> PromptGenerator:
        """Add MailCat commands to the prompt."""
        
        prompt.add_command(
            "mailcat_create",
            "Create a new email mailbox for receiving emails",
            {},
            self.create_mailbox
        )
        
        prompt.add_command(
            "mailcat_inbox",
            "Check inbox for new emails",
            {},
            self.check_inbox
        )
        
        prompt.add_command(
            "mailcat_read",
            "Read an email and extract verification code",
            {"email_id": "<string: ID of the email to read>"},
            self.read_email
        )
        
        prompt.add_command(
            "mailcat_wait",
            "Wait for an email to arrive",
            {"timeout": "<int: seconds to wait, default 60>"},
            self.wait_for_email
        )
        
        return prompt
    
    def create_mailbox(self) -> str:
        """Create a new disposable email mailbox."""
        try:
            response = requests.post(
                f"{self._api_url}/mailboxes",
                timeout=30
            )
            response_data = response.json()
            data = response_data.get("data", {})
            
            if data.get("email"):
                self._token = data["token"]
                self._email = data["email"]
                return f"SUCCESS: Mailbox created!\nEmail: {self._email}\nUse this email address for signups. The mailbox expires in 1 hour."
            else:
                return f"ERROR: {response_data.get('detail', 'Failed to create mailbox')}"
        
        except Exception as e:
            return f"ERROR: {str(e)}"
    
    def check_inbox(self) -> str:
        """Check the inbox for new emails."""
        if not self._token:
            return "ERROR: No mailbox created. Use mailcat_create first."
        
        try:
            response = requests.get(
                f"{self._api_url}/inbox",
                headers={"Authorization": f"Bearer {self._token}"},
                timeout=30
            )
            response_data = response.json()
            emails = response_data.get("data", [])
            
            if isinstance(emails, list):
                if not emails:
                    return f"INBOX EMPTY: No emails yet. Mailbox: {self._email}"
                
                result = f"FOUND {len(emails)} EMAIL(S):\n"
                for i, email in enumerate(emails, 1):
                    result += f"\n{i}. ID: {email['id']}\n"
                    result += f"   From: {email.get('from', 'Unknown')}\n"
                    result += f"   Subject: {email.get('subject', 'No subject')}\n"
                
                result += f"\nUse mailcat_read with the ID to read an email."
                return result
            else:
                return f"ERROR: {response_data.get('detail', 'Failed to check inbox')}"
        
        except Exception as e:
            return f"ERROR: {str(e)}"
    
    def read_email(self, email_id: str) -> str:
        """Read a specific email and extract verification code."""
        if not self._token:
            return "ERROR: No mailbox created. Use mailcat_create first."
        
        try:
            response = requests.get(
                f"{self._api_url}/emails/{email_id}",
                headers={"Authorization": f"Bearer {self._token}"},
                timeout=30
            )
            response_data = response.json()
            data = response_data.get("data", {})
            
            if data.get("email"):
                email = data.get("email", {})
                code = data.get("code")
                links = data.get("links", [])
                
                result = "EMAIL CONTENT:\n"
                result += f"From: {email.get('from', 'Unknown')}\n"
                result += f"Subject: {email.get('subject', 'No subject')}\n"
                result += f"Body:\n{email.get('text', 'No content')[:1000]}\n"
                
                if code:
                    result += f"\n*** VERIFICATION CODE FOUND: {code} ***\n"
                
                if links:
                    result += f"\nACTION LINKS:\n"
                    for link in links:
                        result += f"  - {link}\n"
                
                return result
            else:
                return f"ERROR: {response_data.get('detail', 'Failed to read email')}"
        
        except Exception as e:
            return f"ERROR: {str(e)}"
    
    def wait_for_email(self, timeout: int = 60) -> str:
        """Wait for an email to arrive."""
        if not self._token:
            return "ERROR: No mailbox created. Use mailcat_create first."
        
        timeout = int(timeout)
        start_time = time.time()
        poll_interval = 10
        
        while time.time() - start_time < timeout:
            try:
                response = requests.get(
                    f"{self._api_url}/inbox",
                    headers={"Authorization": f"Bearer {self._token}"},
                    timeout=30
                )
                response_data = response.json()
                emails = response_data.get("data", [])
                
                if isinstance(emails, list) and emails:
                    return self.read_email(emails[0]["id"])
                
                time.sleep(poll_interval)
            
            except Exception:
                time.sleep(poll_interval)
        
        return f"TIMEOUT: No email received within {timeout} seconds. Mailbox: {self._email}"


# Plugin instance
plugin = MailCatPlugin()

"""
MailCat LangChain Tool

Integrates MailCat with LangChain for AI agent email capabilities.

Requirements:
    pip install langchain requests

Usage:
    from langchain_tool import MailCatTool
    
    tool = MailCatTool()
    agent = initialize_agent([tool], llm, ...)
"""

from typing import Optional, Type
from langchain.tools import BaseTool
from pydantic import BaseModel, Field
import requests
import time


class MailCatInput(BaseModel):
    """Input for MailCat tool."""
    action: str = Field(
        description="Action to perform: 'create', 'inbox', 'read', or 'wait'"
    )
    email_id: Optional[str] = Field(
        default=None,
        description="Email ID for 'read' action"
    )
    timeout: Optional[int] = Field(
        default=60,
        description="Timeout in seconds for 'wait' action"
    )


class MailCatTool(BaseTool):
    """
    LangChain tool for email operations via MailCat.
    
    Allows AI agents to:
    - Create disposable email addresses
    - Check inbox for new emails
    - Read emails and extract verification codes
    - Wait for incoming emails
    """
    
    name: str = "mailcat"
    description: str = """
    Email tool for receiving emails and extracting verification codes.
    
    Actions:
    - create: Create a new mailbox. Returns email address and token.
    - inbox: Check inbox for emails. Returns list of email summaries.
    - read: Read an email by ID. Returns email content and extracted code.
    - wait: Wait for an email to arrive. Returns first email received.
    
    Use this when you need to receive verification emails or sign up for services.
    """
    args_schema: Type[BaseModel] = MailCatInput
    
    # Internal state
    _token: Optional[str] = None
    _email: Optional[str] = None
    _base_url: str = "https://api.mailcat.ai"
    
    def __init__(self, base_url: str = "https://api.mailcat.ai"):
        super().__init__()
        self._base_url = base_url
        self._token = None
        self._email = None
    
    def _run(
        self,
        action: str,
        email_id: Optional[str] = None,
        timeout: int = 60
    ) -> str:
        """Execute the tool action."""
        
        if action == "create":
            return self._create_mailbox()
        
        elif action == "inbox":
            return self._check_inbox()
        
        elif action == "read":
            if not email_id:
                return "Error: email_id required for 'read' action"
            return self._read_email(email_id)
        
        elif action == "wait":
            return self._wait_for_email(timeout)
        
        else:
            return f"Unknown action: {action}. Use: create, inbox, read, or wait"
    
    def _create_mailbox(self) -> str:
        """Create a new mailbox."""
        try:
            response = requests.post(
                f"{self._base_url}/mailboxes",
                timeout=30
            )
            response_data = response.json()
            data = response_data.get("data", {})
            
            if data.get("email"):
                self._token = data["token"]
                self._email = data["email"]
                return f"Mailbox created!\nEmail: {self._email}\nUse this email for signups. Call 'inbox' or 'wait' to check for emails."
            else:
                return f"Error: {response_data.get('detail', 'Unknown error')}"
        
        except Exception as e:
            return f"Error creating mailbox: {str(e)}"
    
    def _check_inbox(self) -> str:
        """Check the inbox."""
        if not self._token:
            return "Error: No mailbox created. Call 'create' first."
        
        try:
            response = requests.get(
                f"{self._base_url}/inbox",
                headers={"Authorization": f"Bearer {self._token}"},
                timeout=30
            )
            response_data = response.json()
            emails = response_data.get("data", [])
            
            if isinstance(emails, list):
                if not emails:
                    return f"Inbox empty. Email: {self._email}"
                
                result = f"Found {len(emails)} email(s):\n"
                for email in emails:
                    result += f"- ID: {email['id']}\n"
                    result += f"  From: {email.get('from', 'Unknown')}\n"
                    result += f"  Subject: {email.get('subject', 'No subject')}\n"
                
                return result
            else:
                return f"Error: {response_data.get('detail', 'Unknown error')}"
        
        except Exception as e:
            return f"Error checking inbox: {str(e)}"
    
    def _read_email(self, email_id: str) -> str:
        """Read a specific email."""
        if not self._token:
            return "Error: No mailbox created. Call 'create' first."
        
        try:
            response = requests.get(
                f"{self._base_url}/emails/{email_id}",
                headers={"Authorization": f"Bearer {self._token}"},
                timeout=30
            )
            response_data = response.json()
            data = response_data.get("data", {})
            
            if data.get("email"):
                email = data.get("email", {})
                code = data.get("code")
                links = data.get("links", [])
                
                result = f"Email content:\n"
                result += f"From: {email.get('from', 'Unknown')}\n"
                result += f"Subject: {email.get('subject', 'No subject')}\n"
                result += f"Body: {email.get('body_text', 'No content')[:500]}\n"
                
                if code:
                    result += f"\n🔑 VERIFICATION CODE: {code}\n"
                
                if links:
                    result += f"\n🔗 Links found:\n"
                    for link in links:
                        result += f"  - {link}\n"
                
                return result
            else:
                return f"Error: {response_data.get('detail', 'Unknown error')}"
        
        except Exception as e:
            return f"Error reading email: {str(e)}"
    
    def _wait_for_email(self, timeout: int) -> str:
        """Wait for an email to arrive."""
        if not self._token:
            return "Error: No mailbox created. Call 'create' first."
        
        start_time = time.time()
        poll_interval = 10
        
        while time.time() - start_time < timeout:
            try:
                response = requests.get(
                    f"{self._base_url}/inbox",
                    headers={"Authorization": f"Bearer {self._token}"},
                    timeout=30
                )
                response_data = response.json()
                emails = response_data.get("data", [])
                
                if isinstance(emails, list) and emails:
                    # Read the first email
                    return self._read_email(emails[0]["id"])
                
                time.sleep(poll_interval)
            
            except Exception:
                time.sleep(poll_interval)
        
        return f"No email received within {timeout} seconds. Email: {self._email}"
    
    async def _arun(self, *args, **kwargs) -> str:
        """Async version (just calls sync for simplicity)."""
        return self._run(*args, **kwargs)


# Example usage with LangChain
if __name__ == "__main__":
    # Standalone test
    tool = MailCatTool()
    
    print("Creating mailbox...")
    result = tool._run(action="create")
    print(result)
    
    print("\nChecking inbox...")
    result = tool._run(action="inbox")
    print(result)

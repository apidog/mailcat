"""
MailCat Python SDK

A simple Python client for the MailCat API.

Installation:
    pip install requests

Usage:
    from mailcat import MailCat
    
    client = MailCat()
    mailbox = client.create_mailbox()
    print(f"Email: {mailbox.email}")
    
    # Wait for email
    email = client.wait_for_email()
    print(f"Code: {email.code}")
"""

import time
import requests
from dataclasses import dataclass
from typing import Optional, List


@dataclass
class Mailbox:
    """Represents a MailCat mailbox."""
    email: str
    token: str


@dataclass
class EmailSummary:
    """Summary of an email in the inbox."""
    id: str
    sender: str
    subject: str
    received_at: str


@dataclass
class Email:
    """Full email content with extracted data."""
    id: str
    sender: str
    to: str
    subject: str
    body_text: str
    body_html: str
    received_at: str
    code: Optional[str]
    links: List[str]


class MailCatError(Exception):
    """Base exception for MailCat errors."""
    pass


class RateLimitError(MailCatError):
    """Raised when rate limit is exceeded."""
    pass


class AuthenticationError(MailCatError):
    """Raised when authentication fails."""
    pass


class MailCat:
    """
    MailCat API client.
    
    Args:
        base_url: API base URL (default: https://api.mailcat.ai)
        timeout: Request timeout in seconds (default: 30)
    
    Example:
        >>> client = MailCat()
        >>> mailbox = client.create_mailbox()
        >>> print(mailbox.email)
        swift-coral-42@mailcat.ai
    """
    
    def __init__(
        self,
        base_url: str = "https://api.mailcat.ai",
        timeout: int = 30
    ):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self._token: Optional[str] = None
        self._email: Optional[str] = None
    
    def _request(
        self,
        method: str,
        path: str,
        auth: bool = False,
        **kwargs
    ) -> dict:
        """Make an API request."""
        url = f"{self.base_url}{path}"
        headers = kwargs.pop("headers", {})
        
        if auth and self._token:
            headers["Authorization"] = f"Bearer {self._token}"
        
        response = requests.request(
            method,
            url,
            headers=headers,
            timeout=self.timeout,
            **kwargs
        )
        
        data = response.json()
        
        if response.status_code == 429:
            raise RateLimitError(data.get("error", "Rate limit exceeded"))
        
        if response.status_code == 401:
            raise AuthenticationError(data.get("error", "Authentication failed"))
        
        if not data.get("success", True):
            raise MailCatError(data.get("error", "Unknown error"))
        
        return data
    
    def create_mailbox(self) -> Mailbox:
        """
        Create a new mailbox.
        
        Returns:
            Mailbox object with email and token
        
        Example:
            >>> mailbox = client.create_mailbox()
            >>> print(mailbox.email)
        """
        response = self._request("POST", "/mailboxes")
        data = response["data"]
        
        self._token = data["token"]
        self._email = data["email"]
        
        return Mailbox(
            email=data["email"],
            token=data["token"]
        )
    
    def get_inbox(self) -> List[EmailSummary]:
        """
        Get list of emails in the inbox.
        
        Returns:
            List of EmailSummary objects
        
        Example:
            >>> emails = client.get_inbox()
            >>> for email in emails:
            ...     print(email.subject)
        """
        response = self._request("GET", "/inbox", auth=True)
        emails = response.get("data", [])
        
        return [
            EmailSummary(
                id=e["id"],
                sender=e.get("from", ""),
                subject=e.get("subject", ""),
                received_at=e.get("receivedAt", "")
            )
            for e in emails
        ]
    
    def get_email(self, email_id: str) -> Email:
        """
        Get full email content by ID.
        
        Args:
            email_id: The email ID from inbox
        
        Returns:
            Email object with full content and extracted code/links
        
        Example:
            >>> email = client.get_email("abc123")
            >>> print(email.code)  # Extracted verification code
        """
        response = self._request("GET", f"/emails/{email_id}", auth=True)
        data = response.get("data", {})
        email_data = data.get("email", {})
        
        return Email(
            id=email_data.get("id", email_id),
            sender=email_data.get("from", ""),
            to=email_data.get("to", ""),
            subject=email_data.get("subject", ""),
            body_text=email_data.get("text", ""),
            body_html=email_data.get("html", ""),
            received_at=email_data.get("receivedAt", ""),
            code=data.get("code"),
            links=data.get("links", [])
        )
    
    def delete_email(self, email_id: str) -> bool:
        """
        Delete an email.
        
        Args:
            email_id: The email ID to delete
        
        Returns:
            True if deleted successfully
        """
        self._request("DELETE", f"/emails/{email_id}", auth=True)
        return True
    
    def wait_for_email(
        self,
        timeout: int = 300,
        poll_interval: int = 10,
        subject_contains: Optional[str] = None
    ) -> Optional[Email]:
        """
        Wait for an email to arrive.
        
        Args:
            timeout: Maximum time to wait in seconds (default: 300)
            poll_interval: Time between checks in seconds (default: 10)
            subject_contains: Only return email if subject contains this string
        
        Returns:
            Email object if received, None if timeout
        
        Example:
            >>> email = client.wait_for_email(timeout=60)
            >>> if email:
            ...     print(f"Got code: {email.code}")
        """
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            emails = self.get_inbox()
            
            for summary in emails:
                if subject_contains and subject_contains.lower() not in summary.subject.lower():
                    continue
                
                return self.get_email(summary.id)
            
            time.sleep(poll_interval)
        
        return None
    
    def wait_for_code(
        self,
        timeout: int = 300,
        poll_interval: int = 10
    ) -> Optional[str]:
        """
        Wait for an email with a verification code.
        
        Args:
            timeout: Maximum time to wait in seconds
            poll_interval: Time between checks in seconds
        
        Returns:
            Extracted verification code, or None if not found
        
        Example:
            >>> code = client.wait_for_code(timeout=60)
            >>> if code:
            ...     print(f"Verification code: {code}")
        """
        email = self.wait_for_email(timeout=timeout, poll_interval=poll_interval)
        
        if email and email.code:
            return email.code
        
        return None
    
    @property
    def email(self) -> Optional[str]:
        """The current mailbox email address."""
        return self._email
    
    @property
    def token(self) -> Optional[str]:
        """The current mailbox token."""
        return self._token


# Convenience function
def create_mailbox(base_url: str = "https://api.mailcat.ai") -> MailCat:
    """
    Create a new MailCat client with a mailbox.
    
    Example:
        >>> client = create_mailbox()
        >>> print(client.email)
    """
    client = MailCat(base_url)
    client.create_mailbox()
    return client


if __name__ == "__main__":
    # Example usage
    print("Creating mailbox...")
    client = create_mailbox()
    print(f"Email: {client.email}")
    print(f"Token: {client.token}")
    
    print("\nChecking inbox...")
    emails = client.get_inbox()
    print(f"Emails in inbox: {len(emails)}")
    
    print("\nMailbox ready! Send an email to test.")

"""
Reusable email sending utility using SendGrid.

Credentials from environment variables. No API keys in code.
"""

import logging
import os
import re

logger = logging.getLogger(__name__)

# Basic email validation - protect against injection
EMAIL_PATTERN = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


def _get_api_key():
    """Get SendGrid API key from environment."""
    return os.environ.get("SENDGRID_API_KEY")


def _validate_email(address: str) -> bool:
    """Validate email format. Returns False if invalid or empty."""
    if not address or not isinstance(address, str):
        return False
    return bool(EMAIL_PATTERN.match(address.strip()))


def send_email(to_email: str, subject: str, html_content: str, plain_content: str = None):
    """
    Send an email via SendGrid.

    Args:
        to_email: Recipient email (validated before sending).
        subject: Email subject line.
        html_content: HTML body.
        plain_content: Optional plain-text fallback.

    Raises:
        ValueError: If to_email is invalid.
        RuntimeError: If SendGrid is not configured or send fails.
    """
    if not _validate_email(to_email):
        raise ValueError(f"Invalid recipient email: {to_email}")

    api_key = _get_api_key()
    if not api_key:
        raise RuntimeError("SENDGRID_API_KEY not set; cannot send email")

    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail
    except ImportError as err:
        raise RuntimeError("sendgrid package not installed") from err

    message = Mail(
        from_email=os.environ.get("SENDGRID_FROM_EMAIL", "noreply@example.com"),
        to_emails=to_email,
        subject=subject,
        html_content=html_content,
        plain_text_content=plain_content or _html_to_plain(html_content),
    )

    client = SendGridAPIClient(api_key)
    response = client.send(message)

    if response.status_code >= 400:
        logger.error(
            "SendGrid send failed",
            extra={"status_code": response.status_code, "to": to_email, "subject": subject},
        )
        raise RuntimeError(f"SendGrid returned {response.status_code}")

    logger.info(
        "Email sent",
        extra={"to": to_email, "subject": subject, "status_code": response.status_code},
    )


def _html_to_plain(html_str: str) -> str:
    """Strip HTML tags and collapse whitespace for plain-text fallback."""
    import html as html_module
    import re as re_module

    text = re_module.sub(r"<[^>]+>", " ", html_str)
    text = re_module.sub(r"\s+", " ", text).strip()
    return html_module.unescape(text)

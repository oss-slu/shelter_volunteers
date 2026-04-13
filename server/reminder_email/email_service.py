"""
Reusable email sending utility using SendGrid.

Credentials from environment variables. No API keys in code.
"""

import html as html_module
import logging
import os
import re
import socket
import urllib.error

try:
    from python_http_client.exceptions import HTTPError as SendGridHTTPError
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail
except ImportError:
    SendGridHTTPError = None  # type: ignore[misc, assignment]
    SendGridAPIClient = None  # type: ignore[assignment]
    Mail = None  # type: ignore[assignment]

logger = logging.getLogger(__name__)

# Basic email validation - protect against injection
EMAIL_PATTERN = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

# HTML → plain-text fallback (compiled once; used by send_email)
_HTML_TAG_PATTERN = re.compile(r"<[^>]+>")
_WHITESPACE_PATTERN = re.compile(r"\s+")

# Default HTTP timeout for SendGrid API (seconds). Override with SENDGRID_HTTP_TIMEOUT.
_DEFAULT_SENDGRID_HTTP_TIMEOUT = 30.0


def _get_api_key():
    """Get SendGrid API key from environment."""
    return os.environ.get("SENDGRID_API_KEY")


def _get_sendgrid_http_timeout() -> float:
    """Seconds for urllib timeout on SendGrid HTTP calls. Invalid env falls back to default."""
    raw = os.environ.get("SENDGRID_HTTP_TIMEOUT")
    if raw is None or raw.strip() == "":
        return _DEFAULT_SENDGRID_HTTP_TIMEOUT
    try:
        value = float(raw)
        if value <= 0:
            logger.warning(
                "SENDGRID_HTTP_TIMEOUT must be positive; using default",
                extra={"invalid_value": raw},
            )
            return _DEFAULT_SENDGRID_HTTP_TIMEOUT
        return value
    except ValueError:
        logger.warning(
            "Invalid SENDGRID_HTTP_TIMEOUT; using default",
            extra={"invalid_value": raw},
        )
        return _DEFAULT_SENDGRID_HTTP_TIMEOUT


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

    if Mail is None or SendGridAPIClient is None:
        raise RuntimeError("sendgrid package not installed")

    message = Mail(
        from_email=os.environ.get("SENDGRID_FROM_EMAIL", "noreply@example.com"),
        to_emails=to_email,
        subject=subject,
        html_content=html_content,
        plain_text_content=plain_content or _html_to_plain(html_content),
    )

    client = SendGridAPIClient(api_key)
    timeout = _get_sendgrid_http_timeout()
    client.client.timeout = timeout

    try:
        response = client.send(message)
    except Exception as err:
        if SendGridHTTPError is not None and isinstance(err, SendGridHTTPError):
            status = getattr(err, "status_code", None)
            logger.error(
                "SendGrid send failed (HTTP error)",
                extra={
                    "status_code": status,
                    "to": to_email,
                    "subject": subject,
                    "timeout_seconds": timeout,
                },
            )
            raise RuntimeError(
                f"SendGrid request failed with status {status}"
            ) from err
        if isinstance(err, (urllib.error.URLError, OSError, socket.timeout)):
            logger.error(
                "SendGrid send failed (network or timeout)",
                extra={
                    "to": to_email,
                    "subject": subject,
                    "timeout_seconds": timeout,
                    "error": str(err),
                },
                exc_info=True,
            )
            raise RuntimeError(
                "SendGrid request failed: network error or timeout"
            ) from err
        raise

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
    text = _HTML_TAG_PATTERN.sub(" ", html_str)
    text = _WHITESPACE_PATTERN.sub(" ", text).strip()
    return html_module.unescape(text)

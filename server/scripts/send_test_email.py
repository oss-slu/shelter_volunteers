"""
Send a one-off test email through SendGrid (same path as reminder emails).

Requires SENDGRID_API_KEY and SENDGRID_FROM_EMAIL in your env file.

Usage (from the server directory):

    # PowerShell — uses .env.pre-production when FLASK_ENV is pre-production
    $env:FLASK_ENV = "pre-production"
    python scripts/send_test_email.py you@example.com

    # Or development env file
    $env:FLASK_ENV = "development"
    python scripts/send_test_email.py you@example.com
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

_SERVER_DIR = Path(__file__).resolve().parent.parent
if str(_SERVER_DIR) not in sys.path:
    sys.path.insert(0, str(_SERVER_DIR))

# App imports require ``server`` on path (see block above).
# pylint: disable=wrong-import-position
from reminder_email.email_service import send_email


def _load_env():
    os.chdir(_SERVER_DIR)
    env = os.environ.get("FLASK_ENV", "pre-production")
    env_file = _SERVER_DIR / f".env.{env}"
    if env_file.exists():
        load_dotenv(env_file)
    load_dotenv(_SERVER_DIR / ".env")


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/send_test_email.py recipient@example.com")
        sys.exit(1)

    recipient = sys.argv[1].strip()
    _load_env()

    if not os.environ.get("SENDGRID_API_KEY"):
        env = os.environ.get("FLASK_ENV", "pre-production")
        print(f"Error: SENDGRID_API_KEY is not set. Add it to .env.{env} or .env")
        sys.exit(1)

    send_email(
        recipient,
        "Shelter Volunteers — test email",
        "<p>This is a <strong>test</strong> email from the Shelter Volunteers app.</p>"
        "<p>If you see this, SendGrid is configured correctly.</p>",
    )
    print(f"Sent test email to {recipient}")


if __name__ == "__main__":
    main()

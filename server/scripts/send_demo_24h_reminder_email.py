"""
Send a DEMO 24-hour reminder email using the real HTML template (for demos / video).

Does not read Mongo or require a shift in the reminder window — it fills the
same template production uses with sample names and times.

Usage (from server/):

    export FLASK_ENV=pre-production
    python scripts/send_demo_24h_reminder_email.py your@email.com

Optional: second arg is shelter display name (default: Homeless Shelter)
"""

import html as html_module
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

from dotenv import load_dotenv

_SERVER_DIR = Path(__file__).resolve().parent.parent
if str(_SERVER_DIR) not in sys.path:
    sys.path.insert(0, str(_SERVER_DIR))

# App imports require ``server`` on path (see block above).
# pylint: disable=wrong-import-position
from domains.service_shift import ServiceShift
from reminder_email.email_service import send_email
from reminder_email.reminder_handler import (
    SUBJECT_24H,
    _duration_hours,
    _format_date,
    _format_time,
    _load_template,
)


def _load_env():
    os.chdir(_SERVER_DIR)
    env = os.environ.get("FLASK_ENV", "pre-production")
    env_file = _SERVER_DIR / f".env.{env}"
    if env_file.exists():
        load_dotenv(env_file)
    load_dotenv(_SERVER_DIR / ".env")


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/send_demo_24h_reminder_email.py recipient@email.com")
        print(
            "       python scripts/send_demo_24h_reminder_email.py "
            'recipient@email.com "Shelter Name"'
        )
        sys.exit(1)

    recipient = sys.argv[1].strip()
    shelter_display = (sys.argv[2].strip() if len(sys.argv) > 2 else "Homeless Shelter")

    _load_env()

    if not os.environ.get("SENDGRID_API_KEY"):
        print("Error: SENDGRID_API_KEY not set.")
        sys.exit(1)

    # "Tomorrow" at 5:45 PM UTC — reads well on camera with the template copy
    tomorrow = datetime.now(timezone.utc).date() + timedelta(days=1)
    shift_start_dt = datetime(
        tomorrow.year,
        tomorrow.month,
        tomorrow.day,
        17,
        45,
        0,
        tzinfo=timezone.utc,
    )
    shift_start_ms = int(shift_start_dt.timestamp() * 1000)
    shift_end_ms = shift_start_ms + 5 * 60 * 60 * 1000  # 5h shift

    shift = ServiceShift(
        shelter_id="demo",
        shift_start=shift_start_ms,
        shift_end=shift_end_ms,
        instructions="Park in the back lot. Check in at the front desk.",
    )

    volunteer_name = html_module.escape("Alex Rivera")
    shelter_name = html_module.escape(shelter_display)
    shift_date = _format_date(shift.shift_start)
    shift_time = _format_time(shift.shift_start)
    duration = _duration_hours(shift)
    raw = (shift.instructions or "").strip()
    instructions = html_module.escape(raw) if raw else ""
    if instructions:
        instructions_section = (
            f'<div class="instructions">'
            f'<span class="label">Shift Instructions</span>'
            f'<div class="value" style="margin-top: 8px;">{instructions}</div>'
            f"</div>"
        )
    else:
        instructions_section = ""

    html_body = _load_template("reminder_24h.html")
    html_body = html_body.format(
        volunteer_name=volunteer_name,
        shelter_name=shelter_name,
        shift_date=shift_date,
        shift_time=shift_time,
        duration=duration,
        shift_instructions_section=instructions_section,
    )

    send_email(recipient, SUBJECT_24H, html_body)
    print(f"Sent demo 24h reminder to {recipient}")
    print(f"  (sample: {shift_date} @ {shift_time}, {duration} at {shelter_display})")


if __name__ == "__main__":
    main()

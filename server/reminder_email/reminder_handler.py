"""
Reminder email handler: sends 24h and 2h shift reminder emails.

Connects the reminder engine to actual email delivery. Fetches shelter
and volunteer info, renders templates, and sends via SendGrid.
"""

import logging
import os
from datetime import datetime, timezone
from pathlib import Path

try:
    from zoneinfo import ZoneInfo
except ImportError:  # Python < 3.9
    from backports.zoneinfo import ZoneInfo

from jinja2 import Environment, FileSystemLoader, select_autoescape

from domains.service_shift import ServiceShift
from reminder_email.email_service import send_email
from repository.mongo.shelter import ShelterRepo
from repository.mongo.user_info_repository import UserInfoRepository
from use_cases.shelters.get_shelter_by_id import get_shelter_by_id
from use_cases.user_info.get_user_info_by_email import get_user_info_by_email

logger = logging.getLogger(__name__)

_TEMPLATES = Environment(
    loader=FileSystemLoader(Path(__file__).parent / "templates"),
    autoescape=select_autoescape(),
    keep_trailing_newline=True,
)

# Subjects per reminder type
SUBJECT_24H = "Reminder: Upcoming Volunteer Shift Tomorrow"
SUBJECT_2H = "Reminder: Your Volunteer Shift Starts Soon"

# IANA zone for email date/time (default US Central). Override via REMINDER_DISPLAY_TIMEZONE.
# Browser UI uses local time; email uses one display zone for consistency.
_DEFAULT_REMINDER_DISPLAY_TZ = "America/Chicago"


def _get_reminder_display_tz():
    """
    Timezone used when formatting shift start in reminder HTML.

    Stored shift times are UTC ms; the UI uses the user's local timezone. Email uses a single
    display zone so times align with how shelters schedule (often Central for this region).
    Set REMINDER_DISPLAY_TIMEZONE (e.g. America/New_York) to match your deployment.
    """
    name = (os.environ.get("REMINDER_DISPLAY_TIMEZONE") or _DEFAULT_REMINDER_DISPLAY_TZ).strip()
    if not name:
        name = _DEFAULT_REMINDER_DISPLAY_TZ
    try:
        return ZoneInfo(name)
    except Exception:  # pylint: disable=broad-exception-caught
        logger.warning(
            "Invalid REMINDER_DISPLAY_TIMEZONE %r; using UTC for reminder times",
            name,
        )
        return timezone.utc


def _format_date(ms: int) -> str:
    """Format milliseconds since epoch to e.g. 'Mar 08, 2026' in the reminder display timezone."""
    dt = datetime.fromtimestamp(ms / 1000, tz=_get_reminder_display_tz())
    return dt.strftime("%b %d, %Y")


def _format_time(ms: int) -> str:
    """Format milliseconds since epoch to e.g. '03:26 PM' in the reminder display timezone."""
    dt = datetime.fromtimestamp(ms / 1000, tz=_get_reminder_display_tz())
    return dt.strftime("%I:%M %p")


def _duration_hours(shift: ServiceShift) -> str:
    """Duration in hours from shift start/end."""
    hrs = (shift.shift_end - shift.shift_start) / (60 * 60 * 1000)
    return f"{int(hrs)}h" if hrs == int(hrs) else f"{hrs:.1f}h"


def _get_volunteer_name(volunteer_id: str, user_info_repo: UserInfoRepository) -> str:
    """Get display name for volunteer; fallback to 'Volunteer'."""
    user = get_user_info_by_email(volunteer_id, user_info_repo)
    if not user:
        return "Volunteer"
    parts = [user.first_name or "", user.last_name or ""]
    name = " ".join(p for p in parts if p).strip()
    return name or "Volunteer"


def _get_shelter_name(shelter_id: str, shelter_repo: ShelterRepo) -> str:
    """Get shelter name; fallback to 'the shelter'."""
    shelter = get_shelter_by_id(shelter_id, shelter_repo)
    return shelter.name if shelter else "the shelter"


def _get_shift_instructions(shift: ServiceShift) -> str:
    """Optional instructions from Mongo ``instructions`` or legacy ``shift_instructions``."""
    instr = shift.instructions
    if instr is None:
        return ""
    if not isinstance(instr, str):
        return ""
    return instr.strip()


def render_reminder_html(
    reminder_type: str, shift: ServiceShift, volunteer_name: str, shelter_name: str
) -> str:
    """Render the reminder for a shift and its volunteer and shelter display names."""
    is_day_before = reminder_type == "reminder_24h"
    template = _TEMPLATES.get_template("reminder_24h.html" if is_day_before else "reminder_2h.html")
    return template.render(
        volunteer_name=volunteer_name,
        shelter_name=shelter_name,
        shift_date=_format_date(shift.shift_start),
        shift_time=_format_time(shift.shift_start),
        duration=_duration_hours(shift) if is_day_before else "",
        instructions=_get_shift_instructions(shift) if is_day_before else "",
    )


def send_reminder_email(
    shift_id: str,
    volunteer_id: str,
    reminder_type: str,
    shift: ServiceShift,
    shelter_repo: ShelterRepo,
    user_info_repo: UserInfoRepository,
) -> None:
    """
    Send a reminder email to the volunteer.

    Args:
        shift_id: Shift ID (for API symmetry; body uses ``shift``).
        volunteer_id: Volunteer email.
        reminder_type: 'reminder_24h' or 'reminder_2h'.
        shift: ServiceShift with shift details.
        shelter_repo: Shelter repository.
        user_info_repo: User info repository.

    Raises:
        RuntimeError: If email send fails (caller should not update reminder flags).
    """
    logger.debug("Reminder email for shift %s type %s", shift_id, reminder_type)
    subject = SUBJECT_24H if reminder_type == "reminder_24h" else SUBJECT_2H
    html_body = render_reminder_html(
        reminder_type,
        shift,
        _get_volunteer_name(volunteer_id, user_info_repo),
        _get_shelter_name(shift.shelter_id, shelter_repo),
    )
    send_email(volunteer_id, subject, html_body)

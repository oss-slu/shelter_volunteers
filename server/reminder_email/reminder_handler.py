"""
Reminder email handler: sends 24h and 2h shift reminder emails.

Connects the reminder engine to actual email delivery. Fetches shelter
and volunteer info, renders templates, and sends via SendGrid.
"""

import html as html_module
import logging
from datetime import datetime, timezone
from pathlib import Path

from domains.service_shift import ServiceShift
from repository.mongo.shelter import ShelterRepo

from .email_service import send_email
from repository.mongo.user_info_repository import UserInfoRepository
from use_cases.shelters.get_shelter_by_id import get_shelter_by_id
from use_cases.user_info.get_user_info_by_email import get_user_info_by_email

logger = logging.getLogger(__name__)

# Template directory relative to this file
_TEMPLATES_DIR = Path(__file__).parent / "templates"

# Subjects per reminder type
SUBJECT_24H = "Reminder: Upcoming Volunteer Shift Tomorrow"
SUBJECT_2H = "Reminder: Your Volunteer Shift Starts Soon"


def _format_date(ms: int) -> str:
    """Format milliseconds since epoch to e.g. 'Mar 08, 2026'."""
    dt = datetime.fromtimestamp(ms / 1000, tz=timezone.utc)
    return dt.strftime("%b %d, %Y")


def _format_time(ms: int) -> str:
    """Format milliseconds since epoch to e.g. '03:26 PM'."""
    dt = datetime.fromtimestamp(ms / 1000, tz=timezone.utc)
    return dt.strftime("%I:%M %p")


def _duration_hours(shift: ServiceShift) -> str:
    """Duration in hours from shift start/end."""
    hrs = (shift.shift_end - shift.shift_start) / (60 * 60 * 1000)
    return f"{int(hrs)}h" if hrs == int(hrs) else f"{hrs:.1f}h"


def _load_template(name: str) -> str:
    """Load HTML template file."""
    path = _TEMPLATES_DIR / name
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


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
    """Optional shift instructions from the shift record (Mongo ``instructions`` or legacy ``shift_instructions``)."""
    instr = shift.instructions
    if instr is None:
        return ""
    if not isinstance(instr, str):
        return ""
    return instr.strip()


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
        shift_id: Shift ID.
        volunteer_id: Volunteer email.
        reminder_type: 'reminder_24h' or 'reminder_2h'.
        shift: ServiceShift with shift details.
        shelter_repo: Shelter repository.
        user_info_repo: User info repository.

    Raises:
        RuntimeError: If email send fails (caller should not update reminder flags).
    """
    volunteer_name = html_module.escape(_get_volunteer_name(volunteer_id, user_info_repo))
    shelter_name = html_module.escape(_get_shelter_name(shift.shelter_id, shelter_repo))
    shift_date = _format_date(shift.shift_start)
    shift_time = _format_time(shift.shift_start)
    duration = _duration_hours(shift)
    raw_instructions = _get_shift_instructions(shift)
    instructions = html_module.escape(raw_instructions) if raw_instructions else ""

    if reminder_type == "reminder_24h":
        subject = SUBJECT_24H
        html_body = _load_template("reminder_24h.html")
        if instructions:
            instructions_section = (
                f'<div class="instructions">'
                f'<span class="label">Shift Instructions</span>'
                f'<div class="value" style="margin-top: 8px;">{instructions}</div>'
                f"</div>"
            )
        else:
            instructions_section = ""
        html_body = html_body.format(
            volunteer_name=volunteer_name,
            shelter_name=shelter_name,
            shift_date=shift_date,
            shift_time=shift_time,
            duration=duration,
            shift_instructions_section=instructions_section,
        )
    else:
        subject = SUBJECT_2H
        html_body = _load_template("reminder_2h.html")
        html_body = html_body.format(
            volunteer_name=volunteer_name,
            shelter_name=shelter_name,
            shift_time=shift_time,
            shift_date=shift_date,
        )

    send_email(volunteer_id, subject, html_body)

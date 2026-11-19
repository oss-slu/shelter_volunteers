"""Tests for reminder HTML rendering and send wiring."""

# Tests call module-private format helpers for timezone behavior.
# pylint: disable=protected-access

from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest

from domains.service_shift import ServiceShift
import reminder_email.reminder_handler as rh
from reminder_email.reminder_handler import (
    SUBJECT_24H,
    SUBJECT_2H,
    render_reminder_html,
    send_reminder_email,
)


@patch("reminder_email.reminder_handler.send_email")
@patch("reminder_email.reminder_handler._get_shelter_name", return_value="Test Shelter")
@patch("reminder_email.reminder_handler._get_volunteer_name", return_value="Jane Doe")
def test_send_reminder_24h_includes_instructions_in_html(
    mock_vol,
    mock_shelter,
    mock_send,
):  # pylint: disable=unused-argument
    shift = ServiceShift(
        shelter_id="s1",
        shift_start=1_704_067_200_000,
        shift_end=1_704_073_200_000,
        instructions="Bring gloves and ID.",
        _id="sh1",
    )
    shelter_repo = MagicMock()
    user_repo = MagicMock()
    send_reminder_email(
        "sh1", "jane@test.com", "reminder_24h", shift, shelter_repo, user_repo
    )
    mock_send.assert_called_once()
    args = mock_send.call_args[0]
    assert args[0] == "jane@test.com"
    assert args[1] == SUBJECT_24H
    html = args[2]
    assert "Jane Doe" in html
    assert "Test Shelter" in html
    assert "Bring gloves" in html


@patch("reminder_email.reminder_handler.send_email")
@patch("reminder_email.reminder_handler._get_shelter_name", return_value="Test Shelter")
@patch("reminder_email.reminder_handler._get_volunteer_name", return_value="Jane Doe")
def test_send_reminder_2h_subject_and_date(
    mock_vol,
    mock_shelter,
    mock_send,
):  # pylint: disable=unused-argument
    shift = ServiceShift(
        shelter_id="s1",
        shift_start=1_704_067_200_000,
        shift_end=1_704_073_200_000,
        _id="sh1",
    )
    send_reminder_email(
        "sh1", "jane@test.com", "reminder_2h", shift, MagicMock(), MagicMock()
    )
    assert mock_send.call_args[0][1] == SUBJECT_2H
    assert "Jane Doe" in mock_send.call_args[0][2]


@pytest.mark.parametrize("reminder_type", ["reminder_24h", "reminder_2h"])
def test_reminder_variants_render_shared_fields_and_distinct_copy(reminder_type, monkeypatch):
    """Preserve common fields, escaped text, and the details unique to each reminder."""
    monkeypatch.setenv("REMINDER_DISPLAY_TIMEZONE", "UTC")
    shift = ServiceShift(
        shelter_id="s1",
        shift_start=1_704_067_200_000,
        shift_end=1_704_074_400_000,
        instructions="Check at <reception> & bring ID.",
    )

    html = render_reminder_html(reminder_type, shift, "Jane & Alex", "Shelter <A>")

    assert "Hi Jane &amp; Alex" in html
    assert "Shelter &lt;A&gt;" in html
    assert "Jan 01, 2024" in html
    assert "12:00 AM" in html
    if reminder_type == "reminder_24h":
        assert SUBJECT_24H in html
        assert '<div class="value">2h</div>' in html
        assert "Check at &lt;reception&gt; &amp; bring ID." in html
        assert "If you need to cancel" in html
        assert "Quick prep:" not in html
    else:
        assert SUBJECT_2H in html
        assert "Quick prep:" in html
        assert "Shift Instructions" not in html
        assert "If you need to cancel" not in html


def test_24h_reminder_omits_blank_instructions():
    """Hide the instructions section when a shift only has whitespace there."""
    shift = ServiceShift(
        shelter_id="s1",
        shift_start=1_704_067_200_000,
        shift_end=1_704_074_400_000,
        instructions="  ",
    )
    html = render_reminder_html("reminder_24h", shift, "Jane", "Test Shelter")
    assert '<div class="instructions">' not in html


def test_format_time_uses_reminder_display_timezone(monkeypatch):
    """Apr 9 2026 21:40 UTC = 4:40 PM in America/Chicago (CDT)."""
    monkeypatch.setenv("REMINDER_DISPLAY_TIMEZONE", "America/Chicago")
    ms = int(
        datetime(2026, 4, 9, 21, 40, tzinfo=timezone.utc).timestamp() * 1000
    )
    assert rh._format_time(ms) == "04:40 PM"
    assert rh._format_date(ms) == "Apr 09, 2026"


def test_service_shift_from_dict_shift_instructions_alias():
    d = {
        "shelter_id": "x",
        "shift_start": 1,
        "shift_end": 2,
        "shift_instructions": "Park in back lot",
    }
    s = ServiceShift.from_dict(d)
    assert s.instructions == "Park in back lot"

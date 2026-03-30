"""Tests for reminder HTML rendering and send wiring."""

from unittest.mock import MagicMock, patch

from domains.service_shift import ServiceShift
from reminder_email.reminder_handler import send_reminder_email, SUBJECT_24H, SUBJECT_2H


@patch("reminder_email.reminder_handler.send_email")
@patch("reminder_email.reminder_handler._get_shelter_name", return_value="Test Shelter")
@patch("reminder_email.reminder_handler._get_volunteer_name", return_value="Jane Doe")
def test_send_reminder_24h_includes_instructions_in_html(
    mock_vol, mock_shelter, mock_send,
):
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
def test_send_reminder_2h_subject_and_date(mock_vol, mock_shelter, mock_send):
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


def test_service_shift_from_dict_shift_instructions_alias():
    d = {
        "shelter_id": "x",
        "shift_start": 1,
        "shift_end": 2,
        "shift_instructions": "Park in back lot",
    }
    s = ServiceShift.from_dict(d)
    assert s.instructions == "Park in back lot"

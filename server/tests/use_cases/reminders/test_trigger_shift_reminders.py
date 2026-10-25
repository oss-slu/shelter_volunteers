"""Tests for reminder engine (email integration behavior)."""

from unittest.mock import MagicMock, patch

from domains.service_shift import ServiceShift
from use_cases.reminders import trigger_shift_reminders as tr


def test_run_reminder_check_no_handler_does_not_query_or_mark():
    """Without email handler, skip work and do not mark shifts as reminded."""
    shifts_repo = MagicMock()
    commitments_repo = MagicMock()
    tr.run_reminder_check(shifts_repo, commitments_repo, reminder_handler=None)
    shifts_repo.find_shifts_due_for_reminder.assert_not_called()
    shifts_repo.mark_reminder_sent.assert_not_called()


def test_run_reminder_check_marks_after_all_volunteers_succeed():
    """Per-shift flag is set only when every volunteer email succeeds."""
    shift = ServiceShift(
        shelter_id="s1",
        shift_start=1_000_000,
        shift_end=2_000_000,
        _id="shift1",
    )
    shifts_repo = MagicMock()
    commitments_repo = MagicMock()

    shifts_repo.find_shifts_due_for_reminder.return_value = [shift]
    mock_commitment = MagicMock()
    mock_commitment.volunteer_id = "vol@example.com"
    commitments_repo.fetch_service_commitments.return_value = [mock_commitment]

    handler = MagicMock()

    with patch.object(tr, "MS_24H", 1000), patch.object(tr, "MS_2H", 2000):
        with patch.object(tr, "_get_window_ms", return_value=100):
            with patch("time.time", return_value=1.0):
                tr.run_reminder_check(
                    shifts_repo, commitments_repo, reminder_handler=handler
                )

    assert handler.call_count == 2  # 24h + 2h windows
    assert shifts_repo.mark_reminder_sent.call_count == 2


def test_run_reminder_check_no_mark_if_handler_raises():
    """Do not update reminder flags if any email send fails."""
    shift = ServiceShift(
        shelter_id="s1",
        shift_start=1_000_000,
        shift_end=2_000_000,
        _id="shift1",
    )
    shifts_repo = MagicMock()
    commitments_repo = MagicMock()
    shifts_repo.find_shifts_due_for_reminder.return_value = [shift]
    mock_commitment = MagicMock()
    mock_commitment.volunteer_id = "vol@example.com"
    commitments_repo.fetch_service_commitments.return_value = [mock_commitment]

    handler = MagicMock(side_effect=RuntimeError("SendGrid down"))

    with patch.object(tr, "MS_24H", 1000), patch.object(tr, "MS_2H", 2000):
        with patch.object(tr, "_get_window_ms", return_value=100):
            with patch("time.time", return_value=1.0):
                tr.run_reminder_check(
                    shifts_repo, commitments_repo, reminder_handler=handler
                )

    shifts_repo.mark_reminder_sent.assert_not_called()

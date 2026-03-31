"""
Reminder engine: identifies upcoming shifts and triggers reminder notifications.

Runs at scheduled intervals, finds shifts within 24h or 2h windows,
sends reminders to confirmed volunteers (via handler callback), and updates
reminder flags for idempotency.
"""

import logging
import os
import time
from typing import Callable, Optional

from domains.service_shift import ServiceShift

logger = logging.getLogger(__name__)

# Time constants in milliseconds (UTC)
MS_PER_HOUR = 60 * 60 * 1000
MS_24H = 24 * MS_PER_HOUR
MS_2H = 2 * MS_PER_HOUR
MS_15MIN = 15 * 60 * 1000


def _get_window_ms() -> int:
    """Reminder window in ms. Configurable via REMINDER_WINDOW_MINUTES (default 15)."""
    minutes = int(os.environ.get("REMINDER_WINDOW_MINUTES", "15"))
    return minutes * 60 * 1000


def run_reminder_check(
    shifts_repo,
    commitments_repo,
    reminder_handler: Optional[Callable[[str, str, str, ServiceShift], None]] = None,
    window_ms: Optional[int] = None,  # Default from REMINDER_WINDOW_MINUTES env
) -> None:
    """
    Run the reminder check: find shifts due for 24h and 2h reminders,
    trigger notifications for confirmed volunteers, and update flags.

    Args:
        shifts_repo: Repository with find_shifts_due_for_reminder, mark_reminder_sent.
        commitments_repo: Repository with fetch_service_commitments(shift_id=...).
        reminder_handler: Callback(shift_id, volunteer_id, reminder_type, shift).
                          Called for each volunteer. Email delivery plugs in here.
        window_ms: Time window for matching shifts. Default from REMINDER_WINDOW_MINUTES env.
    """
    if window_ms is None:
        window_ms = _get_window_ms()
    now_ms = int(time.time() * 1000)

    for reminder_type, offset_ms in [("reminder_24h", MS_24H), ("reminder_2h", MS_2H)]:
        window_start = now_ms + offset_ms - window_ms
        window_end = now_ms + offset_ms + window_ms

        shifts = shifts_repo.find_shifts_due_for_reminder(
            window_start, window_end, reminder_type
        )

        for shift in shifts:
            shift_id = shift.get_id()
            if not shift_id:
                logger.warning("Reminder skipped: shift has no id")
                continue

            commitments = commitments_repo.fetch_service_commitments(shift_id=shift_id)
            if not commitments:
                logger.info(
                    "Reminder skipped: no confirmed volunteers",
                    extra={"shift_id": shift_id, "reminder_type": reminder_type},
                )
                _mark_reminder_sent(shifts_repo, shift_id, reminder_type)
                continue

            all_success = True
            for commitment in commitments:
                volunteer_id = commitment.volunteer_id
                try:
                    if reminder_handler:
                        reminder_handler(shift_id, volunteer_id, reminder_type, shift)
                    logger.info(
                        "Reminder triggered",
                        extra={
                            "shift_id": shift_id,
                            "volunteer_id": volunteer_id,
                            "reminder_type": reminder_type,
                        },
                    )
                except Exception:  # pylint: disable=broad-exception-caught
                    # Reminder handler is external callback; broad catch for robustness
                    all_success = False
                    logger.exception(
                        "Reminder failed",
                        extra={
                            "shift_id": shift_id,
                            "volunteer_id": volunteer_id,
                            "reminder_type": reminder_type,
                        },
                    )

            if all_success:
                _mark_reminder_sent(shifts_repo, shift_id, reminder_type)
                logger.info(
                    "Reminder flags updated",
                    extra={"shift_id": shift_id, "reminder_type": reminder_type},
                )


def _mark_reminder_sent(shifts_repo, shift_id: str, reminder_type: str) -> bool:
    """Update reminder flag; ensures idempotency."""
    return shifts_repo.mark_reminder_sent(shift_id, reminder_type)

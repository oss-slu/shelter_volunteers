"""
Background scheduler for automated shift reminders.

Runs at a configurable interval (e.g. every 10-15 minutes), uses a lock
to prevent overlapping runs, and triggers the reminder engine.
"""

import logging
import threading

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from repository.mongo.service_shifts import ServiceShiftsMongoRepo
from repository.mongo.service_commitments import MongoRepoCommitments
from use_cases.reminders.trigger_shift_reminders import run_reminder_check

logger = logging.getLogger(__name__)

# Lock to ensure only one scheduler run at a time (prevents overlapping)
_reminder_lock = threading.Lock()

# Default interval: 10 minutes
DEFAULT_INTERVAL_MINUTES = 10


def _run_reminder_job():
    """
    Job executed by the scheduler. Runs reminder check with lock
    to prevent overlapping executions.
    """
    if not _reminder_lock.acquire(blocking=False):
        logger.info("Reminder job skipped: previous run still in progress")
        return
    try:
        logger.info("Reminder scheduler: starting run")
        shifts_repo = ServiceShiftsMongoRepo()
        commitments_repo = MongoRepoCommitments()
        run_reminder_check(shifts_repo, commitments_repo)
        logger.info("Reminder scheduler: run completed")
    except Exception:  # pylint: disable=broad-exception-caught
        # Broad catch needed: scheduler job can fail for many reasons (DB, repos, etc.)
        logger.exception("Reminder scheduler: run failed", exc_info=True)
    finally:
        _reminder_lock.release()


def start_reminder_scheduler(interval_minutes: int = DEFAULT_INTERVAL_MINUTES):
    """
    Start the background scheduler for shift reminders.

    Args:
        interval_minutes: How often to run the reminder check (default 10).
    """
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        _run_reminder_job,
        trigger=IntervalTrigger(minutes=interval_minutes),
        id="shift_reminder_job",
        replace_existing=True,
    )
    scheduler.start()
    logger.info(
        "Reminder scheduler started",
        extra={"interval_minutes": interval_minutes},
    )
    return scheduler

"""
Run the shift reminder engine once (same logic as the 10-minute scheduler job).

Use this to test reminder emails without waiting for the background scheduler.

Prerequisites:
  - Atlas / Mongo reachable (same as Flask: FLASK_ENV + .env file)
  - SENDGRID_API_KEY + SENDGRID_FROM_EMAIL (verified sender)
  - At least one shift + commitment where shift_start falls in the 24h or 2h
    window: approximately (now + 24h ± REMINDER_WINDOW_MINUTES) or same for 2h.
    Default REMINDER_WINDOW_MINUTES is 15 — for easier testing you can set e.g.
    REMINDER_WINDOW_MINUTES=1440 in .env.pre-production temporarily.

Usage (bash, from server/):

    export FLASK_ENV=pre-production
    python scripts/run_reminder_check_once.py
"""

import logging
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

_SERVER_DIR = Path(__file__).resolve().parent.parent
if str(_SERVER_DIR) not in sys.path:
    sys.path.insert(0, str(_SERVER_DIR))

# App imports require ``server`` on path (see block above).
# pylint: disable=wrong-import-position
from reminder_email.reminder_handler import send_reminder_email
from repository.mongo.service_commitments import MongoRepoCommitments
from repository.mongo.service_shifts import ServiceShiftsMongoRepo
from repository.mongo.shelter import ShelterRepo
from repository.mongo.user_info_repository import UserInfoRepository
from use_cases.reminders.trigger_shift_reminders import run_reminder_check


def _load_env():
    os.chdir(_SERVER_DIR)
    env = os.environ.get("FLASK_ENV", "pre-production")
    env_file = _SERVER_DIR / f".env.{env}"
    if env_file.exists():
        load_dotenv(env_file)
    load_dotenv(_SERVER_DIR / ".env")


def main():
    _load_env()
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    )

    if not os.environ.get("SENDGRID_API_KEY"):
        print("SENDGRID_API_KEY not set — reminder run will skip sending.")
        print("Add it to .env.pre-production (with FLASK_ENV=pre-production).")

    # Same wiring as scheduler.reminder_scheduler._run_reminder_job (no lock)
    logger = logging.getLogger(__name__)
    logger.info("Running reminder check once (manual)")

    shifts_repo = ServiceShiftsMongoRepo()
    commitments_repo = MongoRepoCommitments()
    shelter_repo = ShelterRepo()
    user_info_repo = UserInfoRepository()

    def email_handler(shift_id, volunteer_id, reminder_type, shift):
        send_reminder_email(
            shift_id,
            volunteer_id,
            reminder_type,
            shift,
            shelter_repo,
            user_info_repo,
        )

    reminder_handler = (
        email_handler if os.environ.get("SENDGRID_API_KEY") else None
    )
    run_reminder_check(
        shifts_repo, commitments_repo, reminder_handler=reminder_handler
    )
    logger.info("Reminder check once — finished")


if __name__ == "__main__":
    main()

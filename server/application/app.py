"""
This module handles the creation of Flask app
"""

from flask import Flask, send_from_directory
from dotenv import load_dotenv

from application.rest.repeatable_shifts import repeatable_shifts_bp
from application.rest.service_commitment import service_commitment_bp
from application.rest.shelter import shelter_blueprint
from application.rest.service_shifts import service_shift_bp
from application.rest.authorization.authorization import authorization_blueprint
from application.rest.login import login_blueprint
from application.rest.user_info import user_info_bp
from application.rest.waitlist import waitlist_bp

from config import mongodb_config
from scheduler.reminder_scheduler import start_reminder_scheduler
import logging
import os


def _configure_reminder_logging():
    """Configure logging so reminder scheduler activity appears in the terminal."""
    handler = logging.StreamHandler()
    handler.setLevel(logging.INFO)
    handler.setFormatter(logging.Formatter(
        "%(asctime)s [%(name)s] %(levelname)s: %(message)s"
    ))
    for name in (
        "scheduler.reminder_scheduler",
        "use_cases.reminders.trigger_shift_reminders",
        "reminder_email.reminder_handler",
        "reminder_email.email_service",
    ):
        logger = logging.getLogger(name)
        logger.setLevel(logging.INFO)
        if not logger.handlers:
            logger.addHandler(handler)


def create_app(config_name="development"):
    """
    The function  creates the Flask application.
    """

    app = Flask(__name__, static_folder=None)
    config_module = f"application.config.{config_name.capitalize()}Config"
    app.config.from_object(config_module)

    mongo_config = mongodb_config.get_config()
    app.config.from_object(mongo_config)

    app.register_blueprint(shelter_blueprint)
    app.register_blueprint(service_commitment_bp)
    app.register_blueprint(service_shift_bp)
    app.register_blueprint(authorization_blueprint)
    app.register_blueprint(login_blueprint)
    app.register_blueprint(repeatable_shifts_bp)
    app.register_blueprint(user_info_bp)
    app.register_blueprint(waitlist_bp)

    load_dotenv()  # Load environment variables from the .env file

    # Configure logging so reminder scheduler activity appears in the terminal
    _configure_reminder_logging()

    # Start automated shift reminder scheduler (runs every 10 min)
    start_reminder_scheduler(interval_minutes=10)

    # Serve static files
    react_build_dir = os.path.abspath("../build/")

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve(path):
        if path != "" and os.path.exists(os.path.join(react_build_dir, path)):
            return send_from_directory(react_build_dir, path)
        # If no static file is found, return index.html
        # to let React handle routing
        return send_from_directory(react_build_dir, "index.html")

    return app

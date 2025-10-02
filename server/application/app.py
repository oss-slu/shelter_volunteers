"""
This module handles the creation of Flask app
"""
from flask import Flask, send_from_directory
from dotenv import load_dotenv

from application.rest.service_commitment import service_commitment_bp
from application.rest.shelter import shelter_blueprint
from application.rest.service_shifts import service_shift_bp
from application.rest.authorization.authorization import authorization_blueprint
from application.rest.login import login_blueprint
from application.rest.schedule import schedule_bp
from application.rest.user_info import user_info_bp

from config import mongodb_config
import os


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
    app.register_blueprint(schedule_bp)
    app.register_blueprint(user_info_bp)

    load_dotenv()  # Load environment variables from the .env file

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

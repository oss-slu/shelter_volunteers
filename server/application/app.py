"""
This module handles the creation of Flask app
"""
from flask import Flask, send_from_directory
from dotenv import load_dotenv

from application.rest import work_shift
from application.rest.service_shifts import service_shift_bp
from application.rest import service_commitment
from config import mongodb_config
import os

def create_app(config_name = "development"):
    """
    The function  creates the Flask application.
    """

    app = Flask(__name__, static_folder=None)
    config_module = f"application.config.{config_name.capitalize()}Config"
    app.config.from_object(config_module)

    mongo_config = mongodb_config.get_config()
    app.config.from_object(mongo_config)

    app.register_blueprint(work_shift.blueprint)
    app.register_blueprint(service_commitment.blueprint)
    app.register_blueprint(service_shift_bp)
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

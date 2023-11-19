"""
This module handles the creation of Flask app
"""
from flask import Flask
from application.rest import work_shift
from dotenv import load_dotenv

def create_app(config_name):
    """
    The function  creates the Flask application.
    """
    app = Flask(__name__)
    config_module = f"application.config.{config_name.capitalize()}Config"
    app.config.from_object(config_module)
    app.register_blueprint(work_shift.blueprint)
    load_dotenv()  # Load environment variables from the .env file


    return app

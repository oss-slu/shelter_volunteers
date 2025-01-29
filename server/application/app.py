"""
This module handles the creation of Flask app
"""
from flask import Flask
from application.rest import work_shift
from dotenv import load_dotenv
from config import mongodb_config


def create_app(config_name):
    """
    The function  creates the Flask application.
    """
    app = Flask(__name__)
    config_module = f"application.config.{config_name.capitalize()}Config"
    app.config.from_object(config_module)

    mongo_config = mongodb_config.get_config()
    app.config.from_object(mongo_config)
    
    app.register_blueprint(work_shift.blueprint)
    load_dotenv()  # Load environment variables from the .env file


    return app

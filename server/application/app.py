"""
This module handles the creation of Flask app
"""
from flask import Flask, jsonify
from application.rest import work_shift
from errors.authentication import AuthenticationError
from errors.not_found import NotFoundError


def create_app(config_name):
    """
    The function  creates the Flask application.
    """
    app = Flask(__name__)
    config_module = f"application.config.{config_name.capitalize()}Config"
    app.config.from_object(config_module)
    app.register_blueprint(work_shift.blueprint)

    @app.errorhandler(AuthenticationError)
    def handle_authentication_error(error):
        response = jsonify({"error": error.message})
        response.status_code = 401
        return response

    @app.errorhandler(NotFoundError)
    def handle_not_found_error(error):
        response = jsonify({"error": error.message})
        response.status_code = 404
        return response

    return app

"""
Initializes the Flask application and CORS configuration.
"""
import os

from flask_cors import CORS
from application.app import create_app

app = create_app(os.environ["FLASK_CONFIG"])

CLIENT_URLS = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]

cors = CORS(app, resources={r"*": {"origins": CLIENT_URLS}})

"""
Initializes the Flask application and CORS configuration.
"""
import os

from flask_cors import CORS
from application.app import create_app

app = create_app(os.environ["FLASK_CONFIG"])

DEFAULT_CLIENT_URLS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5001",
    "http://127.0.0.1:5001",
    "https://amp-biblical-invoice-document.trycloudflare.com",
    r"https://.*\.trycloudflare\.com",
]

configured_client_urls = [
    url.strip()
    for url in os.environ.get("CLIENT_URLS", "").split(",")
    if url.strip()
]

CLIENT_URLS = configured_client_urls or DEFAULT_CLIENT_URLS

cors = CORS(
    app,
    resources={r"*": {"origins": CLIENT_URLS}},
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)

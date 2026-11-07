"""
Initializes the Flask application and CORS configuration.
"""
import os

if os.environ.get("VERCEL"):
    os.environ.setdefault("FLASK_ENV", "pre-production")
    if os.environ["FLASK_ENV"] != "pre-production":
        raise RuntimeError("Vercel requires FLASK_ENV=pre-production for MongoDB Atlas")
    if os.environ.get("FLASK_CONFIG", "production") != "production":
        raise RuntimeError("Vercel requires FLASK_CONFIG=production")
    required = (
        "MONGODB_HOST", "MONGODB_USERNAME", "MONGODB_PASSWORD",
        "JWT_SECRET", "GOOGLE_CLIENT_ID",
    )
    missing = [name for name in required if not os.environ.get(name, "").strip()]
    if missing:
        missing_names = ", ".join(missing)
        raise RuntimeError(f"Missing Vercel environment variables: {missing_names}")

from flask_cors import CORS
from application.app import create_app
from application.api_prefix import ApiPrefixMiddleware

config_name = (
    os.environ.get("FLASK_CONFIG", "production")
    if os.environ.get("VERCEL")
    else os.environ["FLASK_CONFIG"]
)
app = create_app(config_name)

if os.environ.get("VERCEL"):
    app.wsgi_app = ApiPrefixMiddleware(app.wsgi_app)

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

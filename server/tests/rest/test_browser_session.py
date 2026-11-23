"""Tests for cookie-based browser authentication."""

from unittest.mock import patch

import pytest
from flask import Flask
from flask_cors import CORS

from application.rest.login import login_blueprint
from application.rest.token_required import token_required_with_request
from authentication.token import create_token


SECRET = "test-secret-for-jwt-signing-at-least-32-bytes"
SESSION_HEADERS = {"X-Volunteer-Session": "1"}


@pytest.fixture(name="client")
def browser_client():
    app = Flask(__name__)
    app.config.update(TESTING=True, JWT_SECRET=SECRET, BROWSER_SESSION_COOKIE_SECURE=True)
    app.register_blueprint(login_blueprint)

    @app.route("/protected", methods=["GET", "POST"])
    @token_required_with_request
    def protected(email):
        return {"email": email}

    CORS(app, origins=["https://client.example"], supports_credentials=True,
         allow_headers=["Content-Type", "X-Volunteer-Session", "Authorization"])
    return app.test_client()


def test_cookie_login_restore_csrf_and_logout(client):
    with patch("application.rest.login.authenticate_admin", return_value=True):
        response = client.post(
            "/login/local-admin", headers=SESSION_HEADERS,
            json={"email": "admin@example.com", "password": "test-password"},
        )
    assert response.status_code == 200
    assert "access_token" not in response.json
    cookie = response.headers["Set-Cookie"]
    assert "HttpOnly" in cookie and "Secure" in cookie and "SameSite=Lax" in cookie
    restored = client.get("/session", headers=SESSION_HEADERS)
    assert restored.json["user"]["email"] == "admin@example.com"
    assert client.post("/protected", headers=SESSION_HEADERS).json["email"] == "admin@example.com"
    assert client.post("/protected").status_code == 403
    assert client.delete("/session").status_code == 403
    assert client.delete("/session", headers=SESSION_HEADERS).status_code == 200
    assert client.get("/session", headers=SESSION_HEADERS).status_code == 401


def test_expired_cookie_and_legacy_bearer_token(client):
    expired = create_token({"email": "admin@example.com"}, SECRET, expiration=-1)
    with patch("application.rest.login.authenticate_admin", return_value=True), \
         patch("application.rest.login.create_token", return_value=expired):
        client.post("/login/local-admin", headers=SESSION_HEADERS,
                    json={"email": "admin@example.com", "password": "test-password"})
    assert client.get("/session", headers=SESSION_HEADERS).status_code == 401
    token = create_token({"email": "admin@example.com"}, SECRET)
    response = client.get("/protected", headers={"Authorization": token})
    assert response.json == {"email": "admin@example.com"}


@pytest.mark.parametrize("provider", ["google", "gethelp"])
def test_other_signin_providers_issue_restorable_cookie(client, provider):
    profile = {"email": "user@example.com", "name": "User Name", "picture": ""}
    if provider == "google":
        with patch("application.rest.login.verify_google_token", return_value=profile):
            response = client.post(
                "/login", headers=SESSION_HEADERS, json={"idToken": "google-token"}
            )
    else:
        with patch("application.rest.login.login_user") as login_user, \
             patch("application.rest.login.get_user", return_value={
                 "email": "user@example.com", "firstName": "User", "lastName": "Name"
             }):
            login_user.return_value.json.return_value = {"access_token": "gethelp-token"}
            response = client.post("/login/password", headers=SESSION_HEADERS,
                                   json={"email": "user@example.com", "password": "test-password"})
    assert response.status_code == 200
    assert response.json == {"user": profile}
    restored = client.get("/session", headers=SESSION_HEADERS)
    assert restored.json == {"user": profile}
    assert restored.headers["Cache-Control"] == "no-store"


def test_preflight_allows_only_configured_origin(client):
    headers = {
        "Origin": "https://client.example",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type,x-volunteer-session",
    }
    response = client.options("/login/local-admin", headers=headers)
    assert response.headers["Access-Control-Allow-Origin"] == "https://client.example"
    assert response.headers["Access-Control-Allow-Credentials"] == "true"
    headers["Origin"] = "https://attacker.example"
    response = client.options("/login/local-admin", headers=headers)
    assert "Access-Control-Allow-Origin" not in response.headers

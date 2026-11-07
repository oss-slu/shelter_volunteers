"""Tests for GetHelp email/password authentication."""
# pylint: disable=redefined-outer-name,unused-argument

import json
from unittest.mock import Mock, patch

import pytest
from flask import Flask
from requests.exceptions import HTTPError

from application.rest.login import login_blueprint


@pytest.fixture
def client():
    """Create a minimal Flask client for the login blueprint."""
    app = Flask(__name__)
    app.config.update(TESTING=True, JWT_SECRET="test-secret")
    app.register_blueprint(login_blueprint)
    return app.test_client()


@patch("application.rest.login.create_token", return_value="app-jwt")
@patch(
    "application.rest.login.get_user",
    return_value={
        "email": "admin@example.com",
        "firstName": "Admin",
        "lastName": "User",
    },
)
@patch("application.rest.login.login_user")
def test_password_login_returns_app_token_and_user(
    mock_login_user, mock_get_user, mock_create_token, client
):
    """Valid GetHelp credentials produce the app's own auth token."""
    token_response = Mock()
    token_response.json.return_value = {"access_token": "gethelp-token"}
    mock_login_user.return_value = token_response

    response = client.post(
        "/login/password",
        json={"email": "admin@example.com", "password": "secret-password"},
    )

    assert response.status_code == 200
    assert response.get_json() == {
        "access_token": "app-jwt",
        "user": {
            "email": "admin@example.com",
            "name": "Admin User",
            "picture": "",
        },
    }
    mock_login_user.assert_called_once_with("admin@example.com", "secret-password")
    mock_get_user.assert_called_once_with("gethelp-token")
    mock_create_token.assert_called_once_with(
        {"email": "admin@example.com"},
        "test-secret",
    )


def test_password_login_requires_email_and_password(client):
    """Missing credentials are rejected before contacting GetHelp."""
    response = client.post("/login/password", json={"email": "admin@example.com"})

    assert response.status_code == 400
    assert response.get_json() == {"message": "Email and password are required"}


@patch("application.rest.login.login_user")
def test_password_login_rejects_invalid_credentials(mock_login_user, client):
    """GetHelp authentication failures become a generic authorization response."""
    mock_login_user.side_effect = HTTPError(
        response=Mock(status_code=401),
    )

    response = client.post(
        "/login/password",
        json={"email": "admin@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 403
    assert response.get_json() == {"message": "Invalid email or password"}
    assert "wrong-password" not in json.dumps(response.get_json())

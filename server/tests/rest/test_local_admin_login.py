"""Tests for local system-admin credentials and sign-in."""
# pylint: disable=redefined-outer-name,unused-argument

from datetime import datetime, timezone
from unittest.mock import Mock, patch

import pytest
from flask import Flask
from werkzeug.security import check_password_hash

from application.rest.login import login_blueprint
from authentication import local_admin
from authentication.token import get_email_from_token
from cli import admin_cli
from domains.authorization.access import Access
from domains.resources import Resources


class FakeCredentials:
    """Minimal credential collection for testing the authentication flow."""

    def __init__(self):
        self.records = {}

    def update_one(self, query, update, upsert=False):
        email = query["_id"]
        record = self.records.get(email)
        if record is None:
            if not upsert:
                return
            record = {"_id": email}
            self.records[email] = record
        if "$or" in query:
            started = record.get("window_started")
            cutoff = query["$or"][1]["window_started"]["$lte"]
            if started is not None and started > cutoff:
                return
        record.update(update.get("$set", {}))
        for field in update.get("$unset", {}):
            record.pop(field, None)

    def find_one_and_update(self, query, update):
        record = self.records.get(query["_id"])
        if record is None or record.get("attempts", 0) >= query["attempts"]["$lt"]:
            return None
        previous = record.copy()
        record["attempts"] += update["$inc"]["attempts"]
        return previous


@pytest.fixture
def local_store():
    credentials = FakeCredentials()
    database = Mock(local_admin_credentials=credentials)
    permission = Mock()
    permission.is_system_admin.return_value = True
    permission.full_access = []
    permission_repo = Mock()
    permission_repo.get_user_permissions.return_value = permission
    with patch.object(local_admin, "get_db", return_value=database), patch.object(
        local_admin, "PermissionsMongoRepo", return_value=permission_repo
    ):
        yield credentials, permission


def test_password_is_hashed_and_validates_existing_admin(local_store):
    credentials, _ = local_store
    password = "example-test-password"
    local_admin.set_admin_password("admin@example.com", password)

    stored = credentials.records["admin@example.com"]["password_hash"]
    assert password not in stored
    assert check_password_hash(stored, password)
    assert local_admin.authenticate_admin("admin@example.com", password)
    assert not local_admin.authenticate_admin("admin@example.com", "wrong")
    assert not local_admin.authenticate_admin("missing@example.com", password)


def test_password_setup_requires_admin_and_minimum_length(local_store):
    credentials, permission = local_store
    with pytest.raises(ValueError, match="between 12"):
        local_admin.set_admin_password("admin@example.com", "short")
    permission.is_system_admin.return_value = False
    with pytest.raises(ValueError, match="admin permission"):
        local_admin.set_admin_password("admin@example.com", "example-test-password")
    assert not credentials.records


@patch("cli.admin_cli.set_admin_password")
@patch("cli.admin_cli.getpass.getpass")
def test_cli_confirms_password_without_echo(mock_getpass, mock_set_password, capsys):
    mock_getpass.side_effect = ["example-test-password", "example-test-password"]
    admin_cli.set_local_password("admin@example.com")
    mock_set_password.assert_called_once_with("admin@example.com", "example-test-password")
    assert "example-test-password" not in capsys.readouterr().out


@patch("cli.admin_cli.set_admin_password")
@patch("cli.admin_cli.getpass.getpass")
def test_cli_rejects_mismatched_confirmation(mock_getpass, mock_set_password):
    mock_getpass.side_effect = ["example-test-password", "different-test-password"]
    with pytest.raises(ValueError, match="do not match"):
        admin_cli.set_local_password("admin@example.com")
    mock_set_password.assert_not_called()


def test_revoked_admin_cannot_sign_in(local_store):
    _, permission = local_store
    local_admin.set_admin_password("admin@example.com", "example-test-password")
    permission.is_system_admin.return_value = False
    assert not local_admin.authenticate_admin("admin@example.com", "example-test-password")


def test_shelter_admin_can_sign_in_until_shelter_permission_is_revoked(local_store):
    _, permission = local_store
    permission.is_system_admin.return_value = False
    permission.full_access = [Access(Resources.SHELTER, ["0123456789abcdef01234567"])]
    local_admin.set_admin_password("shelter@example.com", "example-test-password")
    assert local_admin.authenticate_admin("shelter@example.com", "example-test-password")
    permission.full_access = []
    assert not local_admin.authenticate_admin("shelter@example.com", "example-test-password")


def test_failed_attempts_temporarily_lock_account_and_password_reset_unlocks(local_store):
    credentials, _ = local_store
    local_admin.set_admin_password("admin@example.com", "example-test-password")
    for _ in range(local_admin.MAX_ATTEMPTS):
        assert not local_admin.authenticate_admin("admin@example.com", "wrong")
    assert not local_admin.authenticate_admin("admin@example.com", "example-test-password")

    credentials.records["admin@example.com"]["window_started"] = (
        datetime.now(timezone.utc) - local_admin.ATTEMPT_WINDOW
    )
    assert local_admin.authenticate_admin("admin@example.com", "example-test-password")
    for _ in range(local_admin.MAX_ATTEMPTS):
        assert not local_admin.authenticate_admin("admin@example.com", "wrong")
    local_admin.set_admin_password("admin@example.com", "another-test-password")
    assert local_admin.authenticate_admin("admin@example.com", "another-test-password")


@pytest.fixture
def client():
    app = Flask(__name__)
    app.config.update(TESTING=True, JWT_SECRET="test-secret-for-jwt-signing-at-least-32-bytes")
    app.register_blueprint(login_blueprint)
    return app.test_client()


def test_local_login_returns_app_jwt(client, local_store):
    local_admin.set_admin_password("admin@example.com", "example-test-password")
    response = client.post(
        "/login/local-admin",
        json={"email": "admin@example.com", "password": "example-test-password"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["user"]["email"] == "admin@example.com"
    assert get_email_from_token(
        data["access_token"], "test-secret-for-jwt-signing-at-least-32-bytes"
    ) == "admin@example.com"


def test_local_login_rejects_bad_credentials_and_input(client, local_store):
    local_admin.set_admin_password("admin@example.com", "example-test-password")
    response = client.post(
        "/login/local-admin",
        json={"email": "admin@example.com", "password": "wrong"},
    )
    assert response.status_code == 403
    assert "wrong" not in response.get_data(as_text=True)
    assert client.post("/login/local-admin", json=[]).status_code == 400
    assert client.post(
        "/login/local-admin",
        json={"email": "admin@example.com", "password": "x" * 1025},
    ).status_code == 400

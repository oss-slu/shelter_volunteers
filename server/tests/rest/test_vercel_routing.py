"""Verify the Vercel API prefix and reminder scheduler behavior."""
# create_app is imported inside the tests that need it: importing
# application.app at module level registers every blueprint with its real
# permission decorators during collection, which breaks tests that patch
# those decorators before importing a blueprint (e.g. test_repeatable_shifts).
# pylint: disable=redefined-outer-name,import-outside-toplevel

import os
import runpy
from pathlib import Path
from unittest.mock import patch

import pytest
from flask import Flask, request

from application.api_prefix import ApiPrefixMiddleware


@pytest.fixture
def client():
    app = Flask(__name__)

    @app.get("/health")
    def health():
        return {
            "path": request.path,
            "script_root": request.script_root,
            "example": request.args.get("example"),
        }

    app.wsgi_app = ApiPrefixMiddleware(app.wsgi_app)
    return app.test_client()


def test_api_prefix_is_stripped_and_query_preserved(client):
    response = client.get("/api/health?example=1")
    assert response.status_code == 200
    assert response.json == {
        "path": "/health", "script_root": "/api", "example": "1"
    }


def test_other_paths_are_not_rewritten(client):
    assert client.get("/health").status_code == 200
    assert client.get("/apix/health").status_code == 404


@patch("application.app.start_reminder_scheduler")
def test_scheduler_is_disabled_on_vercel(mock_scheduler, monkeypatch):
    from application.app import create_app
    monkeypatch.setenv("VERCEL", "1")
    app = create_app("production")
    app.wsgi_app = ApiPrefixMiddleware(app.wsgi_app)
    client = app.test_client()
    assert client.get("/api/health").json == {"status": "ok"}
    assert client.get("/api/unknown-route").status_code == 404
    mock_scheduler.assert_not_called()


@patch("application.app.start_reminder_scheduler")
def test_scheduler_remains_enabled_outside_vercel(mock_scheduler, monkeypatch):
    from application.app import create_app
    monkeypatch.delenv("VERCEL", raising=False)
    create_app("testing")
    mock_scheduler.assert_called_once_with(interval_minutes=10)


def test_vercel_entrypoint_defaults_and_wraps_app(monkeypatch):
    monkeypatch.setenv("VERCEL", "1")
    monkeypatch.delenv("FLASK_ENV", raising=False)
    monkeypatch.delenv("FLASK_CONFIG", raising=False)
    required = ("MONGODB_HOST", "MONGODB_USERNAME", "MONGODB_PASSWORD",
                "JWT_SECRET", "GOOGLE_CLIENT_ID")
    for name in required:
        monkeypatch.setenv(name, "test-value")
    app = Flask(__name__)
    with patch("application.app.create_app", return_value=app) as factory:
        runpy.run_module("wsgi")
    factory.assert_called_once_with("production")
    assert os.environ["FLASK_ENV"] == "pre-production"
    assert isinstance(app.wsgi_app, ApiPrefixMiddleware)


def test_vercel_entrypoint_reports_missing_configuration(monkeypatch):
    monkeypatch.setenv("VERCEL", "1")
    monkeypatch.setenv("FLASK_ENV", "pre-production")
    monkeypatch.delenv("MONGODB_HOST", raising=False)
    with pytest.raises(RuntimeError, match="MONGODB_HOST"):
        runpy.run_module("wsgi")


def test_vercel_entrypoint_rejects_local_database_mode(monkeypatch):
    monkeypatch.setenv("VERCEL", "1")
    monkeypatch.setenv("FLASK_ENV", "development")
    with pytest.raises(RuntimeError, match="FLASK_ENV=pre-production"):
        runpy.run_module("wsgi")


def test_vercel_entrypoint_rejects_development_flask_config(monkeypatch):
    monkeypatch.setenv("VERCEL", "1")
    monkeypatch.setenv("FLASK_ENV", "pre-production")
    monkeypatch.setenv("FLASK_CONFIG", "development")
    with pytest.raises(RuntimeError, match="FLASK_CONFIG=production"):
        runpy.run_module("wsgi")


def test_gethelp_api_override_is_preserved(monkeypatch):
    monkeypatch.setenv("GETHELP_API", "https://example.test/")
    runpy.run_path(str(Path(__file__).parents[2] / "application" / "config.py"))
    assert os.environ["GETHELP_API"] == "https://example.test/"

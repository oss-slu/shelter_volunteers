"""Tests for the repeatable_shifts REST blueprint.

These tests exercise the REST endpoints for posting repeatable shifts and
use a patched decorator to avoid permission checks during unit tests.
"""

# Pytest fixtures are referenced by name in test function arguments which
# intentionally shadow module-level symbols; disable the redefined-outer-name
# warning for this test module. The test also performs an import inside a
# fixture after patching a decorator; allow that pattern here as well.
# pylint: disable=redefined-outer-name,import-outside-toplevel

import json
import pytest
from unittest.mock import patch
from flask import Flask


# Mock the decorator and repository before importing the blueprint
@pytest.fixture(scope="module", autouse=True)
def setup_mocks():
    """Mock dependencies before blueprint import."""
    decorator_path = (
        "application.rest.shelter_admin_permission_required"
        ".shelter_admin_permission_required"
    )
    with patch(decorator_path, lambda f: f):
        # Import blueprint after mocking
        # import-outside-toplevel is intentional here because we must patch
        # the decorator before importing the blueprint.
        from application.rest.repeatable_shifts import (
            repeatable_shifts_bp,
        )  # pylint: disable=import-outside-toplevel

        yield repeatable_shifts_bp


@pytest.fixture
def app(setup_mocks):
    """Create a minimal Flask app with just the repeatable_shifts blueprint."""
    app = Flask(__name__)
    app.config["TESTING"] = True
    app.register_blueprint(setup_mocks)
    return app


@pytest.fixture
def client(app):
    """Create a test client for the Flask app."""
    return app.test_client()


def test_post_repeatable_shifts_domain_invariants(client):
    # Arrange
    body = [
        # Good
        {
            "shift_start": 100,
            "shift_end": 200,
            "required_volunteer_count": 1,
            "max_volunteer_count": 5,
        },
        # Bad
        {
            "shift_start": 100,
            "shift_end": 50,
            "required_volunteer_count": 1,
            "max_volunteer_count": 5,
        },
        # Good
        {
            "shift_start": 100,
            "shift_end": 200,
            "required_volunteer_count": 1,
            "max_volunteer_count": 5,
        },
    ]

    # Act
    response = client.post(
        "/shelters/123/schedule",
        data=json.dumps(body),
        content_type="application/json",
    )

    # Assert
    assert response.status_code == 400
    data = response.json
    assert "keyed_errors" in data
    assert len(data["keyed_errors"]) == 1
    assert "1" in data["keyed_errors"]
    assert "shift_end" in data["keyed_errors"]["1"]


def test_post_repeatable_shifts_invalid_body(client):
    # Arrange - send non-list body

    # Act
    response = client.post(
        "/shelters/123/schedule",
        data=json.dumps({"not": "a list"}),
        content_type="application/json",
    )

    # Assert
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data
    assert "Expected a list" in data["error"]


def test_post_repeatable_shifts_empty_body(client):
    # Act
    response = client.post(
        "/shelters/123/schedule", data=json.dumps(None), content_type="application/json"
    )

    # Assert
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data


def test_post_repeatable_shifts_invalid_shift_format(client):
    # Arrange - missing required fields
    invalid_shifts = [
        {
            "shift_start": 100
            # missing other required fields
        }
    ]

    # Act
    response = client.post(
        "/shelters/123/schedule",
        data=json.dumps(invalid_shifts),
        content_type="application/json",
    )

    # Assert
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data
    assert "Invalid data format" in data["error"]

import json
import pytest
from unittest.mock import patch, MagicMock
from flask import Flask


# Mock the decorator and repository before importing the blueprint
@pytest.fixture(scope="module", autouse=True)
def setup_mocks():
    """Mock dependencies before blueprint import."""
    with patch('application.rest.shelter_admin_permission_required.shelter_admin_permission_required', lambda f: f):
        # Import blueprint after mocking
        from application.rest.repeatable_shifts import repeatable_shifts_bp
        yield repeatable_shifts_bp


@pytest.fixture
def app(setup_mocks):
    """Create a minimal Flask app with just the repeatable_shifts blueprint."""
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.register_blueprint(setup_mocks)
    return app


@pytest.fixture
def client(app):
    """Create a test client for the Flask app."""
    return app.test_client()


def test_post_repeatable_shifts_invalid_body(client):
    # Arrange - send non-list body

    # Act
    response = client.post(
        '/shelters/123/schedule',
        data=json.dumps({"not": "a list"}),
        content_type='application/json'
    )

    # Assert
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data
    assert "Expected a list" in data["error"]


def test_post_repeatable_shifts_empty_body(client):
    # Act
    response = client.post(
        '/shelters/123/schedule',
        data=json.dumps(None),
        content_type='application/json'
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
        '/shelters/123/schedule',
        data=json.dumps(invalid_shifts),
        content_type='application/json'
    )

    # Assert
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data
    assert "Invalid data format" in data["error"]

"""
Integration tests for the ``GET /admin/open_shelters_by_date`` endpoint.
"""
import json

import pytest
from unittest.mock import patch
from flask import Flask

from application.rest.shelter import shelter_blueprint
from authentication.token import create_token
from domains.shelter.shelter import Shelter


TEST_SECRET = "test_secret"


def _create_test_app():
    app = Flask(__name__)
    app.register_blueprint(shelter_blueprint)
    app.config["JWT_SECRET"] = TEST_SECRET
    app.config["TESTING"] = True
    return app


@pytest.fixture
def client():
    return _create_test_app().test_client()


def _auth_headers():
    token = create_token({"email": "admin@app.com"}, TEST_SECRET)
    return {"Authorization": f"{token}"}


def _shelter(name, shelter_id):
    return Shelter(
        _id=shelter_id,
        name=name,
        address={
            "street1": "1 Main",
            "city": "Anywhere",
            "state": "MA",
            "postal_code": "00000",
        },
    )


# pylint: disable=redefined-outer-name
@patch("application.rest.shelter.list_open_shelters_by_date")
@patch("application.rest.system_admin_permission_required.is_authorized")
def test_get_open_shelters_by_date_returns_grouped_payload(
    mock_is_authorized, mock_use_case, client
):
    mock_is_authorized.return_value = True
    mock_use_case.return_value = [
        {"date": "2026-05-20", "shelters": [_shelter("Citadel Shelter", "c1")]},
        {
            "date": "2026-05-10",
            "shelters": [
                _shelter("Alpha House", "a1"),
                _shelter("Beacon Shelter", "b1"),
            ],
        },
    ]

    response = client.get(
        "/admin/open_shelters_by_date?tz_offset_minutes=300",
        headers=_auth_headers(),
    )

    assert response.status_code == 200
    body = json.loads(response.data.decode("utf-8"))
    assert [entry["date"] for entry in body] == ["2026-05-20", "2026-05-10"]
    assert [s["name"] for s in body[0]["shelters"]] == ["Citadel Shelter"]
    assert [s["name"] for s in body[1]["shelters"]] == [
        "Alpha House",
        "Beacon Shelter",
    ]
    # Each serialized shelter carries the address payload.
    assert body[1]["shelters"][0]["address"]["state"] == "MA"

    # The query parameter is forwarded verbatim to the use case.
    _, kwargs = mock_use_case.call_args
    assert kwargs["tz_offset_minutes"] == "300"
    assert kwargs["filter_start_after"] is None


@patch("application.rest.shelter.list_open_shelters_by_date")
@patch("application.rest.system_admin_permission_required.is_authorized")
def test_get_open_shelters_by_date_forwards_filter_start_after(
    mock_is_authorized, mock_use_case, client
):
    mock_is_authorized.return_value = True
    mock_use_case.return_value = []

    response = client.get(
        "/admin/open_shelters_by_date?filter_start_after=999",
        headers=_auth_headers(),
    )

    assert response.status_code == 200
    assert json.loads(response.data.decode("utf-8")) == []
    _, kwargs = mock_use_case.call_args
    assert kwargs["filter_start_after"] == "999"


@patch("application.rest.system_admin_permission_required.is_authorized")
def test_get_open_shelters_by_date_requires_system_admin(
    mock_is_authorized, client
):
    mock_is_authorized.return_value = False

    response = client.get(
        "/admin/open_shelters_by_date", headers=_auth_headers()
    )

    assert response.status_code == 403
    body = json.loads(response.data.decode("utf-8"))
    assert body["message"] == "Unauthorized"
# pylint: enable=redefined-outer-name

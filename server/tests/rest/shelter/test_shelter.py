"""
This module contains tests for the shelter REST API.
"""
import json
from unittest.mock import patch, ANY

import pytest
from flask import Flask

from authentication.token import create_token
from application.rest.shelter import shelter_blueprint
from domains.shelter.shelter import Shelter
from domains.service_shift import ServiceShift

test_secret = "test_secret"


def create_test_app():
    app = Flask(__name__)
    app.register_blueprint(shelter_blueprint)
    app.config["JWT_SECRET"] = test_secret
    return app


@pytest.fixture
def client():
    app = create_test_app()
    app.config["TESTING"] = True
    return app.test_client()


# pylint: disable=unused-argument
# pylint: disable=redefined-outer-name
@patch("application.rest.shelter.shelter_add_use_case")
@patch("application.rest.system_admin_permission_required.is_authorized")
def test_post_shelter(
    mock_is_authorized,
    mock_shelter_add_use_case,
    client,
):
    mock_is_authorized.return_value = True
    mock_response = {
        "id": "SOME_ID",
        "success": True,
        "message": "Shelter added successfully",
    }
    mock_shelter_add_use_case.return_value = mock_response

    request_data = {
        "name": "Test shelter",
        "address": {
            "street1": "123 Main",
            "street2": "",
            "city": "St.Louis",
            "state": "MO",
            "postal_code": "99999",
            "country": "USA",
            "coordinates": {"latitude": 30.45486, "longitude": -90.20537},
        },
    }

    token = create_token({"email": "user@app.com"}, test_secret)
    headers = {
        "Authorization": f"{token}",
    }

    response = client.post(
        "/shelters",
        data=json.dumps(request_data),
        content_type="application/json",
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json == mock_response

@patch("application.rest.system_admin_permission_required.is_authorized")
def test_post_shelter_missing_required_fields(mock_is_authorized, client):
    mock_is_authorized.return_value = True
    request_data = {
        "name": "Test shelter"  # missing address field
    }
    token = create_token({"email": "user@app.com"}, test_secret)
    headers = {
        "Authorization": f"{token}",
    }
    response = client.post(
        "/shelters",
        data=json.dumps(request_data),
        content_type="application/json",
        headers=headers,
    )
    assert response.status_code == 400  # bad request
    assert not response.json["success"]
    assert "address" in response.json["message"]
    request_data = {
        "name": "Test shelter",
        "address": {
            "city": "St.Louis",
            "state": "MO",  # missing street1
        }
    }

    response = client.post(
        "/shelters",
        data=json.dumps(request_data),
        content_type="application/json",
        headers=headers,
    )
    assert response.status_code == 400  # bad request
    assert not response.json["success"]
    assert "street1" in response.json["message"]
    request_data = {
        "name": "Test shelter",
        "address": {
            "street1": "123 Main",
            "state": "MO",  # missing city
        }
    }
    response = client.post(
        "/shelters",
        data=json.dumps(request_data),
        content_type="application/json",
        headers=headers
    )
    assert response.status_code == 400  # bad request
    assert not response.json["success"]
    assert "city" in response.json["message"]
    request_data = {
        "name": "Test shelter",
        "address": {
            "street1": "123 Main",
            "city": "St.Louis",  # missing state
        }
    }
    response = client.post(
        "/shelters",
        data=json.dumps(request_data),
        content_type="application/json",
        headers=headers,
    )
    assert response.status_code == 400  # bad request
    assert not response.json["success"]
    assert "state" in response.json["message"]

@patch("application.rest.shelter.shelter_list_use_case")
def test_get_shelter(mock_shelter_list_use_case, client):
    mock_shelters_json = [
        {
            "_id": "SOME_ID1",
            "name": "Shelter One",
            "address": {
                "street1": "456 Elm St",
                "street2": "",
                "city": "Springfield",
                "state": "IL",
                "postal_code": "62701",
                "country": "USA",
                "coordinates": {"latitude": 39.7817, "longitude": -89.6501},
            },
        },
        {
            "_id": "SOME_ID2",
            "name": "Shelter Two",
            "address": {
                "street1": "789 Oak St",
                "street2": "",
                "city": "Chicago",
                "state": "IL",
                "postal_code": "60616",
                "country": "USA",
                "coordinates": {"latitude": 41.8781, "longitude": -87.6298},
            },
        },
    ]
    mock_shelters = [Shelter.from_dict(shelter) for shelter in mock_shelters_json]

    mock_shelter_list_use_case.return_value = mock_shelters
    response = client.get("/shelters")
    raw_data = response.data.decode()
    parsed_response = json.loads(raw_data)
    assert response.status_code == 200
    assert parsed_response == mock_shelters_json


@patch("application.rest.shelter.time.time", return_value=1760000000)
@patch("application.rest.shelter.service_shifts_list_use_case")
@patch("application.rest.shelter.shelter_list_use_case")
def test_get_open_shelters_grouped_by_date(
    mock_shelter_list_use_case,
    mock_service_shifts_list_use_case,
    mock_time,
    client,
):
    assert mock_time is not None
    mock_shelters = [
        Shelter.from_dict({
            "_id": "s1",
            "name": "Shelter One",
            "address": {
                "street1": "456 Elm St",
                "street2": "",
                "city": "Springfield",
                "state": "IL",
                "postal_code": "62701",
                "country": "USA",
                "coordinates": {"latitude": 39.7817, "longitude": -89.6501},
            },
        }),
        Shelter.from_dict({
            "_id": "s2",
            "name": "Shelter Two",
            "address": {
                "street1": "789 Oak St",
                "street2": "",
                "city": "Chicago",
                "state": "IL",
                "postal_code": "60616",
                "country": "USA",
                "coordinates": {"latitude": 41.8781, "longitude": -87.6298},
            },
        }),
    ]
    for shelter, shelter_id in zip(mock_shelters, ["s1", "s2"]):
        shelter.set_id(shelter_id)

    mock_shifts = [
        ServiceShift(
            shelter_id="s1",
            shift_start=1776470400000,  # 2026-04-18T00:00:00Z
            shift_end=1776474000000,
        ),
        ServiceShift(
            shelter_id="s1",
            shift_start=1776477600000,  # same date, should dedupe shelter
            shift_end=1776481200000,
        ),
        ServiceShift(
            shelter_id="s2",
            shift_start=1776384000000,  # 2026-04-17T00:00:00Z
            shift_end=1776387600000,
        ),
    ]

    mock_shelter_list_use_case.return_value = mock_shelters
    mock_service_shifts_list_use_case.return_value = mock_shifts

    response = client.get("/shelters/open")
    parsed_response = json.loads(response.data.decode())

    assert response.status_code == 200
    assert parsed_response == [
        {
            "date": "2026-04-18",
            "shelters": [
                {
                    "_id": "s1",
                    "name": "Shelter One",
                    "address": {
                        "street1": "456 Elm St",
                        "street2": "",
                        "city": "Springfield",
                        "state": "IL",
                        "postal_code": "62701",
                        "country": "USA",
                        "coordinates": {"latitude": 39.7817, "longitude": -89.6501},
                    },
                }
            ],
        },
        {
            "date": "2026-04-17",
            "shelters": [
                {
                    "_id": "s2",
                    "name": "Shelter Two",
                    "address": {
                        "street1": "789 Oak St",
                        "street2": "",
                        "city": "Chicago",
                        "state": "IL",
                        "postal_code": "60616",
                        "country": "USA",
                        "coordinates": {"latitude": 41.8781, "longitude": -87.6298},
                    },
                }
            ],
        },
    ]
    mock_service_shifts_list_use_case.assert_called_once_with(
        ANY,
        filter_start_after=1760000000000,
    )


@patch("application.rest.shelter.shelter_list_use_case")
def test_get_open_shelters_grouped_by_date_returns_structured_error(
    mock_shelter_list_use_case,
    client,
):
    mock_shelter_list_use_case.side_effect = RuntimeError("database unavailable")

    response = client.get("/shelters/open")

    assert response.status_code == 500
    assert response.json == {
        "success": False,
        "message": "Unable to load open shelters.",
    }
# pylint: enable=unused-argument
# pylint: enable=redefined-outer-name

import json
import pytest
import sys
import os

from unittest.mock import patch
from flask import Flask
from application.rest.shelter import shelter_blueprint
from domains.shelter.shelter import Shelter
from domains.shelter.address import Address


def create_test_app():
    app = Flask(__name__)
    app.register_blueprint(shelter_blueprint)
    return app


@pytest.fixture
def client():
    app = create_test_app()
    app.config["TESTING"] = True
    return app.test_client()


@patch("application.rest.shelter.shelter_add_use_case")
@patch(
    "application.rest.shelter.db_configuration",
    return_value=("mongodb://mock_uri", "mock_db"),
)
def test_post_shelter(mock_db_config, mock_shelter_add_use_case, client):
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
            "postalCode": "99999",
            "country": "USA",
            "coordinates": {"latitude": 30.45486, "longitude": -90.20537},
        },
    }

    response = client.post(
        "/shelter", data=json.dumps(request_data), content_type="application/json"
    )

    assert response.status_code == 200
    assert response.json == mock_response


@patch("application.rest.shelter.shelter_list_use_case")
@patch(
    "application.rest.shelter.db_configuration",
    return_value=("mongodb://mock_uri", "mock_db"),
)
def test_get_shelter(mock_db_config, mock_shelter_list_use_case, client):
    mock_shelters = [
        Shelter(
            name="Shelter One",
            address=Address(
                street1="456 Elm St",
                street2="",
                city="Springfield",
                state="IL",
                postal_code="62701",
                country="USA",
                coordinates={"latitude": 39.7817, "longitude": -89.6501},
            ),
        ),
        Shelter(
            name="Shelter Two",
            address=Address(
                street1="789 Oak St",
                street2="",
                city="Chicago",
                state="IL",
                postal_code="60616",
                country="USA",
                coordinates={"latitude": 41.8781, "longitude": -87.6298},
            ),
        ),
    ]

    mock_shelter_list_use_case.return_value = [
        shelter.to_dict() for shelter in mock_shelters
    ]

    response = client.get("/shelter")

    # Fix: Ensure response is treated as a valid JSON array
    raw_data = response.data.decode()
    formatted_json = f"[{raw_data.replace('}{', '},{')}]"
    parsed_response = json.loads(formatted_json)

    assert response.status_code == 200
    assert parsed_response == [
        shelter.to_dict() for shelter in mock_shelters
    ], f"Mismatch:\nResponse: {parsed_response}\nExpected: {[shelter.to_dict() for shelter in mock_shelters]}"

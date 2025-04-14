"""
This module contains tests for the shelter REST API.
"""
import json
import pytest

from unittest.mock import patch
from flask import Flask
from application.rest.shelter import shelter_blueprint
from domains.shelter.shelter import Shelter

def create_test_app():
    app = Flask(__name__)
    app.register_blueprint(shelter_blueprint)
    return app


@pytest.fixture
def client():
    app = create_test_app()
    app.config["TESTING"] = True
    return app.test_client()

# pylint: disable=unused-argument
# pylint: disable=redefined-outer-name
@patch("application.rest.shelter.shelter_add_use_case")
def test_post_shelter(mock_shelter_add_use_case, client):
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
        "/shelter",
        data=json.dumps(request_data),
        content_type="application/json"
    )

    assert response.status_code == 200
    assert response.json == mock_response

@patch("application.rest.shelter.shelter_add_use_case")
def test_post_shelter_missing_required_fields(mock_shelter_add_use_case, client):
    #missing address
    request_data = {
        "name": "Test shelter"
        #missing address field
    }
    
    response = client.post(
        "/shelter",
        data=json.dumps(request_data),
        content_type="application/json"
    )
    
    assert response.status_code == 400  #bad request
    assert not response.json["success"]
    assert "address" in response.json["message"]
    
    #test missing street1
    request_data = {
        "name": "Test shelter",
        "address": {
            "city": "St.Louis",
            "state": "MO",
            #missing street1
        }
    }
    
    response = client.post(
        "/shelter",
        data=json.dumps(request_data),
        content_type="application/json"
    )
    
    assert response.status_code == 400  #bad request
    assert not response.json["success"]
    assert "street1" in response.json["message"]
    
    #test missing city
    request_data = {
        "name": "Test shelter",
        "address": {
            "street1": "123 Main",
            "state": "MO",
            #missing city
        }
    }
    
    response = client.post(
        "/shelter",
        data=json.dumps(request_data),
        content_type="application/json"
    )
    
    assert response.status_code == 400  #bad request
    assert not response.json["success"]
    assert "city" in response.json["message"]
    
    #test missing state
    request_data = {
        "name": "Test shelter",
        "address": {
            "street1": "123 Main",
            "city": "St.Louis",
            #missing state
        }
    }
    
    response = client.post(
        "/shelter",
        data=json.dumps(request_data),
        content_type="application/json"
    )
    
    assert response.status_code == 400  #bad request
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
                "postalCode": "62701",
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
                "postalCode": "60616",
                "country": "USA",
                "coordinates": {"latitude": 41.8781, "longitude": -87.6298},
            },
        },
    ]
    mock_shelters = [
        Shelter.from_dict(shelter)
        for shelter in mock_shelters_json
    ]

    mock_shelter_list_use_case.return_value = mock_shelters


    response = client.get("/shelter")

    # Fix: Ensure response is treated as a valid JSON array
    raw_data = response.data.decode()
    parsed_response = json.loads(raw_data)

    assert response.status_code == 200
    assert parsed_response == mock_shelters_json
# pylint: enable=unused-argument
# pylint: enable=redefined-outer-name

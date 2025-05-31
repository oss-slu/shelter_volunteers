"""
Test cases for the service commitment API endpoints.
"""
import pytest

from unittest.mock import patch
from flask import Flask
from application.rest.service_commitment import service_commitment_bp
from domains.service_commitment import ServiceCommitment
from domains.service_shift import ServiceShift
from domains.shelter.shelter import Shelter
from authentication.token import create_token

test_secret = "test_secret"
def create_test_app():
    app = Flask(__name__)
    app.register_blueprint(service_commitment_bp)
    app.config["JWT_SECRET"] = test_secret
    return app

@pytest.fixture
def client():
    app = create_test_app()
    app.config["TESTING"] = True
    return app.test_client()


# pylint: disable=unused-argument
# pylint: disable=redefined-outer-name
# pylint: disable=line-too-long
@patch("application.rest.service_commitment.list_service_commitments_with_shifts")
@patch("application.rest.service_commitment.list_shelters_for_shifts")
def test_get_commitments_with_augmented_data(
    mock_list_shelters_for_shifts,
    mock_list_service_commitments_with_shifts,
    client):

    mock_commitments_json = [
        {
            "_id": "SOME_ID1",
            "service_shift_id": "SHIFT_ID1",
            "volunteer_id": "VOLUNTEER_ID1",
        },
        {
            "_id": "SOME_ID2",
            "service_shift_id": "SHIFT_ID2",
            "volunteer_id": "VOLUNTEER_ID2",
        },
    ]
    mock_commitments = [
        ServiceCommitment.from_dict(commitment)
        for commitment in mock_commitments_json
    ]

    mock_shifts_json = [
        {
            "_id": "SHIFT_ID1",
            "shelter_id": "SHELTER_ID1",
            "shift_start": "10000",
            "shift_end": "20000",
            "required_volunteer_count": 1,
            "max_volunteer_count": 5,
            "shift_name": "Morning Shift",
            "can_sign_up": True,
            # Other shift details...
        },
        {
            "_id": "SHIFT_ID2",
            "shelter_id": "SHELTER_ID2",
            "shift_start": "50000",
            "shift_end": "60000",
            "required_volunteer_count": 1,
            "max_volunteer_count": 5,
            "shift_name": "Evening Shift",
            "can_sign_up": True,
            # Other shift details...
        },
    ]

    mock_shifts = [
        ServiceShift.from_dict(shift)
        for shift in mock_shifts_json
    ]
    mock_shelters_json = [
        {
            "_id": "SHELTER_ID1",
            "name": "Shelter 1",
            "address": {
                "street1": "123 Main St",
                "city": "Cityville",
                "state": "State",
                "postal_code": "12345",
                "street2": "",
                "country": "USA",
                "coordinates": {
                    "latitude": None,
                    "longitude": None
                }
            },
            # Other shelter details...
        },
        {
            "_id": "SHELTER_ID2",
            "name": "Shelter 2",
            "address": {
                "street1": "456 Elm St",
                "city": "Townsville",
                "state": "State",
                "postal_code": "67890",
                "street2": "",
                "country": "USA",
                "coordinates": {
                    "latitude": None,
                    "longitude": None
                }
            },
            # Other shelter details...
        },
    ]
    mock_shelters = [
        Shelter.from_dict(shelter)
        for shelter in mock_shelters_json
    ]

    mock_list_service_commitments_with_shifts.return_value = (mock_commitments, mock_shifts)
    mock_list_shelters_for_shifts.return_value = mock_shelters

    token = create_token({"email": "user@app.com"}, test_secret)
    headers = {
        "Authorization": f"{token}"
    }
    response = client.get(
        "/service_commitment?include_shift_details=true",  
        headers=headers)

    # remove _id from mock_shifts_json
    for shift in mock_shifts_json:
        if "_id" in shift:
            del shift["_id"]
    for i in range(len(mock_commitments_json)):
        mock_commitments_json[i].update({**mock_shifts_json[i]})
        mock_commitments_json[i].update({"shelter": mock_shelters_json[i]})
    assert response.status_code == 200
    assert response.json == mock_commitments_json
    assert mock_list_service_commitments_with_shifts.called
    assert mock_list_shelters_for_shifts.called
    mock_list_service_commitments_with_shifts.assert_called_once()
    mock_list_shelters_for_shifts.assert_called_once()
# pylint: enable=unused-argument
# pylint: enable=redefined-outer-name
# pylint: enable=line-too-long

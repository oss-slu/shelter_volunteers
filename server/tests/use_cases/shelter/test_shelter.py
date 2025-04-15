"""
Module containing test cases for adding shelters.
"""

import pytest
from unittest import mock
from domains.shelter.shelter import Shelter
from use_cases.shelters.add_shelter_use_case import shelter_add_use_case

@pytest.fixture
def shelter_data():
    """
    Fixture that returns a mock Shelter instance.
    """
    return Shelter(
        name="Safe Haven Shelter",
        address={
            "street1": "123 Main St",
            "city": "Springfield",
            "state": "IL",
            "postal_code": "62701"
        }
    )

# pylint: disable=redefined-outer-name
def test_shelter_add_use_case(shelter_data):
    repo = mock.Mock()
    shelter_id = "SHELTER_ID"
    #mocking repo.add to insert an _id field in the shelter data
    def mock_add(shelter_dict):
        shelter_dict["_id"] = shelter_id
        return shelter_dict
    repo.add.side_effect = mock_add
    #calling fxn
    response = shelter_add_use_case(repo, shelter_data)
    #expected response
    expected_response = {
        "id": shelter_id,
        "success": True,
        "message": "Shelter added successfully"
    }
    assert response == expected_response
    repo.add.assert_called_once_with(shelter_data.to_dict())

# pylint: enable=redefined-outer-name

def test_shelter_add_use_case_with_missing_fields():
    """
    Test that validation fails when required fields are missing.
    """
    repo = mock.Mock()
    #shelter with missing req. fields should raise ValueError
    with pytest.raises(ValueError) as excinfo:
        shelter_data = {
            "name": "Invalid Shelter",
            "address": {
                #missing required fields
                "postal_code": "12345"
            }
        }
        #raise ValueError due to missing fields
        invalid_shelter = Shelter.from_dict(shelter_data)
        shelter_add_use_case(repo, invalid_shelter)
    #verify error message contains missing field information
    assert "Missing required address fields" in str(excinfo.value)

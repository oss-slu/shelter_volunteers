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
        address="123 Main St, Springfield"
    )

# pylint: disable=redefined-outer-name
def test_shelter_add_use_case(shelter_data):
    repo = mock.Mock()
    shelter_id = "SHELTER_ID"
    # Mocking repo.add to insert an _id field in the shelter data
    def mock_add(shelter_dict):
        shelter_dict["_id"] = shelter_id
        return shelter_dict
    repo.add.side_effect = mock_add
    # Call the function
    response = shelter_add_use_case(repo, shelter_data)
    # Expected response
    expected_response = {
        "id": shelter_id,
        "success": True,
        "message": "Shelter added successfully"
    }
    assert response == expected_response
    repo.add.assert_called_once_with(shelter_data.to_dict())

# pylint: enable=redefined-outer-name
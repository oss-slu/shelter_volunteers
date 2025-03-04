"""
Module containing test cases for adding work shifts.
"""

import pytest
from unittest import mock
from domains.shelter.shelter import Shelter


class MockShelterRepo:
    def add(self, shelter):
        shelter_id = shelter.pop("_id")
        self.collection.insert_one(shelter)
        
        return  {
                    'id': shelter_id,
                    'success': 'true',
                    'message': 'shelter added successfully'
                }

        
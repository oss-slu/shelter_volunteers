"""
This module contains the use case for getting a shelter by its id.
"""

from repository.mongo.shelter import ShelterRepo


def get_shelter_by_id(shelter_id: str, shelter_repo: ShelterRepo):
    """
    The function retrieves a shelter from the repository by its id.
    """

    return shelter_repo.get_by_id(shelter_id)

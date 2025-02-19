"""
This module contains the use case for listing shelters.
"""
from domains.shelter.shelter import Shelter

def shelter_list_use_case(repo):
    """
    The function retrieves shelters from the chosen database.
    """
    shelters = repo.list()
    return shelters

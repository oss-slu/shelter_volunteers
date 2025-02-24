"""
This module contains the use case for listing shifts.
"""

def service_shifts_list_use_case(repo):
    """
    The function retrieves shelters from the chosen database.
    """
    list_service_shifts = repo.list()
    return list_service_shifts
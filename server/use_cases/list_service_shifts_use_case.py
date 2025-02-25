"""
This module contains the use case for listing shifts.
"""

def service_shifts_list_use_case(repo, shelter=None):
    """
    The function retrieves shelters from the chosen database.
    """
    list_service_shifts = repo.list(shelter)
    return list_service_shifts

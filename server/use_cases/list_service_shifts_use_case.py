"""
This module contains the use case for listing shifts.
"""

def service_shifts_list_use_case(repo, shelter=None, filter_start_after=None):
    """
    Retrieves service shifts, filtered by shelter and optional start time.

    Args:
        repo: The repository for accessing service shifts.
        shelter (int, optional): The ID of the shelter.
        filter_start_after (int, optional): The minimum start time.

    Returns:
        list: A list of service shift records.
    """
    return repo.list(shelter, filter_start_after)

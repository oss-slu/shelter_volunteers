"""
This module contains the use case for listing shifts.
"""
from use_cases.list_service_commitments import list_service_commitments

def service_shifts_list_use_case(
        shifts_repo,
        shelter=None,
        filter_start_after=None):
    """
    Retrieves service shifts, filtered by shelter and optional start time.

    Args:
        repo: The repository for accessing service shifts.
        shelter (int, optional): The ID of the shelter.
        filter_start_after (int, optional): The minimum start time.

    Returns:
        list: A list of service shift records.
    """
    service_shifts = shifts_repo.list(shelter, filter_start_after)
    return service_shifts

def list_service_shifts_with_volunteers_use_case(
        shifts_repo,
        commitments_repo,
        shelter=None,
        filter_start_after=None):
    """
    Retrieves service shifts along with associated volunteers.

    Args:
        shifts_repo: The repository for accessing service shifts.
        commitments_repo: The repository for accessing service commitments.
        shelter (int, optional): The ID of the shelter.
        filter_start_after (int, optional): The minimum start time.

    Returns:
        tuple: A tuple containing a list of service shift records and a list of volunteers.
    """
    service_shifts = service_shifts_list_use_case(shifts_repo, shelter, filter_start_after)
    volunteers = []
    if commitments_repo:
        for shift in service_shifts:
            commitments = list_service_commitments(
                commitments_repo,
                None, # volunteer_id
                shift.get_id()
            )
            volunteers.append(commitments)
    return service_shifts, volunteers

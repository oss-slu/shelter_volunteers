"""
This module contains the use case for listing shifts.
"""
from use_cases.list_service_commitments import list_service_commitments
from request.time_filter import build_time_filter
def service_shifts_list_use_case(
        shifts_repo,
        commitments_repo,
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
    time_filter = build_time_filter()

    for shift in service_shifts:
        commitments = list_service_commitments(
            commitments_repo,
            shifts_repo,
            time_filter,
            None,
            shift.get_id()
        )
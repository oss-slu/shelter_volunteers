"""
This module contains the use case for listing service commitments.
"""
from datetime import datetime


def list_service_commitments(
        commitments_repo,
        user_email=None,
        shift_id=None):
    commitments = commitments_repo.fetch_service_commitments(
        user_email,
        shift_id)
    return commitments


def list_service_commitments_with_shifts(
        commitments_repo,
        shifts_repo,
        time_filter,
        user_email=None,
        shift_id=None):
    """
    Retrieves service commitments based on provided filters.

    Args:
        commitments_repo: A repository object that 
        contains all service commitments
        shifts_repo: A repository object that contains all service shifts
        time_filter: object exposing get_filter('start_after'|'start_before')
        user_email (str, optional): The user's email.
        shift_id (str, optional): The ID of the service shift to filter by.

    Returns:
        tuple: A tuple containing (list of service commitment objects, 
        list of associated service shift objects)
    """
    commitments = list_service_commitments(
        commitments_repo,
        user_email,
        shift_id)
    shift_ids = [commitment.service_shift_id for commitment in commitments]
    shifts = shifts_repo.get_shifts(shift_ids)

    now = datetime.utcnow()
    completed_shift_ids = {
        s.get_id() for s in shifts
        if getattr(s, "shift_end", None) is not None and s.shift_end <= now
    }

    if completed_shift_ids:
        commitments = [c for c in commitments if c.service_shift_id in completed_shift_ids]
        shifts = [s for s in shifts if s.get_id() in completed_shift_ids]
    else:
        # Nothing completed -> return empty aligned lists
        return ([], [])

    for filter_key, comparison in [
        ("start_after",  lambda shift, value: shift.shift_start >= value),
        ("start_before", lambda shift, value: shift.shift_start < value)
    ]:
        filter_value = time_filter.get_filter(filter_key)
        if filter_value:
            filtered_ids = {
                s.get_id() for s in shifts if comparison(s, filter_value)
            }
            commitments = [
                c for c in commitments if c.service_shift_id in filtered_ids
            ]
            shifts = [shift for shift in shifts if shift.get_id() in filtered_ids]

    return (commitments, shifts)

"""
This module contains the use case for listing work shifts.
"""
from responses import ResponseSuccess
from use_cases.filter_by_time import apply_time_filters

def workshift_list_use_case(repo, request, user):
    """
    The function returns a list of all workshifts in the in-memory database.
    """
    user_shifts = repo.list(user)
    if request.filters:
        user_shifts = apply_time_filters(user_shifts, request.filters)
    return ResponseSuccess(user_shifts)

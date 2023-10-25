"""
This module contains the use case for counting volunteers.
"""
from responses import ResponseSuccess


def count_volunteers_use_case(repo, request, shelter):
    shifts = repo.list(None, filters=request.filters, shelter=shelter)
    print(shifts)
    return ResponseSuccess(shifts)

"""
This module contains the use case for adding work shifts.
"""
def workshift_add_use_case(repo, work_shift):
    """
    The function adds a work shift into the chosen database.
    """
    repo.add(work_shift)
def workshift_add_multiple_use_case(repo, work_shifts):
    """
    The function adds multiple work shifts into the chosen database.
    """
    for work_shift in work_shifts:
        workshift_add_use_case(repo, work_shift)

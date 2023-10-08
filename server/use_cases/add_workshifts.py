"""
This module contains the use case for adding work shifts.
"""
def workshift_add_use_case(repo, work_shift):
    """
    The function adds a workshift into the in-memory database.
    """
    repo.add(work_shift)
    
def workshift_add_multiple_use_case(repo, work_shifts):
    """
    The function adds multiple workshifts into the in-memory database.
    """
    for work_shift in work_shifts:
        repo.add(work_shift)

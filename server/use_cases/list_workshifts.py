"""
This module contains the use case for listing work shifts.
"""
def workshift_list_use_case(repo, user):
    """
    The function returns a list of all workshifts in the in-memory database.
    """
    return repo.list(user)

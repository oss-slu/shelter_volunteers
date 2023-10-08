"""
This module contains use cases for work shifts.
"""

from errors.not_found import NotFoundError
from errors.authentication import AuthenticationError
from repository.memrepo import MemRepo

def workshift_list_use_case(repo: MemRepo):
    """
    Returns a list of all work shifts in the in-memory database.

    Args:
        repo (MemRepo): An instance of MemRepo.

    Returns:
        list: A list of WorkShift objects.
    """
    return repo.list()

def delete_shift_use_case(repo: MemRepo, shift_id: str, user_email: str):
    """
    Deletes a work shift with the given ID from the repository if authorized.

    Args:
        repo (MemRepo): An instance of MemRepo.
        shift_id (str): ID of the shift to be deleted.
        user_email (str): Email of the user making the request.

    Raises:
        AuthenticationError: If user authentication fails.
        NotFoundError: If the specified shift is not found.
    """
    if not user_email:
        raise AuthenticationError("Authentication failed")

    shift = repo.get_by_id(shift_id)

    if shift is None:
        raise NotFoundError("Shift not found")

    if shift.worker != user_email:
        raise AuthenticationError("Unauthorized to delete this shift")

    repo.delete(shift_id)

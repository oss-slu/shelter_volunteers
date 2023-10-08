from errors.not_found import NotFoundError
from errors.authentication import AuthenticationError
from repository.memrepo import MemRepo
from domains.work_shift import WorkShift

"""
This module contains the use case for listing work shifts.
"""
def workshift_list_use_case(repo):
    """
    The function returns a list of all workshifts in the in-memory database.
    """
    return repo.list()


def delete_shift_use_case(repo, shift_id, user_email):
    if not user_email:
        raise AuthenticationError("Authentication failed")

    shift = repo.get_by_id(shift_id)

    if shift is None:
        raise NotFoundError("Shift not found")

    if shift.worker != user_email:
        raise AuthenticationError("Unauthorized to delete this shift")

    repo.delete(shift_id)

    return shift 







"""
This module contains the use case for listing work shifts.
"""
def workshift_list_use_case(repo):
    """
    The function returns a list of all workshifts in the in-memory database.
    """
    return repo.list()


def delete_shift_use_case(repo, shift_id):
    shift = repo.get_by_id(shift_id)

    if shift is None:
        raise {"message": "Shift not found"}

    repo.delete(shift_id)

    return {"message": "Shift deleted successfully"}
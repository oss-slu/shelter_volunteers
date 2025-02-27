"""
Module for handling service commitments.
Provides functions to create and retrieve service commitments for users.
"""

def add_service_commitments(commitments_repo, shifts_repo, commitments):
    """
    Creates service commitments for the given user and shifts.

    Args:
        commitments_repo: A repository object that stores 
                        all service commitments
        shifts_repo: A repository object that stores all
                     service shifts
        commitments: A list of ServiceCommitment objects to be added

    Returns:
        list: A list of dictionaries indicating
        the success and service commitment IDs.
    """
    shift_ids = [c.service_shift_id for c in commitments]
    shifts = shifts_repo.get_shifts(shift_ids)

    # temporary implementation for overlapping shifts
    # Needs to be fixed later to match the requirements
    has_overlap = check_time_overlap(shifts)
    if has_overlap:
        return [{
            "service_commitment_id": None
            , "success": False}]

    commitments_as_dict = [c.to_dict() for c in commitments]
    commitments_repo.insert_service_commitments(commitments_as_dict)
    return [{
        "service_commitment_id": str(c["_id"])
        , "success": True}
            for c in commitments_as_dict]

def check_time_overlap(shifts):
    """
    Check if the shifts have overlapping times.
    """
    for i in range(len(shifts)):
        for j in range(i + 1, len(shifts)):
            if (shifts[i].shift_start < shifts[j].shift_end and
                shifts[i].shift_end > shifts[j].shift_start):
                return True
    return False

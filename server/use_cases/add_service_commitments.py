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
    existing_shifts = {
        (s.get_id()): s for s in shifts_repo.get_shifts(shift_ids)
    }

    valid_commitments = []
    results = []

    for commitment in commitments:
        shift_id = commitment.service_shift_id
        if shift_id not in existing_shifts:
            results.append({
                "service_commitment_id": None,
                "success": False,
                "message": f"cannot commit to non-existing shift {shift_id}"
            })
            continue
        valid_commitments.append(commitment)
        results.append(None) # placeholder to fill

    if not valid_commitments:
        return [r for r in results if r is not None]

    # check for time overlap in valid shift only
    valid_shifts = [existing_shifts[c.service_shift_id] for
        c in valid_commitments]

    if check_time_overlap(valid_shifts):
        return [{
            "service_commitment_id": None,
            "success": False
        }]

    # insert valid commitments
    commitments_as_dict = [c.to_dict() for c in valid_commitments]
    inserted_commitments = (
        commitments_repo.insert_service_commitments(commitments_as_dict)
    )

    # fill in success results for valid commitments
    idx = 0
    for i in range(len(results)):
        if results[i] is None:
            results[i] = {
                "service_commitment_id": str(inserted_commitments[idx]),
                "success": True
            }
            idx += 1

    return results

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

"""
Module for handling service commitments.
Provides functions to create and retrieve service commitments for users.
"""

def add_service_commitments(commitments_repo, shifts_repo, commitments):
    """
    Creates service commitments for the given user and shifts.
    Prevents creation of commitments with overlapping time slots.

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
    # If no commitments, return empty list
    if not commitments:
        return []

    # Extract shift IDs and check if they exist
    shift_ids = [c.service_shift_id for c in commitments]
    existing_shifts = {
        str(s.get_id()): s for s in shifts_repo.get_shifts(shift_ids)
    }
    # Initialize results and track valid commitments
    valid_commitments = []
    results = []
    valid_indexes = []

    # First pass: validate shifts exist
    for i, commitment in enumerate(commitments):
        shift_id = commitment.service_shift_id
        if shift_id not in existing_shifts:
            results.append({
                "service_commitment_id": None,
                "success": False,
                "message": (
                    f"cannot commit to non-existing shift {shift_id}"
                )
            })
        else:
            valid_commitments.append(commitment)
            valid_indexes.append(i)
            results.append(None)  # placeholder for now

    if not valid_commitments:
        return results
    user_id = valid_commitments[0].volunteer_id
    existing_user_commitments = commitments_repo.fetch_service_commitments(
        user_id=user_id)
    existing_commitment_shift_ids = [str(c.service_shift_id)
                                     for c in existing_user_commitments
                                     if c.service_shift_id is not None]
    existing_user_shifts = shifts_repo.get_shifts(existing_commitment_shift_ids)
    valid_shifts = [existing_shifts[c.service_shift_id]
                    for c in valid_commitments]
    final_valid_commitments = []
    final_valid_indexes = []
    for i, idx in enumerate(valid_indexes):
        current_shift = valid_shifts[i]
        has_overlap = False
        for existing_shift in existing_user_shifts:
            if (current_shift.shift_start < existing_shift.shift_end and
                current_shift.shift_end > existing_shift.shift_start):
                has_overlap = True
                break
        for approved_shift in [valid_shifts[j] for j in
                               range(i) if j in final_valid_indexes]:
            if (current_shift.shift_start < approved_shift.shift_end and
                current_shift.shift_end > approved_shift.shift_start):
                has_overlap = True
                break
        if has_overlap:
            # Reject this commitment due to overlap
            results[idx] = {
                "service_commitment_id": None,
                "success": False,
                "message": "Overlapping commitment"
            }
        else:
            # Accept this commitment
            final_valid_commitments.append(valid_commitments[i])
            final_valid_indexes.append(idx)

    if not final_valid_commitments:
        # Make sure all placeholders are filled
        for i in valid_indexes:
            if results[i] is None:
                results[i] = {
                    "service_commitment_id": None,
                    "success": False,
                    "message": "Overlapping commitment"
                }
        return results

    commitments_as_dict = [c.to_dict() for c in final_valid_commitments]
    inserted_commitments = commitments_repo.insert_service_commitments(
        commitments_as_dict)

    for idx, i in enumerate(final_valid_indexes):
        if idx < len(inserted_commitments):
            results[i] = {
                "service_commitment_id": str(inserted_commitments[idx]),
                "success": True
            }
        else:
            results[i] = {
                "service_commitment_id": None,
                "success": False,
                "message": "Failed to insert commitment"
            }

    # Make sure all placeholders are filled
    for i in valid_indexes:
        if results[i] is None:
            results[i] = {
                "service_commitment_id": None,
                "success": False,
                "message": "Overlapping commitment"
            }

    return results


def check_time_overlap(shifts):
    """
    Check if the shifts have overlapping times.
    
    Args:
        shifts: A list of shift objects 
        with shift_start and shift_end attributes
        
    Returns:
        bool: True if any shifts overlap, False otherwise
    """
    for i in range(len(shifts)):
        for j in range(i + 1, len(shifts)):
            if (shifts[i].shift_start < shifts[j].shift_end and
                shifts[i].shift_end > shifts[j].shift_start):
                return True
    return False

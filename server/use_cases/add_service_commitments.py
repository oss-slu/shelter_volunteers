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
    if not commitments:
        return []
    # Initialize results list
    results = [None] * len(commitments)
    # Validate shifts existence
    shift_ids = [c.service_shift_id for c in commitments]
    existing_shifts = {
        str(s.get_id()): s for s in shifts_repo.get_shifts(shift_ids)
    }
    valid_commitments = []
    valid_indexes = []
    for i, commitment in enumerate(commitments):
        shift_id = commitment.service_shift_id
        if shift_id not in existing_shifts:
            results[i] = {
                "service_commitment_id": None,
                "success": False,
                "message": f"cannot commit to non-existing shift {shift_id}"
            }
        else:
            valid_commitments.append(commitment)
            valid_indexes.append(i)
    if not valid_commitments:
        return results
    # Get user ID from first commitment
    user_id = valid_commitments[0].volunteer_id
    # Fetch user's existing commitments
    try:
        existing_user_commitments = commitments_repo.fetch_service_commitments(
            user_id=user_id)
        if existing_user_commitments is None:
            existing_user_commitments = []
    except (AttributeError, TypeError):
        existing_user_commitments = []
    existing_commitment_shift_ids = [
        str(c.service_shift_id)
        for c in existing_user_commitments
        if c.service_shift_id is not None
    ]
    # Get existing shifts
    existing_user_shifts = []
    if existing_commitment_shift_ids:
        existing_user_shifts = shifts_repo.get_shifts(
            existing_commitment_shift_ids)
    # Get valid shifts for current commitments
    valid_shifts = [
        existing_shifts[c.service_shift_id] for c in valid_commitments]
    # Process commitments while checking for overlaps
    final_valid_commitments = []
    final_valid_indexes = []
    for i, idx in enumerate(valid_indexes):
        current_shift = valid_shifts[i]
        # Use check_time_overlap to check for overlaps with existing shifts
        if check_time_overlap(current_shift, existing_user_shifts):
            results[idx] = {
                "service_commitment_id": None,
                "success": False,
                "message": "Overlapping commitment"
            }
        else:
            final_valid_commitments.append(valid_commitments[i])
            final_valid_indexes.append(idx)
            # Add current shift to existing_user_shifts
            # to check against subsequent commitments
            existing_user_shifts.append(current_shift)
    if not final_valid_commitments:
        return results
    # Insert valid commitments
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
    return results


def check_time_overlap(shift_to_check, other_shifts):
    """
    Check if a shift overlaps with any shifts in a list.
    
    Args:
        shift_to_check: A shift object to check for overlap
        other_shifts: A list of shift objects to check against
        
    Returns:
        bool: True if the shift overlaps with any 
        shifts in the list, False otherwise
    """
    for other_shift in other_shifts:
        if (shift_to_check.shift_start < other_shift.shift_end and
            shift_to_check.shift_end > other_shift.shift_start):
            return True
    return False

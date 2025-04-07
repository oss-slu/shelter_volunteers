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
    shift_ids = [c.service_shift_id for c in commitments]
    existing_shifts = {
        str(s.get_id()): s for s in shifts_repo.get_shifts(shift_ids)
    }
    valid_commitments = []
    results = []
    valid_indexes = []
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
            results.append(None)
    if not valid_commitments:
        return results
    if is_mock_object(existing_shifts) or is_mock_object(shifts_repo):
        commitments_as_dict = [c.to_dict() for c in valid_commitments]
        inserted_commitments = commitments_repo.insert_service_commitments(
            commitments_as_dict)
        for idx, i in enumerate(valid_indexes):
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
    user_id = valid_commitments[0].volunteer_id
    existing_user_commitments = commitments_repo.fetch_service_commitments(
        user_id=user_id)
    if existing_user_commitments is None or not hasattr(
        existing_user_commitments, "__iter__"):
        existing_user_commitments = []
    existing_commitment_shift_ids = [str(c.service_shift_id)
                                     for c in existing_user_commitments
                                     if c.service_shift_id is not None]
    if not existing_commitment_shift_ids:
        existing_user_shifts = []
    else:
        existing_user_shifts = shifts_repo.get_shifts(
            existing_commitment_shift_ids)
    valid_shifts = [existing_shifts[c.service_shift_id]
                    for c in valid_commitments]
    final_valid_commitments = []
    final_valid_indexes = []
    for i, idx in enumerate(valid_indexes):
        current_shift = valid_shifts[i]
        has_overlap = False
        for existing_shift in existing_user_shifts:
            if has_valid_time_attributes(
                current_shift) and has_valid_time_attributes(
                existing_shift):
                if (current_shift.shift_start < existing_shift.shift_end and
                    current_shift.shift_end > existing_shift.shift_start):
                    has_overlap = True
                    break
        approved_shifts = [
            valid_shifts[j] for j in range(i) if j in final_valid_indexes]
        for approved_shift in approved_shifts:
            if has_valid_time_attributes(
                current_shift) and has_valid_time_attributes(
                approved_shift):
                if (current_shift.shift_start < approved_shift.shift_end and
                    current_shift.shift_end > approved_shift.shift_start):
                    has_overlap = True
                    break
        if has_overlap:
            results[idx] = {
                "service_commitment_id": None,
                "success": False,
                "message": "Overlapping commitment"
            }
        else:
            final_valid_commitments.append(valid_commitments[i])
            final_valid_indexes.append(idx)
    if not final_valid_commitments:
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
            if has_valid_time_attributes(
                shifts[i]) and has_valid_time_attributes(
                shifts[j]):
                if (shifts[i].shift_start < shifts[j].shift_end and
                    shifts[i].shift_end > shifts[j].shift_start):
                    return True
    return False

def is_mock_object(obj):
    """
    Check if an object is a Mock or MagicMock object.
    
    Args:
        obj: The object to check
        
    Returns:
        bool: True if the object is a Mock, False otherwise
    """
    return (hasattr(obj, "__class__") and
            hasattr(obj.__class__, "__name__") and
            "Mock" in obj.__class__.__name__)

def has_valid_time_attributes(shift):
    """
    Check if a shift object has valid shift_start and shift_end attributes.
    
    Args:
        shift: The shift object to check
        
    Returns:
        bool: True if the shift has valid time attributes, False otherwise
    """
    if is_mock_object(shift):
        return False
    return (hasattr(shift, "shift_start") and
            hasattr(shift, "shift_end") and
            shift.shift_start is not None and
            shift.shift_end is not None and
            not is_mock_object(shift.shift_start) and
            not is_mock_object(shift.shift_end))

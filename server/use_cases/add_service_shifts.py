"""
This module contains the use case for adding service shifts.
"""

def shift_add_use_case(repo, new_shifts):
    """
    The function adds a service shift into the chosen database
    after checking for overlaps with existing shifts.
    """
    overlapping_shift_response = {
                'service_shift_id': None,
                'success': False,
                'message': 'overlapping shift'
            }
    # Checks overlapping shifts in the input
    if shifts_have_overlap(new_shifts):
        return overlapping_shift_response

    # Checks overlapping shifts in database
    for shift in new_shifts:
        overlap = repo.check_shift_overlap(
            shift.shelter_id,
            shift.shift_start,
            shift.shift_end)
        if overlap:
            return overlapping_shift_response

    # Shift to dict, add to database
    shift_dict = [shift.to_dict() for shift in new_shifts]

    # Adds shift to database
    repo.add_service_shifts(shift_dict)
    results = {}
    results['success'] = True
    results['service_shift_ids'] = [str(shift['_id']) for shift in shift_dict]
    return results


def shifts_have_overlap(shifts):
    """
    Checks if any of the shifts in the list overlap with each other.
    """
    for i, shift in enumerate(shifts):
        if check_time_overlap(shift, shifts[i + 1:]):
            return True
    return False


def check_time_overlap(shift_to_check, other_shifts):
    """
    Check if a shift overlaps with any shifts in a list.
    
    Args:
        shift_to_check: A shift object to check for overlap
        other_shifts: A list of shift objects to check against
        
    Returns:
        bool: True if the shift overlaps with 
        any shifts in the list, False otherwise
    """
    for other_shift in other_shifts:
        if (shift_to_check.shift_start < other_shift.shift_end and
            shift_to_check.shift_end > other_shift.shift_start):
            return True
    return False

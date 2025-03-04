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
    #checks overlapping shifts in the input
    if shifts_have_overlap(new_shifts):
        return overlapping_shift_response

    #checks overlapping shifts in database
    for shift in new_shifts:
        overlap = repo.check_shift_overlap(
            shift.shelter_id,
            shift.shift_start,
            shift.shift_end)
        if overlap:
            return overlapping_shift_response

    #shift to dict, add to database
    shift_dict = [shift.to_dict() for shift in new_shifts]

    #adds shift to database
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
        for other_shift in shifts[i + 1:]:
            if (max(shift.shift_start, other_shift.shift_start) <
                min(shift.shift_end, other_shift.shift_end)) and \
               (shift.shelter_id == other_shift.shelter_id):
                return True
    return False

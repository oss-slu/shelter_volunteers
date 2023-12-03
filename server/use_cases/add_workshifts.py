from datetime import datetime
from domains.work_shift import WorkShift
"""
This module contains the use case for adding work shifts.
"""
def workshift_add_use_case(repo, new_shift, existing_shifts):
    """
    The function adds a work shift into the chosen database
    after checking for overlaps with existing shifts.
    """
    if shift_already_exists(new_shift, existing_shifts):
        return {"success": False, "message": "Duplicate or overlapping shift detected"}

    repo.add(new_shift)
    return {"success": True, "message": "Shift added successfully"}

def workshift_add_multiple_use_case(repo, work_shifts, existing_shifts):
    """
    The function adds multiple work shifts into the chosen database.
    It checks each shift for overlap and only adds non-overlapping shifts.
    """
    responses = []
    for work_shift in work_shifts:
        add_response = workshift_add_use_case(repo, work_shift, existing_shifts)
        responses.append(add_response)
        if add_response["success"]:
            existing_shifts.append(work_shift)

    return responses

def shift_already_exists(new_shift, existing_shifts):
    if isinstance(new_shift, WorkShift):
        new_shift_start = convert_timestamp_to_datetime(new_shift.start_time)
        new_shift_end = convert_timestamp_to_datetime(new_shift.end_time)
    else:
        new_shift_start = convert_timestamp_to_datetime(new_shift["start_time"])
        new_shift_end = convert_timestamp_to_datetime(new_shift["end_time"])

    for shift in existing_shifts:
        existing_start = convert_timestamp_to_datetime(shift.start_time)
        existing_end = convert_timestamp_to_datetime(shift.end_time)

        if max(existing_start, new_shift_start) < min(existing_end, new_shift_end):
            return True

    return False

def convert_timestamp_to_datetime(timestamp_millis):
    return datetime.fromtimestamp(timestamp_millis / 1000)

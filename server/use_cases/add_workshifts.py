"""
This module contains the use case for adding work shifts.
"""
from datetime import datetime
from domains.work_shift import WorkShift

def workshift_add_use_case(repo, new_shift, existing_shifts):
    """
    The function adds a work shift into the chosen database
    after checking for overlaps with existing shifts.
    """
    if shift_already_exists(new_shift, existing_shifts):
        return {"success": False,
                "message": "You are signed up for another shift at this time"}

    repo.add(new_shift)
    return {"success": True, "message": "Shift added successfully"}

def workshift_add_multiple_use_case(repo, work_shifts, existing_shifts):
    """
    The function adds multiple work shifts into the chosen database.
    It checks each shift for overlap and only adds non-overlapping shifts.
    """
    responses = []
    for work_shift in work_shifts:
        shift_id = (work_shift.code if isinstance(work_shift, WorkShift)
            else work_shift["code"])
        add_response = workshift_add_use_case(repo, work_shift, existing_shifts)
        response_item = {"id": shift_id, "success": add_response["success"]}
        if not add_response["success"]:
            response_item["error"] = add_response["message"]
        responses.append(response_item)
        if add_response["success"]:
            existing_shifts.append(work_shift)

    return responses

def shift_already_exists(new_shift, existing_shifts):
    if isinstance(new_shift, WorkShift):
        new_shift_start = convert_timestamp_to_datetime(new_shift.start_time)
        new_shift_end = convert_timestamp_to_datetime(new_shift.end_time)
    elif isinstance(new_shift, dict):
        new_shift_start = convert_timestamp_to_datetime(new_shift["start_time"])
        new_shift_end = convert_timestamp_to_datetime(new_shift["end_time"])
    else:
        raise ValueError("Invalid shift format")

    for shift in existing_shifts:
        if isinstance(shift, WorkShift):
            existing_start = convert_timestamp_to_datetime(shift.start_time)
            existing_end = convert_timestamp_to_datetime(shift.end_time)
        elif isinstance(shift, dict):
            existing_start = convert_timestamp_to_datetime(shift["start_time"])
            existing_end = convert_timestamp_to_datetime(shift["end_time"])
        else:
            continue
        if (max(existing_start, new_shift_start) <
            min(existing_end, new_shift_end)):
            return True
    return False

def convert_timestamp_to_datetime(timestamp_millis):
    return datetime.fromtimestamp(timestamp_millis / 1000)

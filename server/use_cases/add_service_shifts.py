"""
This module contains the use case for adding service shifts with repeatable options.
"""
from server.domains.service_shift import ServiceShift

def shift_add_use_case(repo, new_shift, existing_shifts):
    """
    Adds a service shift into the chosen database after checking for overlaps with existing shifts.
    """
    if shift_already_exists(new_shift, existing_shifts):
        return {"success": False, "message": "You are signed up for another shift at this time"}

    new_shift_dict = new_shift.to_dict()
    repo.add(new_shift_dict)
    shift_id = new_shift_dict["_id"]
    new_shift.set_id(shift_id)
    
    return {"id": shift_id, "success": True, "message": "Shift added successfully"}

def shift_add_multiple_use_case(repo, service_shifts, user_id, repeat_days=None):
    """
    Adds multiple service shifts, supporting shift repetition across days.
    """
    if not service_shifts:
        return []

    existing_shifts = repo.get_shifts_for_volunteer(user_id)
    responses = []

    for service_shift_dict in service_shifts:
        new_shift = ServiceShift.from_dict(service_shift_dict)
        
        # Add base shift
        add_response = shift_add_use_case(repo, new_shift, existing_shifts)
        shift_id = str(new_shift.get_id())
        response_item = {"code": shift_id, "success": add_response["success"]}
        
        if add_response["success"]:
            existing_shifts.append(new_shift)
            
            # Handle shift repetition across specified days
            if repeat_days:
                repeat_shifts = []
                for day_offset in repeat_days:
                    repeated_shift = ServiceShift.from_dict(service_shift_dict)
                    repeated_shift.start_time += day_offset * 86400000  # Convert days to milliseconds
                    repeated_shift.end_time += day_offset * 86400000
                    
                    repeat_response = shift_add_use_case(repo, repeated_shift, existing_shifts)
                    repeat_shift_id = str(repeated_shift.get_id())
                    repeat_shifts.append({"code": repeat_shift_id, "success": repeat_response["success"]})
                    
                    if repeat_response["success"]:
                        existing_shifts.append(repeated_shift)

                response_item["repeat_shifts"] = repeat_shifts

        responses.append(response_item)

    return responses

def shift_already_exists(new_shift, existing_shifts):
    """
    Checks if the new shift overlaps with any of the existing shifts.
    """
    new_shift_start, new_shift_end = new_shift.start_time, new_shift.end_time

    for shift in existing_shifts:
        if max(shift.start_time, new_shift_start) < min(shift.end_time, new_shift_end):
            return True
    return False

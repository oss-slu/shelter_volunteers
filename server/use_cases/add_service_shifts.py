"""
This module contains the use case for adding service shifts.
"""
from server.domains.service_shift import ServiceShift

def shift_add_use_case(repo, new_shift, existing_shifts):
    """
    The function adds a service shift into the chosen database
    after checking for overlaps with existing shifts.
    """
    if shift_already_exists(new_shift, existing_shifts):
        return {"success": False,
                "message": "You are signed up for another shift at this time"}
    new_shift_dict = new_shift.to_dict()
    repo.add(new_shift_dict)
    shift_id = new_shift_dict["_id"]
    new_shift.set_id(shift_id)
    new_shift_dict = new_shift.to_dict()
    return {"id": shift_id, "success": True,
            "message": "Shift added successfully"}


def shift_add_multiple_use_case(repo, service_shifts, user_id):
    """
    Adds multiple service shifts into the database after checking for overlap.
    """
    if not service_shifts:
        return []
    # Add the Volunteer object in the repo and
    # create get_shifts_for_volunteer function
    # to get the value of the sign_up_shifts
    existing_shifts = repo.get_shifts_for_volunteer(user_id)
    responses = []

    for service_shift_dict in service_shifts:
        new_shift = ServiceShift.from_dict(service_shift_dict)
        add_response = shift_add_use_case(repo, new_shift, existing_shifts)
        shift_id = str(new_shift.get_id())
        response_item = {"code": shift_id, "success": add_response["success"]}
        if not add_response["success"]:
            response_item["error"] = add_response["message"]
        responses.append(response_item)
        if add_response["success"]:
            existing_shifts.append(new_shift)

    return responses

def shift_already_exists(new_shift, existing_shifts):
    """
    Checks if the new_shift overlaps with any of the existing_shifts.
    Assumes that new_shift and existing_shifts are ServiceShift objects.
    """
    new_shift_start = new_shift.start_time
    new_shift_end = new_shift.end_time

    for shift in existing_shifts:
        existing_start = shift.start_time
        existing_end = shift.end_time
        if (max(existing_start, new_shift_start) <
                min(existing_end, new_shift_end)):
            return True
    return False

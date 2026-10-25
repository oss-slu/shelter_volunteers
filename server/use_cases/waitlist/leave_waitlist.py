"""
Use case: a volunteer leaves the waitlist for a shift.
"""
from responses import ResponseTypes


def leave_waitlist(waitlist_repo, volunteer_id: str, service_shift_id: str):
    """
    Remove the volunteer's waitlist entry for the given shift.

    Returns a dict with keys:
      - response_code: a ResponseTypes value
      - message: human-readable message
    """
    response = {"response_code": ResponseTypes.SUCCESS, "message": ""}
    existing = waitlist_repo.find_for_user_and_shift(volunteer_id, service_shift_id)
    if not existing:
        response["response_code"] = ResponseTypes.NOT_FOUND
        response["message"] = "You are not on the waitlist for this shift"
        return response

    removed = waitlist_repo.remove_for_user_and_shift(volunteer_id, service_shift_id)
    if removed <= 0:
        response["response_code"] = ResponseTypes.SYSTEM_ERROR
        response["message"] = "Failed to remove waitlist entry"
        return response

    response["message"] = "Removed from waitlist"
    return response

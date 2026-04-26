"""
Use case: a volunteer joins the waitlist for a full service shift.
"""
import time

from domains.waitlist_entry import WaitlistEntry
from responses import ResponseTypes
from use_cases.add_service_commitments import check_time_overlap


def join_waitlist(
    waitlist_repo,
    commitments_repo,
    shifts_repo,
    volunteer_id: str,
    service_shift_id: str,
):
    """
    Add a volunteer to the waitlist for a shift.

    Returns a dict with keys:
      - response_code: a ResponseTypes value
      - message: human-readable message
      - waitlist_entry_id: the new entry's id (on success)
    """
    response = {"response_code": ResponseTypes.SUCCESS, "message": "", "waitlist_entry_id": None}

    shift = shifts_repo.get_shift(service_shift_id)
    if not shift:
        response["response_code"] = ResponseTypes.NOT_FOUND
        response["message"] = "Shift not found"
        return response

    if not shift.can_sign_up:
        response["response_code"] = ResponseTypes.PARAMETER_ERROR
        response["message"] = "This shift is not open for sign-ups"
        return response

    existing_commitments = commitments_repo.fetch_service_commitments(
        shift_id=service_shift_id
    ) or []

    if any(c.volunteer_id == volunteer_id for c in existing_commitments):
        response["response_code"] = ResponseTypes.CONFLICT
        response["message"] = "You are already signed up for this shift"
        return response

    if len(existing_commitments) < shift.max_volunteer_count:
        response["response_code"] = ResponseTypes.PARAMETER_ERROR
        response["message"] = "This shift still has openings; sign up directly"
        return response

    if waitlist_repo.find_for_user_and_shift(volunteer_id, service_shift_id):
        response["response_code"] = ResponseTypes.CONFLICT
        response["message"] = "You are already on the waitlist for this shift"
        return response

    user_commitments = commitments_repo.fetch_service_commitments(
        user_id=volunteer_id
    ) or []
    user_shift_ids = [
        str(c.service_shift_id) for c in user_commitments if c.service_shift_id
    ]
    user_shifts = shifts_repo.get_shifts(user_shift_ids) if user_shift_ids else []
    if check_time_overlap(shift, user_shifts):
        response["response_code"] = ResponseTypes.CONFLICT
        response["message"] = (
            "This shift overlaps with another shift you're already signed up for"
        )
        return response

    entry = WaitlistEntry(
        volunteer_id=volunteer_id,
        service_shift_id=service_shift_id,
        joined_at=int(time.time() * 1000),
    )
    new_id = waitlist_repo.add_entry(entry)
    response["waitlist_entry_id"] = new_id
    response["message"] = "Added to waitlist"
    return response

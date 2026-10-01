"""
Use case for deleting a service commitment.

When a commitment is deleted, capacity opens up on the associated shift.
If a waitlist repository (and shifts repository) is supplied, the next
eligible volunteer on the waitlist is promoted into a commitment.
"""
from responses import ResponseTypes
from use_cases.waitlist.promote_from_waitlist import promote_from_waitlist


def delete_service_commitment(
    commitments_repo,
    commitment_id,
    user_email,
    waitlist_repo=None,
    shifts_repo=None,
):
    """Delete a service commitment by its ID."""
    commitment = commitments_repo.get_service_commitment_by_id(commitment_id)
    response = {
        "commitment_id": commitment_id,
        "promoted": [],
    }
    response_code = ResponseTypes.SUCCESS
    if not commitment:
        response_code = ResponseTypes.NOT_FOUND
        message = "Commitment not found"
    elif commitment.volunteer_id != user_email:
        response_code = ResponseTypes.UNAUTHORIZED
        message = "User not authorized to delete this commitment"
    else:
        result = commitments_repo.delete_service_commitment(commitment_id)
        if result:
            message = "Commitment deleted successfully"
            if waitlist_repo is not None and shifts_repo is not None:
                response["promoted"] = promote_from_waitlist(
                    waitlist_repo,
                    commitments_repo,
                    shifts_repo,
                    commitment.service_shift_id,
                )
        else:
            response_code = ResponseTypes.SYSTEM_ERROR
            message = "Failed to delete commitment"
    response["response_code"] = response_code
    response["message"] = message
    return response

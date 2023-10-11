"""
Module containing the use case for deleting work shifts.
"""

from errors.responses import (
    ResponseSuccess,
    ResponseFailure,
    ResponseTypes,
    build_response_from_invalid_request
)

def delete_shift_use_case(repo, request):
    """
    Delete a specific shift based on ID and user email.
    """
    if not request:
        return build_response_from_invalid_request(request)

    try:
        shift_id = request.shift_id
        user_email = request.user_email
        shift = repo.get_by_id(shift_id)

        if shift is None:
            return ResponseFailure(ResponseTypes.NOT_FOUND, "Shift not found")

        if shift.worker != user_email:
            error_msg = "Permission denied"
            return ResponseFailure(ResponseTypes.AUTHORIZATION_ERROR, error_msg)

        repo.delete(shift_id)

        return ResponseSuccess({"message": "Shift deleted successfully"})

    except AttributeError:
        return ResponseFailure(ResponseTypes.PARAMETER_ERROR,
                            "Invalid request parameters.")
    except ValueError: # Catch unexpected exceptions.
        return ResponseFailure(ResponseTypes.SYSTEM_ERROR,
                               "An unexpected error occurred.")

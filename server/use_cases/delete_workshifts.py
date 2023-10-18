"""
Module containing the use case for deleting work shifts.
"""

from responses import (
    ResponseSuccess,
    ResponseFailure,
    ResponseTypes
)

def delete_shift_use_case(repo, shift_id, user_email):
    """
    Delete a specific shift based on ID and user email.
    """
    try:
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

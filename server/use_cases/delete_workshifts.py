"""
Module containing the use case for deleting work shifts.
"""

from errors.responses import ResponseSuccess, ResponseFailure, ResponseTypes

def delete_shift_use_case(repo, shift_id, user_email):
    """
    Delete a specific shift based on the provided shift ID and user email.
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

    except ValueError as e:
        # Assuming a ValueError might be raised, adjust as needed
        return ResponseFailure(ResponseTypes.SYSTEM_ERROR, str(e))

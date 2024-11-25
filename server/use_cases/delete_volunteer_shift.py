"""
Module containing the use case for deleting volunteer shifts.
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
        volunteer = repo.get_by_id(user_email)

        if volunteer is None:
            return ResponseFailure(ResponseTypes.NOT_FOUND, 
                              "Volunteer not found")

        if shift_id not in volunteer.signed_up_shifts:
            return ResponseFailure(ResponseTypes.NOT_FOUND,
                              "Shift not found under volunteer")

        repo.delete_volunteer_shift(user_id=user_email, shift_id=shift_id)
        return ResponseSuccess({"message": "Shift deleted successfully"})

    except AttributeError:
        return ResponseFailure(ResponseTypes.PARAMETER_ERROR,
                            "Invalid request parameters.")
    except ValueError: # Catch unexpected exceptions.
        return ResponseFailure(ResponseTypes.SYSTEM_ERROR,
                               "An unexpected error occurred.")

from errors.responses import ResponseSuccess, ResponseFailure, ResponseTypes

def delete_shift_use_case(repo, shift_id, user_email):
    try:
        shift = repo.get_by_id(shift_id)

        if shift is None:
            return ResponseFailure(ResponseTypes.NOT_FOUND, "Shift not found")

        if shift.worker != user_email:
            return ResponseFailure(ResponseTypes.AUTHORIZATION_ERROR, "Permission denied")

        repo.delete(shift_id)

        return ResponseSuccess({"message": "Shift deleted successfully"})

    except Exception as e:
        return ResponseFailure(ResponseTypes.SYSTEM_ERROR, str(e))

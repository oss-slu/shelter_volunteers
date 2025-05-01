from responses import ResponseTypes
def delete_service_commitment(commitments_repo, commitment_id, user_email):
    """
    Delete a service commitment by its ID.
    """
    try:
        # Check if the commitment exists
        commitment = commitments_repo.get_service_commitment_by_id(commitment_id)
        response = {}
        response["commitment_id"] = commitment_id
        response_code = ResponseTypes.SUCCESS
        if not commitment:
            response_code = ResponseTypes.NOT_FOUND
            message = "Commitment not found"

        # Check if the user is authorized to delete the commitment
        elif commitment.volunteer_id != user_email:
            response_code = ResponseTypes.UNAUTHORIZED
            message = "User not authorized to delete this commitment"
        else:
            # Delete the commitment
            commitments_repo.delete_service_commitment(commitment_id)
            message = "Commitment deleted successfully"
        response["response_code"] = response_code
        response["message"] = message
        return response

    except Exception as e:
        return {
            "response_code": ResponseTypes.SYSTEM_ERROR,
            "message": str(e)
        }
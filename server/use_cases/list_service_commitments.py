"""
This module contains the use case for listing service commitments.
"""
def list_service_commitments(commitments_repo, shifts_repo, user_email=None, shift_id=None):
    """
    Retrieves service commitments based on provided filters.

    Args:
        commitments_repo: A repository object that contains all service commitments
        shifts_repo: A repository object that contains all service shifts
        user_email (str, optional): The user's email.
        shift_id (str, optional): The ID of the service shift to filter by.

    Returns:
        tuple: A tuple containing (list of service commitment objects, list of associated service shift objects)
    """
    commitments = commitments_repo.fetch_service_commitments(user_email, shift_id)
    shift_ids = [commitment.service_shift_id for commitment in commitments]
    shifts = shifts_repo.get_shifts(shift_ids)
    return (commitments, shifts)
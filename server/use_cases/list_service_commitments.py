"""
This module contains the use case for listing service commitments.
"""

def list_service_commitments(commitments_repo, shifts_repo, user_email=None):
    """
    Retrieves all service commitments for a given user.

    Args:
        commitments_repo: A repository object that contains 
                          all service commitments
        shifts_repo: A repository object that contains all service shifts
        user_email (str): The user's email.

    Returns:
        list: A list of service commitment dictionaries 
        with IDs and associated service shift IDs.
    """

    commitments = commitments_repo.fetch_service_commitments(user_email)
    shift_ids = [commitment.service_shift_id for commitment in commitments]
    shifts = shifts_repo.get_shifts(shift_ids)
    return (commitments, shifts)

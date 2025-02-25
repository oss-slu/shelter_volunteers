"""
This module contains the use case for listing service commitments.
"""

def list_service_commitments(repo, user_email):
    """
    Retrieves all service commitments for a given user.

    Args:
        repo: A repository object that provides a 
        fetch_service_commitments method.
        user_email (str): The user's email.

    Returns:
        list: A list of service commitment dictionaries 
        with IDs and associated service shift IDs.
    """
    commitments = repo.fetch_service_commitments(user_email)
    return commitments

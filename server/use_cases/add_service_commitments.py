"""
Module for handling service commitments.
Provides functions to create and retrieve service commitments for users.
"""

def add_service_commitments(repo, commitments):
    """
    Creates service commitments for the given user and shifts.

    Args:
        repo: A repository object that provides 
        an insert_service_commitments method.
        user_email (str): The user's email.
        shifts (list): A list of shift dictionaries.

    Returns:
        list: A list of dictionaries indicating
        the success and service commitment IDs.
    """
    commitments_as_dict = [c.to_dict() for c in commitments]
    repo.insert_service_commitments(commitments_as_dict)
    return [{
        "service_commitment_id": str(c["_id"])
        , "success": True}
            for c in commitments_as_dict]

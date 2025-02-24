"""
Module for handling service commitments.
Provides functions to create and retrieve service commitments for users.
"""

import uuid

def add_service_commitments(repo, user_email, shifts):
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
    commitments = []
    for shift in shifts:
        if "service_shift_id" not in shift:
            continue

        commitment = {
            "service_commitment_id": str(uuid.uuid4()),
            "service_shift_id": shift["service_shift_id"],
            "user_email": user_email
        }
        commitments.append(commitment)
    repo.insert_service_commitments(commitments)
    return [{
        "service_commitment_id": c["_id"]
        , "success": True}
            for c in commitments]

def get_service_commitments(repo, user_email):
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
    return [{"service_commitment_id": c["service_commitment_id"],
             "service_shift_id": c["service_shift_id"]}
            for c in commitments]

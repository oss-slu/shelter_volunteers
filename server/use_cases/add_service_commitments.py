"""
Module for handling service commitments.
Provides functions to create and retrieve service commitments for users.
"""
#from repository.mongodb.service_commitments import insert_service_commitments, fetch_service_commitments
import uuid
from service_commitments import insert_service_commitments, fetch_service_commitments

def add_service_commitments(user_email, shifts):
    """
    Creates service commitments for the given user and shifts.
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

    insert_service_commitments(commitments)
    return [{"service_commitment_id": c["service_commitment_id"],
             "success": True} for c in commitments]

def get_service_commitments(user_email):
    """
    Retrieves all service commitments for a given user.
    """
    commitments = fetch_service_commitments(user_email)
    return [{"service_commitment_id": c["service_commitment_id"],
             "service_shift_id": c["service_shift_id"]} for c in commitments]

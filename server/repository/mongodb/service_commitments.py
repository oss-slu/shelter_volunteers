"""
Module for handling MongoDB operations related to service commitments.
Provides functions to insert and fetch service commitments from the database.
"""

from config.mongodb_config import get_db

def insert_service_commitments(commitments):
    """
    Inserts multiple service commitments into the database.
    """
    db = get_db()
    result = db.service_commitments.insert_many(commitments)
    return result.inserted_ids

def fetch_service_commitments(user_email):
    """
    Fetches all service commitments for a specific user.
    """
    db = get_db()
    commitments = list(db.service_commitments.find({"user_email": user_email},
                                                   {"_id": 0}))
    return commitments

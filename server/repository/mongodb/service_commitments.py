"""
Module for handling MongoDB operations related to service commitments.
Provides methods to insert and fetch service commitments from the database.
"""

from config.mongodb_config import get_db

class MongoRepoCommitments:
    """
    A MongoDB repository for managing service commitments.
    """
    def __init__(self):
        """
        Initialize the repository by setting up the database and collection.
        """
        self.db = get_db()
        self.collection = self.db.service_commitments

    def insert_service_commitments(self, commitments):
        """
        Inserts multiple service commitments into the database.
        Removes any existing _id fields to let MongoDB generate unique IDs.

        Args:
            commitments (list): A list of dictionaries 
            representing the service commitments.

        Returns:
            list: A list of inserted IDs for the commitments.
        """
        # Create a new list with _id removed from each commitment
        cleaned_commitments = []
        for commitment in commitments:
            commitment_copy = commitment.copy()
            commitment_copy.pop("_id", None)  # Remove _id if it exists
            cleaned_commitments.append(commitment_copy)

        result = self.collection.insert_many(cleaned_commitments)
        return result.inserted_ids

    def fetch_service_commitments(self, user_email):
        """
        Fetches all service commitments for a specific user.

        Args:
            user_email (str): The email of 
            the user for whom to fetch commitments.

        Returns:
            list: A list of service commitment 
            documents (excluding the _id field).
        """
        commitments = list(self.collection.find(
            {"user_email": user_email}, {"_id": 0}))
        return commitments
    
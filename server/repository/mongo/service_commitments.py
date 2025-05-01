"""
Module for handling MongoDB operations related to service commitments.
Provides methods to insert and fetch service commitments from the database.
"""

from bson.objectid import ObjectId
from config.mongodb_config import get_db
from domains.service_commitment import ServiceCommitment

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
        # remove the _id field to let MongoDB generate unique IDs
        for commitment in commitments:
            commitment.pop('_id', None)
        result = self.collection.insert_many(commitments)
        return [str(inserted_id) for inserted_id in result.inserted_ids]

    def fetch_service_commitments(self, user_id=None, shift_id =None):
        """
        Fetches service commitments based on provided filters.

        Args:
            user_id (str, optional): The email of the user for whom to 
            fetch commitments.
            shift_id (str, optional): The ID of the service shift to filter by.

        Returns:
            list: A list of service commitment objects.
        """
        db_filter = {}
        if user_id:
            db_filter['volunteer_id'] = user_id
        if shift_id:
            db_filter['service_shift_id'] = shift_id

        commitments = [
            ServiceCommitment.from_dict(i) for i in self.collection.find(
                filter=db_filter)
        ]
        return commitments
    
    def get_service_commitment_by_id(self, commitment_id):
        """
        Fetches a service commitment by its ID.

        Args:
            commitment_id (str): The ID of the service commitment.

        Returns:
            ServiceCommitment: The service commitment object.
        """
        commitment_object_id = ObjectId(commitment_id)
        commitment = self.collection.find_one({"_id": commitment_object_id})
        if commitment:
            return ServiceCommitment.from_dict(commitment)
        return None
    
    def delete_service_commitment(self, commitment_id):
        """
        Deletes a service commitment by its ID.

        Args:
            commitment_id (str): The ID of the service commitment to delete.
        """
        commitment_object_id = ObjectId(commitment_id)
        result = self.collection.delete_one({"_id": commitment_object_id})
        return result.deleted_count > 0

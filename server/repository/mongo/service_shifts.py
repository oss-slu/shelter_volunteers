"""
This module handles MongoDB interactions with the service_shifts collection.
"""

from domains.service_shift import ServiceShift
from config.mongodb_config import get_db
#from bson.errors import InvalidId
from bson.objectid import ObjectId
from bson.errors import InvalidId
from pymongo import ReturnDocument

class ServiceShiftsMongoRepo:
    """
    MongoDB repository class for managing service shifts.
    """

    def __init__(self, collection_name="service_shifts"):
        """
        Initialize the repository with a MongoDB connection.
        """
        self.db = get_db()
        self.collection = self.db[collection_name]

    def add_service_shifts(self, shift_data):
        """
        Adds new service shifts to the database.
        
        Args:
            shift_data (list): A list of service shift dictionaries.
        
        Returns:
            list: A list of inserted shift IDs.
        """
        for shift in shift_data:
            shift.pop("_id", None)  # Remove _id to let MongoDB generate it
        result = self.collection.insert_many(shift_data)
        return [str(shift_id) for shift_id in result.inserted_ids]

    def check_shift_overlap(
        self, shelter_id, shift_start, shift_end, exclude_shift_id=None
    ):
        """
        Checks if a new shift overlaps with an existing shift.
        
        Args:
            shelter_id (int): The shelter ID.
            shift_start (int): The start time of the new shift.
            shift_end (int): The end time of the new shift.
        
        Returns:
            bool: True if there is an overlap, False otherwise.
        """
        overlap_filter = {
            "shelter_id": shelter_id,
            "shift_start": {"$lt": shift_end},
            "shift_end": {"$gt": shift_start},
        }
        if exclude_shift_id:
            overlap_filter["_id"] = {"$ne": ObjectId(exclude_shift_id)}

        overlapping = self.collection.find_one(overlap_filter)
        return overlapping is not None

    def get_shift(self, shift_id):
        """
        Gets one shift by id.
        """
        try:
            shift = self.collection.find_one({"_id": ObjectId(shift_id)})
        except (InvalidId, TypeError):
            return None

        if not shift:
            return None

        shift["_id"] = str(shift["_id"])
        return ServiceShift.from_dict(shift)

    def update_service_shift(self, shift_id, updates):
        """
        Updates an existing shift.
        """
        try:
            updated_shift = self.collection.find_one_and_update(
                {"_id": ObjectId(shift_id)},
                {"$set": updates},
                return_document=ReturnDocument.AFTER,
            )
        except (InvalidId, TypeError):
            return None

        if not updated_shift:
            return None

        updated_shift["_id"] = str(updated_shift["_id"])
        return ServiceShift.from_dict(updated_shift)

    def list(self, shelter_id=None, filter_start_after=None):
        """
        Retrieves service shifts, optionally filtered by shelter_id and time.
        
        Args:
            shelter_id (int, optional): The ID of the shelter.
            filter_start_after (int, optional): The minimum start time.
        
        Returns:
            list: A list of service shift objects.
        """
        db_filter = {}
        if shelter_id:
            db_filter["shelter_id"] = shelter_id
        if filter_start_after:
            db_filter["shift_start"] = {"$gt": filter_start_after}

        service_shifts = [
            ServiceShift.from_dict(shift)
            for shift in self.collection.find(db_filter)
        ]
        for shift in service_shifts:
            shift.set_id(str(shift.get_id()))
        return service_shifts

    def get_shifts(self, shift_ids):
        """
        Gets multiple shifts by a list of IDs.
        
        Args:
            shift_ids (list): A list of shift IDs.
        
        Returns:
            list: A list of ServiceShift objects.
        """
        try:
            object_ids = [ObjectId(sid) for sid in shift_ids]
            shifts = list(self.collection.find({"_id": {"$in": object_ids}}))
            for shift in shifts:
                shift["_id"] = str(shift["_id"])
            return [ServiceShift.from_dict(shift) for shift in shifts]
        except Exception as e:
            raise ValueError(f"Invalid shift ID: {e}") from e

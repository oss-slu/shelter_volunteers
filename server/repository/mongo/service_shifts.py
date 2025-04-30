"""
This module handles MongoDB interactions with the service_shifts collection.
"""

from domains.service_shift import ServiceShift
from config.mongodb_config import get_db
#from bson.errors import InvalidId
from bson.objectid import ObjectId

class ServiceShiftsMongoRepo:
    """
    MongoDB repository class for managing service shifts.
    """

    def __init__(self):
        """
        Initialize the repository with a MongoDB connection.
        """
        self.db = get_db()
        self.collection = self.db.service_shifts

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

    def check_shift_overlap(self, shelter_id, shift_start, shift_end):
        """
        Checks if a new shift overlaps with an existing shift.
        
        Args:
            shelter_id (int): The shelter ID.
            shift_start (int): The start time of the new shift.
            shift_end (int): The end time of the new shift.
        
        Returns:
            bool: True if there is an overlap, False otherwise.
        """
        overlapping = self.collection.find_one(
            {
                "shelter_id": shelter_id,
                "shift_start": {"$lt": shift_end},
                "shift_end": {"$gt": shift_start},
            }
        )
        return overlapping is not None

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

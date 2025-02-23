"""
This module handles Mongo database interactions with new service_shift
"""
from bson import ObjectId
from datetime import datetime

class ServiceShiftsMongoRepo:
    """
    repo class for service shifts MongoDB operations
    """
    def __init__(self, database):
        """
        database connection
        """
        self.db = database
        self.collection = database.service_shifts

    def add_service_shift(self, shift_data):
        """
        adds new service shift to the database
        returns the new unique ID assigned to the shift
        """
        result = self.collection.insert_one(shift_data)
        return str(result.inserted_id)

    def get_shifts_for_shelter(self, shelter_id):
        """
        gets all shifts for a specific shelter
        returns list of shift documents
        """
        return list(self.collection.find({"shelter_id": shelter_id}))

    def check_shift_overlap(self, shelter_id, shift_start, shift_end):
        """
        checks if new shift overlaps with existing shifts for shelter
        true if there is overlap and false otherwise
        """
        overlapping = self.collection.find_one({
            "shelter_id": shelter_id,
            "shift_start": {"$lt": shift_end},
            "shift_end": {"$gt": shift_start}
        })
        return overlapping is not None

    def get_shift_by_id(self, shift_id):
        """
        get a specific shift by its ID
        gives the shift data or None if not found
        """
        try:
            return self.collection.find_one({"_id": ObjectId(shift_id)})
        except:
            return None

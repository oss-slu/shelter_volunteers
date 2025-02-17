"""
Module handles MongoDB operations.
"""
import pymongo
from domains.service_shift import ServiceShift
from bson.objectid import ObjectId

class MongoRepo:
    """
    A mongo repository for storing work shifts.
    """
    def __init__(self, uri, database):
        """
        Initialize the repo with passed data.
        """
        client = pymongo.MongoClient(uri)
        self.db = client[database]
        self.collection = self.db.service_shifts

    def add(self, service_shift):
        """Add a ServiceShift object to MongoDB."""
        service_shift.pop("_id", None)
        self.collection.insert_one(service_shift)

    def get_shifts_for_volunteer(self, user_id):
        """Retrieve all shifts for a volunteer."""
        return [ServiceShift.from_dict(shift) for shift in self.collection.find({"worker": user_id})]

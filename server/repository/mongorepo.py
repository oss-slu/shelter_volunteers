"""
Module handles the MongoDB operations
"""
import pymongo
from domains.work_shift import WorkShift
from bson.objectid import ObjectId

class MongoRepo:
    """
    A MongoDB repository for storing work shifts.
    """
    def __init__(self, uri, database):
        """
        Initialize the repository with MongoDB connection.
        """
        client = pymongo.MongoClient(uri)
        self.db = client[database]
        self.collection = self.db.shifts

    def _create_shift_objects(self, results):
        return [
            WorkShift(
                _id=q["_id"],
                worker=q["worker"],
                first_name=q["first_name"],
                last_name=q["last_name"],
                shelter=q["shelter"],
                start_time=q["start_time"],
                end_time=q["end_time"],
                repeat_days=q.get("repeat_days", [])  # Include repeat_days if available
            )
            for q in results
        ]

    def list(self, user=None, shelter=None):
        """
        Return a list of WorkShift objects based on the data.
        """
        db_filter = {}
        if user:
            db_filter["worker"] = user
        if shelter:
            db_filter["shelter"] = shelter

        user_shifts = [WorkShift.from_dict(i) for i in self.collection.find(filter=db_filter)]
        return user_shifts

    def add(self, work_shift):
        """
        Add a WorkShift object to the database.
        """
        work_shift.pop("_id", None)  # Ensure MongoDB generates an _id
        self.collection.insert_one(work_shift)

    def get_by_id(self, shift_id):
        """
        Retrieve a shift by ID.
        """
        id_filter = {"_id": ObjectId(shift_id)}
        item = self.collection.find_one(filter=id_filter)
        return WorkShift.from_dict(item) if item else None

    def delete(self, shift_id):
        """
        Delete a shift from the database.
        """
        self.collection.delete_one({"_id": ObjectId(shift_id)})

    def get_shifts_for_user(self, user_id):
        """
        Retrieve all work shifts for a specific user from the database.
        """
        user_shifts = self.collection.find({"worker": user_id})
        return [WorkShift.from_dict(shift) for shift in user_shifts]

"""
Module handles the mongo DB operations
"""
import pymongo
from domains.service_shift import WorkShift
from bson.objectid import ObjectId

class MongoRepo:
    """
    A mongo repository for storing work shifts.
    """
    def __init__(self, configuration):
        """
        Initialize the repo with passed data.
        """
        client = pymongo.MongoClient(
            host=configuration["MONGODB_HOSTNAME"],
            port=int(configuration["MONGODB_PORT"]),
        )
        self.db = client[configuration["APPLICATION_DB"]]
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

        user_shifts = [WorkShift.from_dict(i) for i in self.collection.find \
                       (filter=db_filter)]
        return user_shifts

    def add(self, work_shift):
        """
        Add a WorkShift object to the data.
        A unique id gets generated in mongoDB and is added to workShift object
        """
        # Remove the _id field from the dictionary, so that when we call
        # insert_one mongoDB will add an _id field to the work_shift
        # dictionary object with a unique value before inserting it into
        # the collection. This ensures that each work shift
        # stored in our database has a unique _id
        work_shift.pop("_id")
        self.collection.insert_one(work_shift)

    def get_by_id(self, shift_id):
        """
        The get_by_id function takes in a shift_id and
        returns the corresponding WorkShift object.
        """
        id_filter = {"_id":ObjectId(shift_id)}
        item = self.collection.find_one(filter=id_filter)
        if item:
            return WorkShift.from_dict(item)
        else:
            return None

    def delete(self, shift_id):
        """
        The delete function deletes a shift from the database.
        """
        self.collection.delete_one({"_id": ObjectId(shift_id)})
        return

    # This is the logic connecting the the DB for deleting a shift
    def delete_volunteer_shift(self, shift_id, user_id):
        """
        Removes the shift instance in 
        volunteer's shifts from the database.
        """
        self.collection.update_one({"id": user_id},
                                   {"$pull": {"signed_up_shifts": shift_id}})
        return

    def get_shifts_for_user(self, user_id):
        """
        Retrieves all work shifts for a specific user from the database.
        """
        user_shifts = self.collection.find({"worker": user_id})
        return [WorkShift.from_dict(shift) for shift in user_shifts]

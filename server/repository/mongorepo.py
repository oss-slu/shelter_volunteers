"""
Module handles the mongo DB operations
"""
import pymongo
from domains.work_shift import WorkShift

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
                code=q["code"],
                worker=q["worker"],
                shelter=q["shelter"],
                start_time=q["start_time"],
                end_time=q["end_time"],
            )
            for q in results
        ]

    def list(self, user, filters=None):
        """
        Return a list of WorkShift objects based on the data.
        """
        user_filter = {"worker":user}
        projection = {"_id": 0}
        user_shifts = [WorkShift.from_dict(i) for i in self.collection.find \
                       (filter=user_filter, projection=projection)]
        if filters is None:
            return user_shifts

        if "start_before" in filters:
            user_shifts = [
                shift for shift in user_shifts if \
                shift.start_time < filters["start_before"]
            ]
        if "start_after" in filters:
            user_shifts = [
                shift for shift in user_shifts if \
                shift.start_time >=filters["start_after"]
            ]
        if "end_before" in filters:
            user_shifts = [
                shift for shift in user_shifts if \
                shift.end_time < filters["end_before"]
            ]
        if "end_after" in filters:
            user_shifts = [
                shift for shift in user_shifts if \
                shift.end_time >= filters["end_after"]
            ]
        return user_shifts

    def add(self, work_shift):
        """
        Add a WorkShift object to the data.
        """
        self.collection.insert_one(work_shift)
        work_shift.pop("_id")

    def get_by_id(self, shift_id):
        """
        The get_by_id function takes in a shift_id and 
        returns the corresponding WorkShift object.
        """
        id_filter = {"code":shift_id}
        projection = {"_id": 0}
        item = self.collection.find_one(filter=id_filter, projection=projection)
        if item:
            return WorkShift.from_dict(item)
        else:
            return None

    def delete(self, shift_id):
        """
        The delete function deletes a shift from the database.
        """
        self.collection.delete_one({"code": shift_id})
        return

"""
This module handles Mongo database interactions with new service_shift
"""
from domains.service_shift import ServiceShift
from config.mongodb_config import get_db

class ServiceShiftsMongoRepo:
    """
    repo class for service shifts MongoDB operations
    """
    def __init__(self):
        """
        database connection
        """
        self.db = get_db()
        self.collection = self.db.service_shifts

    def add_service_shifts(self, shift_data):
        """
        adds new service shift to the database
        returns the new unique ID assigned to the shift
        """
        for shift in shift_data:
            shift.pop('_id', None)
        self.db.service_shifts.insert_many(shift_data)


    def check_shift_overlap(self, shelter_id, shift_start, shift_end):
        """
        checks if new shift overlaps with existing shifts for shelter
        true if there is overlap and false otherwise
        """
        overlapping = self.collection.find_one({
            'shelter_id': shelter_id,
            'shift_start': {'$lt': shift_end},
            'shift_end': {'$gt': shift_start}
        })
        return overlapping is not None

    def list(self, shelter=None):
        """
        Gets all service shifts in the database
        returns list of all shift documents
        """
        db_filter = {}
        if shelter:
            db_filter['shelter_id'] = shelter
        service_shifts = [
            ServiceShift.from_dict(i) for i in self.collection.find \
            (filter=db_filter)
        ]
        return service_shifts

    def get_shifts(self, shift_ids):
        """
        gets multiple shifts by a list of ids
        """
        shifts = self.collection.find({'_id': {'$in': shift_ids}})
        return [ServiceShift.from_dict(shift) for shift in shifts]

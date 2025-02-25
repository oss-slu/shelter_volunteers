"""
This module handles Mongo database interactions with new service_shift
"""
import pymongo
from bson import ObjectId
import certifi
from domains.service_shift import ServiceShift

class ServiceShiftsMongoRepo:
    """
    repo class for service shifts MongoDB operations
    """
    def __init__(self, uri, database_name):
        """
        database connection
        """
        client = pymongo.MongoClient(uri, tlsCAFile=certifi.where())
        self.db = client[database_name]
        self.collection = self.db.service_shifts

    def add_service_shift(self, shift_data):
        """
        adds new service shift to the database
        returns the new unique ID assigned to the shift
        """
        result = self.db.service_shifts.insert_one(shift_data)
        return str(result.inserted_id)

    def get_shifts_for_shelter(self, shelter_id):
        """
        gets all shifts for a specific shelter
        returns list of shift documents
        """
        return list(self.collection.find({'shelter_id': shelter_id}))

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

    def get_shift_by_id(self, shift_id):
        """
        get a specific shift by its ID
        gives the shift data or None if not found
        """
        id_filter = {"shelter_id": shift_id} 
        return [ServiceShift.from_dict(i) 
                for i in self.collection.find(id_filter)]
        
    def list(self, shelter=None):
        """
        Gets all service shifts in the database
        returns list of all shift documents
        """
        db_filter = {}
        if shelter:
            db_filter["shelter_id"] = shelter
        service_shifts = [ServiceShift.from_dict(i) for i in self.collection.find \
                          (filter=db_filter)]
        return service_shifts

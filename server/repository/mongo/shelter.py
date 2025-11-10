"""
Module handles the mongo DB operations for shelter related data
"""
from config.mongodb_config import get_db
from domains.shelter.shelter import Shelter
from bson.objectid import ObjectId


class ShelterRepo:
    """
    A mongo repository for storing work shifts.
    """

    def __init__(self):
        """
        Initialize the repo with passed data.
        """
        self.db = get_db()
        self.collection = self.db.schedule

    def _create_shelter_objects(self, results):
        return [
            Shelter(
                _id=q["_id"],
                name=q["name"],
                address=q["address"]
            )
            for q in results
        ]

    def add(self, shelter):
        """
        Add a shelter dictionary object to the data.
        A unique id gets generated in mongoDB and is added to workShift object
        """
        # Remove the _id field from the dictionary, so that when we call
        # insert_one mongoDB will add an _id field to the work_shift
        # dictionary object with a unique value before inserting it into
        # the collection. This ensures that each work shift
        # stored in our database has a unique _id
        shelter.pop("_id")
        self.collection.insert_one(shelter)

    def get_by_id(self, shelter_id):
        """
        The get_by_id function takes in a shelter_id and
        returns the corresponding Shelter object.
        """
        id_filter = {"_id": ObjectId(shelter_id)}
        item = self.collection.find_one(filter=id_filter)
        if item:
            return Shelter.from_dict(item)
        else:
            return None

    def list(self):
        """
        Return a list of Shelter objects in the collection.
        """
        shelters = [Shelter.from_dict(i) for i in self.collection.find()]
        return shelters

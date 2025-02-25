"""
This module handles data converstion from dictionary to class obj or vice versa
"""
import uuid
import dataclasses
from domains.shelter.address import Address

@dataclasses.dataclass

class Shelter:
    """
    Data class for shelter-related data.
    """
    name: str
    address: Address
    _id: uuid.UUID = None

    def get_id(self):
        """Returns the ID of the work shift."""
        return self._id
    def set_id(self, new_id):
        """Sets the ID of the work shift."""
        self._id = new_id

    @classmethod
    def from_dict(self, d):
        """
        The function is a class method that takes in a dictionary
        and returns an instance of the class.
        """
        return self(**d)
    def to_dict(self):
        """
        The function takes an object and returns a dictionary
        representation of the object.
        """
        return dataclasses.asdict(self)

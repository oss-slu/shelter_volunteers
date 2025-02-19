"""
This module handles data converstion from dictionary to class obj or vice versa
"""
import uuid
import dataclasses

@dataclasses.dataclass

class Address:
    """
    Data class for address data.
    """
    
    street1: str
    street2: str # Optional
    city: str
    state: str # State/Province/Region
    postalCode: str
    country: str
    coordinates: {
        "latitude": float,
        "longitude": float
    }

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
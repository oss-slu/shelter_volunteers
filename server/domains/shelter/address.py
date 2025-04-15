"""
This module handles data converstion from dictionary to class obj or vice versa
"""
import dataclasses

@dataclasses.dataclass

class Address:
    """
    Data class for address data.
    """
    street1: str
    city: str
    state: str
    street2: str = ""
    postal_code: str = ""
    country: str = "USA"
    coordinates: dict = dataclasses.field(default_factory=dict) #user can provide longitude and latitude or thru json 

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

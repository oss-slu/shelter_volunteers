"""
This module handles data conversion from dictionary to class obj or vice versa
"""
import dataclasses
@dataclasses.dataclass
class ShelterVolunteer:
    """
    Data class for keeping track of the number of workers and which workers
    signed up for a given time interval
    """
    email: str
    first_name: str
    last_name: str
    phone_number: str
    signed_up_shifts: list[int]

    @classmethod
    def from_dict(self, d):
        """
        The function is a class method that takes in a dictionary
        and returns an instance of the class
        """
        return self(**d)

    def to_dict(self):
        """
        The function takes an object and returns a dictionary
        representation of the object
        """
        return dataclasses.asdict(self)
"""
This module handles data conversion from dictionary to class obj or vice versa
"""
import dataclasses
@dataclasses.dataclass
class Volunteer:
    """
    Data class for keeping track of the number of workers and which workers
    signed up for a given time interval
    """
    start_time: int
    end_time: int
    count: int
    worker: str
    email: str

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
    
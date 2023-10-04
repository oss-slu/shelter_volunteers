"""
This module handles data converstion from dictionary to class obj or vice versa
"""
import uuid
import dataclasses


@dataclasses.dataclass
class WorkShift:
    """
    Data class for workshift releated data
    """
    code: uuid.UUID
    worker: str
    shelter: str
    start_time: int  # number of milliseconds since the Epoch in UTC
    end_time: int

    @classmethod
    def from_dict(self, d):
        """
        The function is a class method that takes in a dictionary and returns an instance of the class.
        """
        return self(**d)

    def to_dict(self):
        """
        The function takes an object and returns a dictionary representation of the object.
        """
        return dataclasses.asdict(self)

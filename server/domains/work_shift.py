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
    shelter_id: int
    shift_name: str
    start_time: int  # Number of milliseconds since the Epoch in UTC
    end_time: int
    required_volunteer_count: int
    max_volunteer_count: int
    can_sign_up: bool
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

"""
This module handles data conversion from 
dictionary to class obj or vice versa.
"""
import uuid
import dataclasses

@dataclasses.dataclass
class ServiceShift:  
    """
    Data class for work shift-related data.
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
        """Returns the ID of the service shift."""
        return self._id

    def set_id(self, new_id):
        """Sets the ID of the service shift."""
        self._id = new_id

    @classmethod
    def from_dict(cls, d):
        """
        Creates an instance of ServiceShift from a dictionary.
        """
        return cls(**d)

    def to_dict(self):
        """
        Converts the ServiceShift instance into a dictionary.
        """
        return dataclasses.asdict(self)

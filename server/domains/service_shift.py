"""
This module handles data conversion from 
dictionary to class obj or vice versa.
"""
import dataclasses

@dataclasses.dataclass

class ServiceShift:
    """
    Data class for work shift-related data.
    """
    shelter_id: int
    shift_start: int  # Number of milliseconds since the Epoch in UTC
    shift_end: int
    shift_name: str = 'Default Shift'
    required_volunteer_count: int = 1
    max_volunteer_count: int = 5
    can_sign_up: bool = True
    _id: str = None

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
        _id = str(d.pop("_id", None)) if "_id" in d else None
        obj = cls(**d)
        obj.set_id(_id)
        return obj

    def to_dict(self):
        """
        Converts the ServiceShift instance into a dictionary.
        """
        return dataclasses.asdict(self)

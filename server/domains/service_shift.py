"""
This module handles data conversion from 
dictionary to class obj or vice versa.
"""
import dataclasses
from typing import Optional


@dataclasses.dataclass
class ServiceShift:
    """
    Data class for work shift-related data.
    """
    shelter_id: str
    shift_start: int  # Number of milliseconds since the Epoch in UTC
    shift_end: int
    shift_name: str = "Unnamed Shift"
    instructions: str = ""
    required_volunteer_count: int = 1
    max_volunteer_count: int = 5
    can_sign_up: bool = True
    _id: Optional[str] = None

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
        Ignores unknown keys (e.g. legacy fields like 'instructions').
        """
        valid_keys = {f.name for f in dataclasses.fields(cls)}
        filtered = {k: v for k, v in d.items() if k in valid_keys}
        if "_id" in filtered and filtered["_id"] is not None:
            filtered["_id"] = str(filtered["_id"])
        return cls(**filtered)

    def to_dict(self):
        """
        Converts the ServiceShift instance into a dictionary.
        """
        return dataclasses.asdict(self)

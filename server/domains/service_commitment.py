"""
This module defines the ServiceCommitment 
class, which represents a volunteer's commitment to a ServiceShift.
"""

import dataclasses
from typing import Optional

@dataclasses.dataclass
class ServiceCommitment:
    """
    Data class for service commitments.

    Represents a volunteer signing up for a specific ServiceShift.
    """
    volunteer_id: str  # Typically an email address
    service_shift_id: str  # The ID of the associated ServiceShift
    _id: Optional[str] = None  # Unique ID for this commitment
    volunteer_name: str | None = None
    volunteer_phone_number: str | None = None

    def get_id(self):
        """Returns the ID of the service shift."""
        return self._id

    def set_id(self, new_id):
        """Sets the ID of the service shift."""
        self._id = new_id

    @classmethod
    def from_dict(cls, d):
        """
        Creates a ServiceCommitment instance from a dictionary.
        """
        return cls(**d)

    def to_dict(self):
        """
        Converts the ServiceCommitment instance into a dictionary.
        """
        return dataclasses.asdict(self)

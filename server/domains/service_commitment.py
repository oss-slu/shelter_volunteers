"""
This module defines the ServiceCommitment 
class, which represents a volunteer's commitment to a ServiceShift.
"""

import uuid
import dataclasses

@dataclasses.dataclass
class ServiceCommitment:
    """
    Data class for service commitments.

    Represents a volunteer signing up for a specific ServiceShift.
    """
    _id: uuid.UUID  # Unique ID for this commitment
    volunteer_id: str  # Typically an email address
    service_shift_id: uuid.UUID  # The ID of the associated ServiceShift

    def __post_init__(self):
        """Ensures _id is generated if not provided."""
        if self._id is None:
            self._id = uuid.uuid4()  # Auto-generate a unique ID

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

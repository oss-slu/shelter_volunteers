"""
This module defines the data model 
for service commitments.
A service commitment links a volunteer 
to a specific service shift.
"""

import uuid
import dataclasses

@dataclasses.dataclass
class ServiceCommitment:
    """
    Data class for tracking volunteer commitments to service shifts.
    """
    volunteer_id: str
    service_shift_id: uuid.UUID

    @classmethod
    def from_dict(cls, data):
        """Creates a ServiceCommitment instance from a dictionary."""
        return cls(**data)

    def to_dict(self):
        """Converts the ServiceCommitment instance to a dictionary."""
        return dataclasses.asdict(self)

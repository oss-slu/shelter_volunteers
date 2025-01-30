"""
This module defines data classes for 
service shifts and commitments,
with the deprecated WorkShift 
class marked for removal.
"""

import uuid
import dataclasses
from deprecated import deprecated

@deprecated(
    reason="WorkShift is deprecated and will be replaced by ServiceCommitment."
)

@dataclasses.dataclass
class WorkShift:
    """
    Data class for a deprecated WorkShift entity.
    """
    worker: str
    first_name: str
    last_name: str
    shelter: int
    start_time: int
    end_time: int
    _id: uuid.UUID = None

    def get_id(self):
        """Returns the ID of the work shift."""
        return self._id

    def set_id(self, new_id):
        """Sets the ID of the work shift."""
        self._id = new_id

    @classmethod
    def from_dict(cls, d):
        """Creates a WorkShift instance from a dictionary."""
        return cls(**d)

    def to_dict(self):
        """Converts the WorkShift instance to a dictionary."""
        return dataclasses.asdict(self)


@dataclasses.dataclass
class ServiceShift:
    """
    Data class for shelter-defined service shifts.
    """
    shelter: int
    start_time: int
    end_time: int
    volunteers_needed: int
    _id: uuid.UUID = None

    def get_id(self):
        """Returns the ID of the service shift."""
        return self._id

    def set_id(self, new_id):
        """Sets the ID of the service shift."""
        self._id = new_id

    @classmethod
    def from_dict(cls, d):
        """Creates a ServiceShift instance from a dictionary."""
        return cls(**d)

    def to_dict(self):
        """Converts the ServiceShift instance to a dictionary."""
        return dataclasses.asdict(self)


@dataclasses.dataclass
class ServiceCommitment:
    """
    Data class for tracking volunteer commitments to service shifts.
    """
    volunteer_id: str
    service_shift_id: uuid.UUID

    @classmethod
    def from_dict(cls, d):
        """Creates a ServiceCommitment instance from a dictionary."""
        return cls(**d)

    def to_dict(self):
        """Converts the ServiceCommitment instance to a dictionary."""
        return dataclasses.asdict(self)

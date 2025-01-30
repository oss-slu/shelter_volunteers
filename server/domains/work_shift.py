import uuid
import dataclasses
import warnings
from deprecated import deprecated

@deprecated(reason="WorkShift is deprecated and will be replaced by ServiceCommitment.")
@dataclasses.dataclass
class WorkShift:
    """
    [DEPRECATED] Data class for work shift-related data.
    """
    worker: str
    first_name: str
    last_name: str
    shelter: int
    start_time: int  # number of milliseconds since the Epoch in UTC
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
        warnings.warn("WorkShift is deprecated. Use ServiceCommitment instead.", DeprecationWarning)
        return cls(**d)

    def to_dict(self):
        warnings.warn("WorkShift is deprecated. Use ServiceCommitment instead.", DeprecationWarning)
        return dataclasses.asdict(self)

# New ServiceShift class replacing Work
@dataclasses.dataclass
class ServiceShift:
    """
    Data class for shelter-defined service shifts.
    """
    shelter: int
    start_time: int  # number of milliseconds since the Epoch in UTC
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
        return cls(**d)

    def to_dict(self):
        return dataclasses.asdict(self)

# New ServiceCommitment class for volunteer sign-ups
@dataclasses.dataclass
class ServiceCommitment:
    """
    Data class for tracking volunteer commitments to service shifts.
    """
    volunteer_id: str  # Email or unique identifier
    service_shift_id: uuid.UUID

    @classmethod
    def from_dict(cls, d):
        return cls(**d)

    def to_dict(self):
        return dataclasses.asdict(self)

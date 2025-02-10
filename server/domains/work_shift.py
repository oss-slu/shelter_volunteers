"""
This module handles data converstion from dictionary to class obj or vice versa
"""
import uuid
import dataclasses
from deprecated import deprecated

@deprecated(
    reason="WorkShift is deprecated and will be removed in a future release. "
           "Use ServiceShift instead."
)
@dataclasses.dataclass
class WorkShift:
    """
    **DEPRECATED:** Use `ServiceShift` instead.
    """
    worker: str
    first_name: str
    last_name: str
    shelter: int
    start_time: int  # number of milliseconds since the Epoch in UTC
    end_time: int
    _id: uuid.UUID = None

    @deprecated(reason="get_id() is deprecated along with WorkShift.")
    def get_id(self):
        """Returns the ID of the work shift."""
        return self._id
    
    @deprecated(reason="set_id() is deprecated along with WorkShift.")
    def set_id(self, new_id):
        """Sets the ID of the work shift."""
        self._id = new_id

    @classmethod
    @deprecated(reason="from_dict() is deprecated along with WorkShift. Use ServiceShift.from_dict instead.")
    def from_dict(self, d):
        """
        The function is a class method that takes in a dictionary
        and returns an instance of the class.
        """
        return self(**d)

    @deprecated(reason="to_dict() is deprecated along with WorkShift. Use ServiceShift.to_dict instead.")
    def to_dict(self):
        """
        The function takes an object and returns a dictionary
        representation of the object.
        """
        return dataclasses.asdict(self)

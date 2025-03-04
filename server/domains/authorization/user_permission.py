import uuid
import dataclasses

from dataclasses import dataclass
from typing import List

@dataclasses.dataclass
class UserPermission:
    email: str
    roles: List[str] = dataclasses.field(default_factory=list) # Role IDs
    _id: uuid.UUID = None

    def get_id(self):
        """Returns the ID of the user permissions object"""
        return self._id

    def set_id(self, new_id):
        """Sets the ID of the user permissions object."""
        self._id = new_id

    @classmethod
    def from_dict(cls, d):
        """
        Creates a UserPermission instance from a dictionary.
        """
        return cls(**d)

    def to_dict(self):
        """
        Converts the UserPermission instance into a dictionary.
        """
        return dataclasses.asdict(self)
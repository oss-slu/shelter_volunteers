import uuid
import dataclasses
from typing import List

from domains.authorization.access import Access

@dataclasses.dataclass
class UserPermission:
    email: str
    full_access: List[Access] = dataclasses.field(default_factory=list) # Roles
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
        Converts full_access dictionary objects to Access objects.
        """
        # Create a copy of the dictionary to avoid modifying the original
        dict_copy = d.copy()
        
        # Convert full_access list if it exists
        if 'full_access' in dict_copy:
            dict_copy['full_access'] = [
                Access.from_dict(access) if isinstance(access, dict) else access 
                for access in dict_copy['full_access']
            ]
        
        return cls(**dict_copy)

    def to_dict(self):
        """
        Converts the UserPermission instance into a dictionary.
        """
        return dataclasses.asdict(self)
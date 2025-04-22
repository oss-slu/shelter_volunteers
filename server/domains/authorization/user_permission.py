"""
UserPermission class definition.
"""
import uuid
import dataclasses
from domains.resources import Resources
from typing import List

from domains.authorization.access import Access

@dataclasses.dataclass
class UserPermission:
    """
    Data class for user permissions.
    """
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

    def has_access(self, resource_type, resource_id=None):
        """
        Check if the user has access to the given resource type and ID.
        """
        for access in self.full_access:
            if access.resource_type == resource_type:
                if resource_id is None or resource_id in access.resource_ids:
                    return True
        return False

    def add_access(self, resource_type, resource_id=None):
        """
        Add access to the given resource type and ID.
        """
        for access in self.full_access:
            if access.resource_type == resource_type:
                # no duplicated access is allowed: if a user already has access,
                # we don't add it again
                if resource_id is not None and \
                   resource_id not in access.resource_ids:
                    access.resource_ids.append(resource_id)
                return
        self.full_access.append(
            Access(resource_type=resource_type, resource_ids=[resource_id])
        )
    def is_system_admin(self):
        """
        Check if the user has system admin access.
        """
        for access in self.full_access:
            if access.resource_type == Resources.SYSTEM:
                return True
        return False
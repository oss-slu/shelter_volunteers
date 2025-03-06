"""
This module is for a custom JSON encoder for serializing UserPermission objects
"""
import json

class UserPermissionJsonEncoder(json.JSONEncoder):
    """Encode a UserPermission object to JSON."""
    def default(self, user_permission):
        """Encode a UserPermission object to JSON."""
        try:
            print(user_permission)
            to_serialize = {
                "full_access": [
                    {
                        "resource_type": access.resource_type,
                        "resource_ids": access.resource_ids
                    } for access in user_permission.full_access
                ],
            }
            return to_serialize
        except AttributeError:
            return super().default(user_permission)

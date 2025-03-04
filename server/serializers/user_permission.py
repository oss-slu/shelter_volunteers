"""
This module is for a custom JSON encoder for serializing UserPermission objects
"""
import json

class UesrPermissionJsonEncoder(json.JSONEncoder):
    """Encode a UserPermission object to JSON."""
    def default(self, user_permission):
        """Encode a UserPermission object to JSON."""
        try:
            print(user_permission)
            to_serialize = {
                "access": user_permission.access,
            }
            return to_serialize
        except AttributeError:
            return super().default(user_permission)


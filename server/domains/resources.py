"""
Enumeration of resources used in the system
"""
class Resources:
    """
    Enumeration of resources used in the system
    """
    SHELTER = "shelter"
    PERMISSIONS = "permissions"
    SHIFT = "shift"
    SYSTEM = "system"

    @staticmethod
    def values():
        return [
            Resources.SHELTER,
            Resources.PERMISSIONS,
            Resources.SHIFT,
            Resources.SYSTEM
        ]

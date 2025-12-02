"""
This module is for a custom JSON encoder for serializing Volunteer objects.
"""

import json


class ShelterVolunteerJsonEncoder(json.JSONEncoder):
    """Encode a Volunteer object to JSON."""

    def default(self, sheltervolunteer):
        """Encode a WorkShift object to JSON."""
        try:
            to_serialize = {
                "email": sheltervolunteer.email,
                "first_name": sheltervolunteer.first_name,
                "last_name": sheltervolunteer.last_name,
                "phone_number": sheltervolunteer.phone_number,
                "signed_up_shifts": sheltervolunteer.signed_up_shifts,
            }
            return to_serialize
        except AttributeError:
            return super().default(sheltervolunteer)

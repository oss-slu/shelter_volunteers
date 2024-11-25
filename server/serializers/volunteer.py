"""
This module is for a custom JSON encoder for serializing Volunteer objects.
"""
import json

class VolunteerJsonEncoder(json.JSONEncoder):
    """Encode a Volunteer object to JSON."""
    def default(self, volunteer):
        """Encode a WorkShift object to JSON."""
        try:
            to_serialize = {
               "email": volunteer.email,
                "first_name": volunteer.first_name,
                "last_name": volunteer.last_name,
                "phone_number": volunteer.phone_number,
                "signed_up_shifts": volunteer.signed_up_shifts, #need to check this one, just a placeholder for now
            }
            return to_serialize
        except AttributeError:
            return super().default(volunteer)

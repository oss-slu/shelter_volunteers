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
                "start_time": volunteer.start_time,
                "end_time": volunteer.end_time,
                "count": volunteer.count,
                "worker": volunteer.worker,
                "email": volunteer.email
            }
            return to_serialize
        except AttributeError:
            return super().default(volunteer)

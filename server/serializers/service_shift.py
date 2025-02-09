"""
This module is for a custom JSON encoder for serializing WorkShift objects.
"""
import json


class WorkJsonEncoder(json.JSONEncoder):
    """Encode a WorkShift object to JSON."""
    def default(self, work):
        """Encode a WorkShift object to JSON."""
        try:
            to_serialize = {
                "_id": str(work.get_id()),
                "shelter_id": work.shelter_id,
                "shift_name": work.shift_name,
                "start_time": work.start_time,
                "end_time": work.end_time,
                "required_volunteer_count": work.required_volunteer_count,
                "max_volunteer_count": work.max_volunteer_count,
                "can_sign_up": work.can_sign_up,
            }
            return to_serialize
        except AttributeError:
            return super().default(work)
        
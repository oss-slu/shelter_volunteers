"""
This module is for a custom JSON encoder for serializing WorkShift objects.
"""
import json


class WorkShiftJsonEncoder(json.JSONEncoder):
    """Encode a WorkShift object to JSON."""
    def default(self, workshift):
        """Encode a WorkShift object to JSON."""
        try:
            to_serialize = {
                "_id": str(workshift.get_id()),
                "shelter_id": workshift.shelter_id,
                "shift_name": workshift.shift_name,
                "start_time": workshift.start_time,
                "end_time": workshift.end_time,
                "required_volunteer_count": workshift.required_volunteer_count,
                "max_volunteer_count": workshift.max_volunteer_count,
                "can_sign_up": workshift.can_sign_up,
            }
            return to_serialize
        except AttributeError:
            return super().default(workshift)

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
                "worker": workshift.worker,
                "shelter": workshift.shelter,
                "start_time": workshift.start_time,
                "end_time": workshift.end_time,
            }
            return to_serialize
        except AttributeError:
            return super().default(workshift)

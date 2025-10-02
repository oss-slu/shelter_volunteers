"""
This module is for a custom JSON encoder for serializing Staffing objects.
"""
import json

class StaffingJsonEncoder(json.JSONEncoder):
    """Encode a Staffing object to JSON."""
    def default(self, staffing):
        """Encode a WorkShift object to JSON."""
        try:
            to_serialize = {
                "start_time": staffing.start_time,
                "end_time": staffing.end_time,
                "count": staffing.count,
            }
            return to_serialize
        except AttributeError:
            return super().default(staffing)

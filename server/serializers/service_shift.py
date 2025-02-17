"""
This module is for a custom JSON encoder for serializing ServiceShift objects.
"""
import json
from server.domains.service_shift import ServiceShift

class WorkJsonEncoder(json.JSONEncoder):
    """Encode a ServiceShift object to JSON."""
    def default(self, work):
        """Encode a WorkShift object to JSON."""
        if isinstance(work, ServiceShift):
            return {
                "_id": str(work.get_id()),
                "shelter_id": work.shelter_id,
                "shift_name": work.shift_name,
                "start_time": work.start_time,
                "end_time": work.end_time,
                "required_volunteer_count": work.required_volunteer_count,
                "max_volunteer_count": work.max_volunteer_count,
                "can_sign_up": work.can_sign_up,
                "repeat_days": getattr(work, "repeat_days", [])
            }
            return to_serialize
        except AttributeError:
        return super().default(work)

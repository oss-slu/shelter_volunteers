"""
This module is for a custom JSON encoder for serializing WorkShift objects.
"""
import json


class ServiceShiftJsonEncoder(json.JSONEncoder):
    """Encode a ServiceShift object to JSON."""
    def default(self, shift):
        """Encode a ServiceShift object to JSON."""
        try:
            to_serialize = {
                "_id": str(shift.get_id()),
                "shelter_id": shift.shelter_id,
                "shift_start": shift.shift_start,
                "shift_end": shift.shift_end,
                "required_volunteer_count": shift.required_volunteer_count,
                "max_volunteer_count": shift.max_volunteer_count,
                "can_sign_up": shift.can_sign_up,
                "shift_name": shift.shift_name,
                "instructions": shift.instructions,
            }
            return to_serialize
        except AttributeError:
            return super().default(shift)

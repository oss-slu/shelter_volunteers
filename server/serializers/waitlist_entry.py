"""
Custom JSON encoder for serializing WaitlistEntry objects.
"""
import json


class WaitlistEntryJsonEncoder(json.JSONEncoder):
    """Encode a WaitlistEntry object to JSON."""

    def default(self, entry):
        try:
            return {
                "_id": str(entry.get_id()) if entry.get_id() is not None else None,
                "service_shift_id": entry.service_shift_id,
                "volunteer_id": entry.volunteer_id,
                "joined_at": entry.joined_at,
            }
        except AttributeError:
            return super().default(entry)

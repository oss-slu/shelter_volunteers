"""
This module is for a custom JSON encoder for serializing ServiceCommitment objects.
"""
import json

class ServiceCommitmentJsonEncoder(json.JSONEncoder):
    """Encode a ServiceCommitment object to JSON."""
    def default(self, commitment):
        """Encode a ServiceCommitment object to JSON."""
        try:
            to_serialize = {
                "_id": str(commitment.get_id()),
                "service_shift_id": commitment.service_shift_id,
                "volunteer_id": commitment.volunteer_id
            }
            return to_serialize
        except AttributeError:
            return super().default(commitment)
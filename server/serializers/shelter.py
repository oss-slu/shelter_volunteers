"""
This module is for a custom JSON encoder for serializing Shelter objects.
"""
import json

class ShelterJsonEncoder(json.JSONEncoder):
    """Encode a Shelter object to JSON."""
    def default(self, shelter):
        """Encode a Shelter object to JSON."""
        try:
            print(shelter)
            to_serialize = {
                "_id": str(shelter.get_id()),
                "name": shelter.name,
                "address": shelter.address,
            }
            return to_serialize
        except AttributeError:
            return super().default(shelter)

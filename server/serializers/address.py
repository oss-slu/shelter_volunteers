"""
This module is for a custom JSON encoder for serializing Address objects.
"""
import json

class AddressJsonEncoder(json.JSONEncoder):
    """Encode a Shelter object to JSON."""
    def default(self, shelter):
        """Encode a Shelter object to JSON."""
        try:
            to_serialize = {
                "street1": str(shelter.street1),
                "street2": shelter.street1,
                "city": shelter.city,
                "state": shelter.state,
                "postalCode": shelter.postalCode,
                "coordinates": {shelter.coordinates.latitude, shelter.coordinates.longitude},
            }
            return to_serialize
        except AttributeError:
            return super().default(shelter)

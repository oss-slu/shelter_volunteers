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
                "address": json.loads(
                    json.dumps(shelter.address, cls=AddressJsonEncoder)
                    ),
            }
            return to_serialize
        except AttributeError:
            return super().default(shelter)

class AddressJsonEncoder(json.JSONEncoder):
    """Encode an Address object to JSON."""
    def default(self, address):
        """Encode an Address object to JSON."""
        try:
            to_serialize = {
                "street1": address.street1,
                "street2": address.street2,
                "city": address.city,
                "state": address.state,
                "postalCode": address.postal_code,
                "country": address.country,
                "coordinates": {
                    address.coordinates.latitude,
                    address.coordinates.longitude
                    },
            }
            return to_serialize
        except AttributeError:
            return super().default(address)

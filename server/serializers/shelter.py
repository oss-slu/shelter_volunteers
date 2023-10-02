import json

class ShelterJsonEncoder(json.JSONEncoder):
   def default(self, shelter):
      try:
         to_serialize = {
            "id": str(shelter.id),
            "name": shelter.name,
            "phone": shelter.phone,
            "city": shelter.city,
            "state": shelter.state,
            "zipCode": shelter.zipCode,
            "latitude": shelter.latitude,
            "longitude": shelter.longitude,
            "beds": shelter.beds,
            "distance": shelter.distance,
         }
         return to_serialize
      except AttributeError:
         return super().default(shelter)

from domains.shelter import Shelter

class ShelterRepo:
   def __init__(self, data):
      self.data = data

   def list(self):
      return [Shelter.from_dict(i) for i in self.data]

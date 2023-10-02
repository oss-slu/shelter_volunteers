import uuid
import dataclasses

@dataclasses.dataclass
class Shelter:
    id: uuid.UUID
    name: str
    phone: str
    city: str
    state: str
    zipCode: int
    latitude: float
    longitude: float
    beds: int
    distance: float
    
    @classmethod
    def from_dict(self, d):
        obj = {
            "id": d["id"],
            "name": d["name"],
            "phone": d["phone"],
            "city": d["city"],
            "state": d["state"],
            "zipCode": d["zipCode"],
            "latitude": d["latitude"],
            "longitude": d["longitude"],
            "beds": d["beds"],
            "distance": d["distance"],
        }
        return self(**obj)

    def to_dict(self):
        return dataclasses.asdict(self)
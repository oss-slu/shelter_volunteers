from domains.service_shift import ServiceShift
from config.mongodb_config import get_db

class ScheduleMongoRepo:
    def __init__(self):
        self.db = get_db()
        self.collection = self.db.schedules

    def list_by_shelter_id(self, shelter_id):
        shifts = self.collection.find({"shelter_id": shelter_id})
        return [ServiceShift.from_dict(s) for s in shifts]
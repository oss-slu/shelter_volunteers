"""MongoDB-backed repository for storing repeatable shift templates."""

from typing import Optional

from bson import ObjectId
from pymongo import UpdateOne, InsertOne
from pymongo.synchronous.database import Database

from config.mongodb_config import get_db
from domains.shared.result import Result, Success
from domains.shelter.schedule.repeatable_shift import RepeatableShift
from domains.shelter.schedule.repeatable_shifts import RepeatableShifts


def shift_to_dto(shift: RepeatableShift, shelter_id: str):
    dto = shift.__dict__.copy()
    dto["shelter_id"] = shelter_id

    # Convert 'id' to '_id' for MongoDB
    if "id" in dto and dto["id"] is not None:
        dto["_id"] = ObjectId(dto["id"])
    if "id" in dto:
        del dto["id"]

    return dto


def dto_to_operation(dto: dict):
    if "_id" in dto:
        return UpdateOne({"_id": dto["_id"]}, {"$set": dto}, upsert=True)
    else:
        return InsertOne(dto)


class RepeatableShiftsRepository:
    """Repository providing save and query operations for repeatable shifts.

    This class wraps a MongoDB collection (from the configured database) and
    exposes methods used by the use-cases to persist and retrieve
    RepeatableShifts.
    """

    def __init__(self, db: Optional[Database] = None):
        self.db = db if db is not None else get_db()
        self.collection = self.db.schedule

    def save(self, repeatable_shifts: RepeatableShifts) -> Result[RepeatableShifts]:
        """
        This method does a full replacement of the repeatable shifts for a shelter.
        Any shifts not in `repeatable_shifts` will be deleted from the database.

        In one bulk operation, it inserts shifts without an ID and updates those with an ID.
        After that, it deletes any shifts in the database that don't have an ID in the
        union of those being inserted/updated.
        """

        ids_to_keep = []
        bulk_operations = []

        shifts = repeatable_shifts.shifts.copy()
        for shift in shifts:
            if shift.id is None:
                shift.id = str(ObjectId())
                dto = shift_to_dto(shift, repeatable_shifts.shelter_id)
                bulk_operations.append(InsertOne(dto))
            else:
                dto = shift_to_dto(shift, repeatable_shifts.shelter_id)
                bulk_operations.append(
                    UpdateOne({"_id": ObjectId(shift.id)}, {"$set": dto})
                )
            ids_to_keep.append(ObjectId(shift.id))

        if len(bulk_operations) > 0:
            self.collection.bulk_write(bulk_operations)
        self.collection.delete_many(
            {"_id": {"$nin": ids_to_keep}, "shelter_id": repeatable_shifts.shelter_id}
        )

        result = RepeatableShifts(
            shelter_id=repeatable_shifts.shelter_id, shifts=shifts
        )
        return Success(result)

    def get_all_for_shelter(self, shelter_id: str) -> Result[RepeatableShifts]:
        cursor = self.collection.find({"shelter_id": shelter_id})
        shifts = [
            RepeatableShift(
                id=str(doc.get("_id")),
                shift_start=doc.get("shift_start"),
                shift_end=doc.get("shift_end"),
                required_volunteer_count=doc.get("required_volunteer_count"),
                max_volunteer_count=doc.get("max_volunteer_count"),
                shift_name=doc.get("shift_name"),
            )
            for doc in cursor
        ]
        return Success(RepeatableShifts(shelter_id, shifts))

"""
MongoDB repository for waitlist entries.
"""
from typing import List, Optional

from bson.errors import InvalidId
from bson.objectid import ObjectId

from config.mongodb_config import get_db
from domains.waitlist_entry import WaitlistEntry


class WaitlistMongoRepo:
    """A MongoDB repository for managing service shift waitlist entries."""

    def __init__(self, collection_name: str = "waitlist_entries"):
        self.db = get_db()
        self.collection = self.db[collection_name]

    def add_entry(self, entry: WaitlistEntry) -> str:
        """Insert a new waitlist entry. Returns the inserted id."""
        payload = entry.to_dict()
        payload.pop("_id", None)
        result = self.collection.insert_one(payload)
        return str(result.inserted_id)

    def remove_entry(self, entry_id: str) -> bool:
        """Delete a waitlist entry by its id."""
        try:
            result = self.collection.delete_one({"_id": ObjectId(entry_id)})
        except (InvalidId, TypeError):
            return False
        return result.deleted_count > 0

    def remove_for_user_and_shift(self, volunteer_id: str, shift_id: str) -> int:
        """Delete a volunteer's entry for a given shift."""
        result = self.collection.delete_many(
            {"volunteer_id": volunteer_id, "service_shift_id": shift_id}
        )
        return result.deleted_count

    def remove_all_for_shift(self, shift_id: str) -> int:
        """Delete every waitlist entry for a shift (e.g. when shift is removed)."""
        result = self.collection.delete_many({"service_shift_id": shift_id})
        return result.deleted_count

    def list_for_shift(self, shift_id: str) -> List[WaitlistEntry]:
        """Return every waitlist entry for a shift, oldest first (FIFO)."""
        cursor = self.collection.find(
            {"service_shift_id": shift_id}
        ).sort("joined_at", 1)
        return [WaitlistEntry.from_dict(doc) for doc in cursor]

    def list_for_user(self, volunteer_id: str) -> List[WaitlistEntry]:
        """Return every waitlist entry for a volunteer, oldest first."""
        cursor = self.collection.find(
            {"volunteer_id": volunteer_id}
        ).sort("joined_at", 1)
        return [WaitlistEntry.from_dict(doc) for doc in cursor]

    def find_for_user_and_shift(
        self, volunteer_id: str, shift_id: str
    ) -> Optional[WaitlistEntry]:
        """Return the existing waitlist entry for (volunteer, shift) if any."""
        doc = self.collection.find_one(
            {"volunteer_id": volunteer_id, "service_shift_id": shift_id}
        )
        if not doc:
            return None
        return WaitlistEntry.from_dict(doc)

    def get_by_id(self, entry_id: str) -> Optional[WaitlistEntry]:
        """Fetch a single waitlist entry by id."""
        try:
            doc = self.collection.find_one({"_id": ObjectId(entry_id)})
        except (InvalidId, TypeError):
            return None
        if not doc:
            return None
        return WaitlistEntry.from_dict(doc)

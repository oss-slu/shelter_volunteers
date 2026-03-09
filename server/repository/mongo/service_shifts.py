"""
This module handles MongoDB interactions with the service_shifts collection.
"""

from domains.service_shift import ServiceShift
from config.mongodb_config import get_db
#from bson.errors import InvalidId
from bson.objectid import ObjectId

class ServiceShiftsMongoRepo:
    """
    MongoDB repository class for managing service shifts.
    """

    def __init__(self, collection_name="service_shifts"):
        """
        Initialize the repository with a MongoDB connection.
        """
        self.db = get_db()
        self.collection = self.db[collection_name]

    def add_service_shifts(self, shift_data):
        """
        Adds new service shifts to the database.
        
        Args:
            shift_data (list): A list of service shift dictionaries.
        
        Returns:
            list: A list of inserted shift IDs.
        """
        for shift in shift_data:
            shift.pop("_id", None)  # Remove _id to let MongoDB generate it
        result = self.collection.insert_many(shift_data)
        return [str(shift_id) for shift_id in result.inserted_ids]

    def check_shift_overlap(self, shelter_id, shift_start, shift_end):
        """
        Checks if a new shift overlaps with an existing shift.
        
        Args:
            shelter_id (int): The shelter ID.
            shift_start (int): The start time of the new shift.
            shift_end (int): The end time of the new shift.
        
        Returns:
            bool: True if there is an overlap, False otherwise.
        """
        overlapping = self.collection.find_one(
            {
                "shelter_id": shelter_id,
                "shift_start": {"$lt": shift_end},
                "shift_end": {"$gt": shift_start},
            }
        )
        return overlapping is not None

    def list(self, shelter_id=None, filter_start_after=None):
        """
        Retrieves service shifts, optionally filtered by shelter_id and time.
        
        Args:
            shelter_id (int, optional): The ID of the shelter.
            filter_start_after (int, optional): The minimum start time.
        
        Returns:
            list: A list of service shift objects.
        """
        db_filter = {}
        if shelter_id:
            db_filter["shelter_id"] = shelter_id
        if filter_start_after:
            db_filter["shift_start"] = {"$gt": filter_start_after}

        service_shifts = [
            ServiceShift.from_dict(shift)
            for shift in self.collection.find(db_filter)
        ]
        for shift in service_shifts:
            shift.set_id(str(shift.get_id()))
        return service_shifts

    def get_shifts(self, shift_ids):
        """
        Gets multiple shifts by a list of IDs.
        
        Args:
            shift_ids (list): A list of shift IDs.
        
        Returns:
            list: A list of ServiceShift objects.
        """
        try:
            object_ids = [ObjectId(sid) for sid in shift_ids]
            shifts = list(self.collection.find({"_id": {"$in": object_ids}}))
            for shift in shifts:
                shift["_id"] = str(shift["_id"])
            return [ServiceShift.from_dict(shift) for shift in shifts]
        except Exception as e:
            raise ValueError(f"Invalid shift ID: {e}") from e

    def find_shifts_due_for_24h_reminder(self, now_ms, window_ms):
        """
        Finds confirmed shifts due for 24-hour reminder.
        Shifts where shift_start is within [now+24h-window, now+24h+window]
        and reminder_24h_sent is False.

        Args:
            now_ms (int): Current time in milliseconds since epoch (UTC).
            window_ms (int): Time window in milliseconds (e.g. 15 min).

        Returns:
            list: ServiceShift objects.
        """
        ms_24h = 24 * 60 * 60 * 1000
        start_bound = now_ms + ms_24h - window_ms
        end_bound = now_ms + ms_24h + window_ms
        db_filter = {
            "shift_start": {"$gte": start_bound, "$lte": end_bound},
            "$or": [
                {"reminder_24h_sent": {"$exists": False}},
                {"reminder_24h_sent": False},
            ],
        }
        shifts = list(self.collection.find(db_filter))
        for shift in shifts:
            shift["_id"] = str(shift["_id"])
        return [ServiceShift.from_dict(s) for s in shifts]

    def find_shifts_due_for_2h_reminder(self, now_ms, window_ms):
        """
        Finds confirmed shifts due for 2-hour reminder.
        Shifts where shift_start is within [now+2h-window, now+2h+window]
        and reminder_2h_sent is False.

        Args:
            now_ms (int): Current time in milliseconds since epoch (UTC).
            window_ms (int): Time window in milliseconds (e.g. 15 min).

        Returns:
            list: ServiceShift objects.
        """
        ms_2h = 2 * 60 * 60 * 1000
        start_bound = now_ms + ms_2h - window_ms
        end_bound = now_ms + ms_2h + window_ms
        db_filter = {
            "shift_start": {"$gte": start_bound, "$lte": end_bound},
            "$or": [
                {"reminder_2h_sent": {"$exists": False}},
                {"reminder_2h_sent": False},
            ],
        }
        shifts = list(self.collection.find(db_filter))
        for shift in shifts:
            shift["_id"] = str(shift["_id"])
        return [ServiceShift.from_dict(s) for s in shifts]

    def mark_reminder_24h_sent(self, shift_id):
        """
        Marks reminder_24h_sent=True for a shift.

        Args:
            shift_id (str): The shift ID.

        Returns:
            bool: True if updated.
        """
        result = self.collection.update_one(
            {"_id": ObjectId(shift_id)},
            {"$set": {"reminder_24h_sent": True}},
        )
        return result.modified_count > 0

    def mark_reminder_2h_sent(self, shift_id):
        """
        Marks reminder_2h_sent=True for a shift.

        Args:
            shift_id (str): The shift ID.

        Returns:
            bool: True if updated.
        """
        result = self.collection.update_one(
            {"_id": ObjectId(shift_id)},
            {"$set": {"reminder_2h_sent": True}},
        )
        return result.modified_count > 0

    def find_shifts_due_for_reminder(self, window_start_ms, window_end_ms, reminder_type):
        """
        Finds confirmed shifts within a time window that have not yet had
        the specified reminder sent. Excludes shifts with can_sign_up=False
        (effectively cancelled).

        Args:
            window_start_ms (int): Start of window in ms since epoch (UTC).
            window_end_ms (int): End of window in ms since epoch (UTC).
            reminder_type (str): Either 'reminder_24h' or 'reminder_2h'.

        Returns:
            list: A list of ServiceShift objects.
        """
        field = "reminder_24h_sent" if reminder_type == "reminder_24h" else "reminder_2h_sent"
        db_filter = {
            "shift_start": {"$gte": window_start_ms, "$lte": window_end_ms},
            "can_sign_up": {"$ne": False},
            "$or": [{field: {"$exists": False}}, {field: False}],
        }
        shifts = list(self.collection.find(db_filter))
        for shift in shifts:
            shift["_id"] = str(shift["_id"])
        return [ServiceShift.from_dict(s) for s in shifts]

    def mark_reminder_sent(self, shift_id, reminder_type):
        """
        Updates the reminder flag for a shift after successful reminder trigger.

        Args:
            shift_id (str): The shift ID.
            reminder_type (str): Either 'reminder_24h' or 'reminder_2h'.

        Returns:
            bool: True if update was successful.
        """
        field = "reminder_24h_sent" if reminder_type == "reminder_24h" else "reminder_2h_sent"
        try:
            result = self.collection.update_one(
                {"_id": ObjectId(shift_id)},
                {"$set": {field: True}},
            )
            return result.modified_count > 0
        except Exception:  # pylint: disable=broad-exception-caught
            # Catch-all for DB driver errors (connection, InvalidId, etc.)
            return False

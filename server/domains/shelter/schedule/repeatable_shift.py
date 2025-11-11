"""Domain model for a single repeatable shift template."""

from dataclasses import dataclass
from typing import Optional

from domains.shared.result import Result, Success, Failure


@dataclass
class RepeatableShift:
    """A template for a repeating shift in a shelter schedule.

    Attributes
    ----------
    shift_start, shift_end: int
        Start and end times as integer timestamps or minutes from epoch.
    required_volunteer_count, max_volunteer_count: int
        Staffing constraints for the shift.
    shift_name: Optional[str]
        Optional human-readable name for the shift.
    id: Optional[str]
        Optional identifier (stringified ObjectId) assigned when persisted.
    """

    shift_start: int
    shift_end: int
    required_volunteer_count: int
    max_volunteer_count: int
    shift_name: Optional[str] = None
    id: Optional[str] = None

    @staticmethod
    def create(
            shift_start: int,
            shift_end: int,
            required_volunteer_count: int,
            max_volunteer_count: int,
            shift_name: Optional[str] = None,
            id: Optional[str] = None,
    ) -> Result["RepeatableShift"]:
        errors = {}
        if shift_end <= shift_start:
            if "shift_end" not in errors:
                errors["shift_end"] = []
            errors["shift_end"].append("End time must be after start time.")

        if errors:
            return Failure(keyed_errors=errors)

        result = RepeatableShift(
            shift_start,
            shift_end,
            required_volunteer_count,
            max_volunteer_count,
            shift_name,
            id
        )
        return Success(result)

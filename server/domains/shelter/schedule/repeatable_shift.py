"""Domain model for a single repeatable shift template.

The `id` attribute is intentionally named `id` because other modules and
serializers expect that attribute name; disable the redefined-builtin
warning for this module to avoid renaming it project-wide.
"""

# pylint: disable=redefined-builtin

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

        if required_volunteer_count > max_volunteer_count:
            if "required_volunteer_count" not in errors:
                errors["required_volunteer_count"] = []
            errors["required_volunteer_count"].append(
                "Required volunteer count cannot exceed maximum volunteer count."
            )

        if required_volunteer_count < 1:
            if "required_volunteer_count" not in errors:
                errors["required_volunteer_count"] = []
            errors["required_volunteer_count"].append(
                "Required volunteer count must be at least 1."
            )

        if errors:
            return Failure(keyed_errors=errors)

        result = RepeatableShift(
            shift_start,
            shift_end,
            required_volunteer_count,
            max_volunteer_count,
            shift_name,
            id,
        )
        return Success(result)

"""Collection of repeatable shift templates belonging to a shelter."""

from dataclasses import dataclass
from typing import List

from domains.shared.result import Result, Success
from domains.shelter.schedule.repeatable_shift import RepeatableShift


@dataclass
class RepeatableShifts:
    shelter_id: str
    shifts: List[RepeatableShift]

    @staticmethod
    def create(
        shelter_id: str, shifts: List[RepeatableShift]
    ) -> Result["RepeatableShifts"]:
        result = RepeatableShifts(shelter_id, shifts)
        return Success(result)

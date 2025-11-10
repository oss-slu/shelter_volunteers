from dataclasses import dataclass

from domains.shared.result import Result, Success
from domains.shelter.schedule.repeatable_shift import RepeatableShift


@dataclass
class RepeatableShifts:
    shelter_id: str
    shifts: list[RepeatableShift]

    @staticmethod
    def create(shelter_id: str, shifts: list[RepeatableShift]) -> Result["RepeatableShifts"]:
        result = RepeatableShifts(shelter_id, shifts)
        return Success(result)

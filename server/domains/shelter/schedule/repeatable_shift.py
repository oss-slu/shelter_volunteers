from dataclasses import dataclass
from typing import Optional

from domains.shared.result import Result, Success


@dataclass
class RepeatableShift:
    shift_start: int
    shift_end: int
    required_volunteer_count: int
    max_volunteer_count: int
    shift_name: Optional[str] = None
    id: Optional[str] = None

    @staticmethod
    def create(shift_start: int, shift_end: int, required_volunteer_count: int, max_volunteer_count: int,
               shift_name: Optional[str] = None) -> Result["RepeatableShift"]:
        result = RepeatableShift(shift_start, shift_end, required_volunteer_count, max_volunteer_count, shift_name)
        return Success(result)

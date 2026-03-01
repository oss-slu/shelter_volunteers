"""Collection of repeatable shift templates belonging to a shelter."""

from dataclasses import dataclass
from typing import List

from domains.shared.result import Result, Success
from domains.shelter.schedule.repeatable_shift import RepeatableShift


@dataclass
class RepeatableShifts:
    """Collection wrapper for a shelter's repeatable shift templates."""

    shelter_id: str
    shifts: List[RepeatableShift]

    @staticmethod
    def create(
        shelter_id: str, shifts: List[RepeatableShift]
    ) -> Result["RepeatableShifts"]:
        deduped_shifts = []
        dedupe_idx_by_key = {}
        for shift in shifts:
            dedupe_key = (
                shift.shift_start,
                shift.shift_end,
                shift.required_volunteer_count,
                shift.max_volunteer_count,
                shift.shift_name,
                shift.instructions,
                shift.instructions_recurring,
            )
            existing_idx = dedupe_idx_by_key.get(dedupe_key)
            if existing_idx is None:
                dedupe_idx_by_key[dedupe_key] = len(deduped_shifts)
                deduped_shifts.append(shift)
                continue

            # Prefer the entry with an id so updates keep stable persisted records.
            if deduped_shifts[existing_idx].id is None and shift.id is not None:
                deduped_shifts[existing_idx] = shift

        result = RepeatableShifts(shelter_id, deduped_shifts)
        return Success(result)

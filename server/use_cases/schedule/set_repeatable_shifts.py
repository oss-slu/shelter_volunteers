from typing import List

from domains.shared.result import Result
from domains.shelter.schedule.repeatable_shift import RepeatableShift
from domains.shelter.schedule.repeatable_shifts import RepeatableShifts
from repository.mongo.repeatable_shifts_repository import RepeatableShiftsRepository


def set_repeatable_shifts(
    shelter_id: str,
    shifts: List[RepeatableShift],
    repository: RepeatableShiftsRepository,
) -> Result[RepeatableShifts]:
    create_result = RepeatableShifts.create(shelter_id, shifts)
    if create_result.is_success:
        return repository.save(create_result.value)
    return create_result

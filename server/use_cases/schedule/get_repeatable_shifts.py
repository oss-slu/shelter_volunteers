from repository.mongo.repeatable_shifts_repository import RepeatableShiftsRepository


def get_repeatable_shifts(shelter_id: str, repository: RepeatableShiftsRepository):
    return repository.get_all_for_shelter(shelter_id)

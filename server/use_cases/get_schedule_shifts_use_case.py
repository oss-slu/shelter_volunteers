def get_schedule_shifts_use_case(repo, shelter_id):
    return repo.list_by_shelter_id(shelter_id)
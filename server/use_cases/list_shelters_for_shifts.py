"""
Use case for listing shelters associated with service shifts.
"""
def list_shelters_for_shifts(service_shifts, shelter_repo):
    """
    Retrieves shifts and shelters associated with service commitments.

    Args:
        service_shifts: A list of service shifts
        shelter_repo: The repository for accessing shelters.

    Returns:
        tuple: A tuple containing a list of shifts and a list of shelters.
    """

    shelters = []
    
    for shift in service_shifts:
        shelter = shelter_repo.get_by_id(shift.shelter_id)
        if shelter and shelter not in shelters:
            shelters.append(shelter)

    return shelters
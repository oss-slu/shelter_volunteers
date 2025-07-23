"""
Use case for retrieving shelter administrators.
This use case fetches all users with shelter admin permissions from the repository.
"""

def get_shelter_admins(repo, shelter_id: str):
    """
    Retrieves all shelter administrators for a specific shelter from the repository.

    Args:
        repo (PermissionsMongoRepo): The repository instance to fetch shelter admins.
        shelter_id (str): The ID of the shelter to fetch admins for.

    Returns:
        list: A list of user permissions representing shelter administrators.
    """
    return repo.get_shelter_admins(shelter_id)

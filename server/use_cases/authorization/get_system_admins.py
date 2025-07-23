"""
Use case for retrieving system administrators.
This use case fetches all users with system admin permissions from the repository.
"""

def get_system_admins(repo):
    """
    Retrieves all system administrators from the repository.

    Args:
        repo (PermissionsMongoRepo): The repository instance to fetch system admins.

    Returns:
        list: A list of user permissions representing system administrators.
    """
    return repo.get_system_admins()

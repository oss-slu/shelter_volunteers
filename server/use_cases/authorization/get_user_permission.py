"""
This file contains the use case to get the user permission 
of a user in a repository.
"""
from domains.resources import Resources
def get_user_permission(permissions_repo, user_email, shelter_repo = None):
    """
    Retrieve the user permission of a user in a repository.
    """
    user_permission = permissions_repo.get_user_permissions(user_email)
    if user_permission is None:
        return None
    if shelter_repo is not None and user_permission.is_system_admin():
        # Get all shelters if the user is a system admin
        shelters = shelter_repo.list()
        for shelter in shelters:
            user_permission.add_access(Resources.SHELTER, str(shelter.get_id()))
    return user_permission

from use_cases.authorization.get_user_permission import get_user_permission
from responses import ResponseSuccess
from domains.resources import Resources
from domains.authorization.user_permission import UserPermission

def add_shelter_admin(repo, shelter_id: str,  admin_email: str):
    """
    Add a shelter admin to the system
    """
    user_permission = get_user_permission(repo, admin_email)
    if user_permission == None:
        user_permission = UserPermission(email=admin_email)
        repo.add(user_permission)
    elif user_permission.has_access(Resources.SHELTER, shelter_id):
        return ResponseSuccess({'message': 'This user is already an admin for this shelter'})

    user_permission.add_access(Resources.SHELTER, shelter_id)
    repo.update(user_permission)
    return ResponseSuccess({'message': 'User added as admin for this shelter'})
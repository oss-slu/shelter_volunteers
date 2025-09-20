"""
Use case definition for adding a shelter admin
"""

from use_cases.authorization.get_user_permission import get_user_permission
from responses import ResponseSuccess
from domains.resources import Resources
from domains.authorization.user_permission import UserPermission

def remove_shelter_admin(repo, shelter_id: str,  admin_email: str):
    """
    Add a shelter admin to the system
    """
    if shelter_id is None:
        raise ValueError('shelter_id cannot be None')
    if admin_email is None:
        raise ValueError('admin_email cannot be None')

    user_permission = get_user_permission(repo, admin_email)
    if user_permission is None or not user_permission.has_access(Resources.SHELTER, shelter_id):
        return ResponseSuccess(
            {'message': 'This user is not an admin for this shelter',
             'success': False
            }
        )

    user_permission.remove_access(Resources.SHELTER, shelter_id)
    repo.update(user_permission)
    return ResponseSuccess({'message': 'User removed from admin for this shelter',
                            'success': True
                           })

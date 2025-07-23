"""
Adds system admin role to the user
"""
from use_cases.authorization.get_user_permission import get_user_permission
from domains.resources import Resources
from domains.authorization.user_permission import UserPermission
from responses import ResponseSuccess

def add_system_admin(repo, user_email: str):
    """
    Add a system admin to the system
    """
    user_permission = get_user_permission(repo, user_email)
    if user_permission is None:
        user_permission = UserPermission.from_dict({'email': user_email})
        repo.add(user_permission)
    elif user_permission.has_access(Resources.SYSTEM):
        return ResponseSuccess(
            {'message': 'This user is already a system admin',
             'success': False
            }
        )

    user_permission.add_access(Resources.SYSTEM)
    repo.update(user_permission)
    return ResponseSuccess({'message': 'User added as system admin',
                            'success': True
                           })

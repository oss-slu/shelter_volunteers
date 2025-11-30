"""
Removes system admin role from user
"""
from use_cases.authorization.get_user_permission import get_user_permission
from domains.resources import Resources
from responses import ResponseSuccess

def remove_system_admin(repo, user_email: str):
    """
    Removes a system admin from the system
    """
    user_permission = get_user_permission(repo, user_email)
    if user_permission is None or not user_permission.has_access(Resources.SYSTEM):
        return ResponseSuccess(
            {'message': 'This user is not a system admin',
             'success': False
            }
        )

    user_permission.remove_access(Resources.SYSTEM)
    repo.update(user_permission)
    return ResponseSuccess({'message': 'System admin revoked from user',
                            'success': True
                           })

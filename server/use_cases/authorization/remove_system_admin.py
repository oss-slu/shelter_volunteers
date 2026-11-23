"""
Removes system admin role from user
"""
from use_cases.authorization.get_user_permission import get_user_permission
from domains.resources import Resources
from responses import ResponseFailure, ResponseSuccess, ResponseTypes

def remove_system_admin(repo, user_email: str, requesting_email: str):
    """
    Removes a system admin from the system
    """
    if user_email.strip().casefold() == requesting_email.strip().casefold():
        return ResponseFailure(
            ResponseTypes.AUTHORIZATION_ERROR,
            "You cannot remove your own system admin access",
        )

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

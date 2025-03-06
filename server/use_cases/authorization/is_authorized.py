from use_cases.authorization.get_user_permission import get_user_permission
from domains.resources import Resources

def is_authorized(repo, user_email, resource, resource_id=None):
    """
    Check if the user is authorized to manage the specified resource
    """
    user_permission = get_user_permission(repo, user_email)
    if user_permission == None:
        return False
    
    if user_permission.has_access(resource, resource_id):
        return True

    if user_permission.has_access(Resources.SYSTEM):
        return True
    
    return False
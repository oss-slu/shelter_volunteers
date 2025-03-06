"""
This file contains the use case to get the user permission 
of a user in a repository.
"""

def get_user_permission(repo, user_email):
    """
    Retrieve the user permission of a user in a repository.
    """
    user_permission = repo.get_user_permissions(user_email)
    return user_permission

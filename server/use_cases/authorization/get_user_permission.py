"""
This file contains the use case to get the user permission of a user in a repository.
"""

def get_user_permission(repo, user_email):
    userPermission = repo.get_user_permissions(user_email)
    return userPermission
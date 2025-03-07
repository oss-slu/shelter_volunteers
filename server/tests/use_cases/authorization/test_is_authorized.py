"""
Unit tests for is_authorized use case.
"""

from unittest.mock import Mock
from use_cases.authorization.is_authorized import is_authorized
from domains.resources import Resources

def set_up_shelter():
    """
    Set up parameters for calling is_authorized for a shelter resource
    """
    repo = Mock()
    user_email = "test@example.com"
    resource = Resources.SHELTER
    resource_id = 1
    return repo, user_email, resource, resource_id

def set_up_system():
    """
    Set up parameters for calling is_authorized for a system resource
    """
    repo = Mock()
    user_email = "test@example.com"
    resource = Resources.SYSTEM
    return repo, user_email, resource

def test_user_has_access_to_resource():
    """
    Test if a user has access to a specific resource.

    This test sets up a mock repository and user permissions,
    then checks if the  user is authorized to access the given
    resource and resource ID.
    """
    repo, user_email, resource, resource_id = set_up_shelter()
    user_permission = Mock()
    user_permission.has_access = Mock(
        side_effect=lambda r, rid: r == resource and rid == resource_id
    )
    repo.get_user_permissions = Mock(return_value=user_permission)

    result = is_authorized(repo, user_email, resource, resource_id)
    assert result

def test_user_has_system_access():
    """
    Test if a user is authorized to access the SYSTEM resource.

    The user has explicit permission to access SYSTEM resource and does not
    have explicit permission to access SHELTER resource.
    """
    repo, user_email, resource = set_up_system()
    user_permission = Mock()
    user_permission.has_access = Mock(
        side_effect=lambda r, rid=None: (
            r == Resources.SYSTEM or r != Resources.SHELTER
        )
    )
    repo.get_user_permissions = Mock(return_value=user_permission)

    result = is_authorized(repo, user_email, resource)
    assert result

def test_system_admin_user_has_shelter_access():
    """
    Test if a system admin user is authorized to access the SHELTER resource.

    The user has explicit permission to access SYSTEM resource and does not
    have explicit permission to access SHELTER resource.
    """
    repo, user_email, resource, resource_id = set_up_shelter()
    user_permission = Mock()
    user_permission.has_access = Mock(
        side_effect=lambda r, rid=None: (
            r == Resources.SYSTEM or r != Resources.SHELTER
        )
    )
    repo.get_user_permissions = Mock(return_value=user_permission)

    result = is_authorized(repo, user_email, resource, resource_id)
    assert result

def test_user_has_no_access():
    """
    Test case to verify that a user without access permissions 
    is not authorized.
    """
    repo, user_email, resource, resource_id = set_up_shelter()
    user_permission = Mock()
    user_permission.has_access = Mock(return_value=False)
    repo.get_user_permissions = Mock(return_value=user_permission)

    result = is_authorized(repo, user_email, resource, resource_id)
    assert not result

def test_user_permission_is_none():
    """
    Test case to verify that a user with no permissions is not authorized.
    """
    repo, user_email, resource, resource_id = set_up_shelter()
    repo.get_user_permissions = Mock(return_value=None)

    result = is_authorized(repo, user_email, resource, resource_id)
    assert not result

def test_user_has_access_to_resource_without_resource_id():
    """
    Test that user has no access to a resource when the resource ID is None.
    """
    repo, user_email, resource, _ = set_up_shelter()
    resource_id = None
    user_permission = Mock()
    user_permission.has_access = Mock(return_value=False)
    repo.get_user_permissions = Mock(return_value=user_permission)

    result = is_authorized(repo, user_email, resource, resource_id)
    assert not result

def test_user_has_no_access_without_resource_id():
    """
    Test that a user does not have access when the resource ID is None.
    """
    repo, user_email, resource, _ = set_up_shelter()
    resource_id = None
    user_permission = Mock()
    user_permission.has_access = Mock(return_value=False)
    repo.get_user_permissions = Mock(return_value=user_permission)

    result = is_authorized(repo, user_email, resource, resource_id)
    assert not result

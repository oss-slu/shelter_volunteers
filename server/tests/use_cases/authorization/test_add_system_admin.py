"""
Unit tests for add_system_admin use case
"""

from unittest.mock import Mock
from use_cases.authorization.add_system_admin import add_system_admin
from responses import ResponseSuccess
from domains.resources import Resources
from domains.authorization.user_permission import UserPermission

def test_add_system_admin_new_user():
    repo = Mock()
    repo.get_user_permissions.return_value = None
    user_email = 'new_user@example.com'

    response = add_system_admin(repo, user_email)

    assert isinstance(response, ResponseSuccess)
    assert response.value == {
        'message': 'User added as system admin',
        'success': True
    }
    repo.add.assert_called_once()
    repo.update.assert_called_once()

def test_add_system_admin_existing_user_without_access():
    repo = Mock()
    user_permission = UserPermission.from_dict(
        {'email': 'existing_user@example.com'}
    )
    repo.get_user_permissions.return_value = user_permission
    user_email = 'existing_user@example.com'

    response = add_system_admin(repo, user_email)

    assert isinstance(response, ResponseSuccess)
    assert response.value == {
        'message': 'User added as system admin',
        'success': True
    }
    repo.update.assert_called_once()

def test_add_system_admin_existing_user_with_access():
    repo = Mock()
    user_permission = UserPermission.from_dict(
        {'email': 'existing_admin@example.com'}
    )
    user_permission.add_access(Resources.SYSTEM)
    repo.get_user_permissions.return_value = user_permission
    user_email = 'existing_admin@example.com'

    response = add_system_admin(repo, user_email)

    assert isinstance(response, ResponseSuccess)
    assert response.value == {
        'message': 'This user is already a system admin',
        'success': False
    }
    repo.update.assert_not_called()

def test_add_system_admin_existing_shelter_admin():
    repo = Mock()
    user_permission = UserPermission.from_dict(
        {'email': 'shelter_admin@example.com'}
    )
    user_permission.add_access(Resources.SHELTER, 12345)
    repo.get_user_permissions.return_value = user_permission
    user_email = 'shelter_admin@example.com'

    response = add_system_admin(repo, user_email)

    assert isinstance(response, ResponseSuccess)
    assert response.value == {
        'message': 'User added as system admin',
        'success': True
    }
    repo.update.assert_called_once()

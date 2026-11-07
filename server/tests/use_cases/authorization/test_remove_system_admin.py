from unittest.mock import Mock

from domains.authorization.user_permission import UserPermission
from domains.resources import Resources
from responses import ResponseFailure, ResponseSuccess, ResponseTypes
from use_cases.authorization.remove_system_admin import remove_system_admin


def test_remove_system_admin_denies_self_removal():
    repo = Mock()

    response = remove_system_admin(
        repo,
        "Admin@Example.com",
        "admin@example.com",
    )

    assert isinstance(response, ResponseFailure)
    assert response.response_type == ResponseTypes.AUTHORIZATION_ERROR
    assert response.value == {
        "type": ResponseTypes.AUTHORIZATION_ERROR,
        "message": "You cannot remove your own system admin access",
    }
    repo.get_user_permissions.assert_not_called()
    repo.update.assert_not_called()


def test_remove_system_admin_allows_removing_another_admin():
    repo = Mock()
    permission = UserPermission(email="other@example.com")
    permission.add_access(Resources.SYSTEM)
    repo.get_user_permissions.return_value = permission

    response = remove_system_admin(
        repo,
        "other@example.com",
        "requester@example.com",
    )

    assert isinstance(response, ResponseSuccess)
    assert response.value == {
        "message": "System admin revoked from user",
        "success": True,
    }
    repo.update.assert_called_once_with(permission)

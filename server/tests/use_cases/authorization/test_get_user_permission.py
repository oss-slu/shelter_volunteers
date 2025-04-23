"""
test_get_user_permission.py
This file contains the test cases for the get_user_permission use case.
It tests the functionality of the get_user_permission function
to ensure it correctly retrieves user permissions from the repository.
"""

from unittest.mock import Mock
from use_cases.authorization.get_user_permission import get_user_permission
from domains.resources import Resources
from domains.authorization.user_permission import UserPermission
from domains.shelter.shelter import Shelter

def test_get_user_permission_none():
    """
    Test case for when the user permission is None.
    """
    repo = Mock()
    repo.get_user_permissions.return_value = None
    permission = get_user_permission(repo, 'somebody@something.com')
    assert permission is None

def test_get_user_permission_system_admin():
    """
    Test case for when the user is a system admin.
    Verifies that the user has full access to all shelters and system resources.
    """
    email = 'somebody@something.com'
    admin_permission = {
        'email': email,
        'full_access':[{
            'resource_type': Resources.SYSTEM, 'resource_ids': None
        }]
    }
    shelter_list = [
        {
            'name': 'shelter1',
            '_id': 'shelter1',
            'address':{
                'street1': '123 Main St',
                'city': 'CityA',
                'state': 'StateA',
                'zip_code': '12345'
            }
        },
        {
            'name': 'shelter2',
            '_id': 'shelter2',
            'address': {
                'street1': '456 Elm St',
                'city': 'CityB',
                'state': 'StateB',
                'zip_code': '67890'
            }
        },
    ]
    shelters = [Shelter.from_dict(shelter) for shelter in shelter_list]
    # permissions repo
    repo = Mock()
    repo.get_user_permissions.return_value = UserPermission.from_dict(
        admin_permission
    )

    # shelter repo
    shelter_repo = Mock()
    shelter_repo.list.return_value = shelters

    user_permissions = get_user_permission(repo, email, shelter_repo)
    assert user_permissions is not None
    assert user_permissions.is_system_admin() is True
    assert len(user_permissions.full_access) == 2
    assert user_permissions.full_access[0].resource_type == Resources.SYSTEM
    assert user_permissions.full_access[0].resource_ids is None
    assert user_permissions.full_access[1].resource_type == Resources.SHELTER
    assert len(user_permissions.full_access[1
                                            ].resource_ids) == 2
    assert user_permissions.full_access[1].resource_ids[0] == 'shelter1'
    assert user_permissions.full_access[1].resource_ids[1] == 'shelter2'

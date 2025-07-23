"""
Test cases for add_shelter_admin use case.
"""

import unittest
from unittest.mock import Mock
from use_cases.authorization.add_shelter_admin import add_shelter_admin
from responses import ResponseSuccess
from domains.resources import Resources
from domains.authorization.user_permission import UserPermission

class TestAddShelterAdmin(unittest.TestCase):
    """
    Test cases for add_shelter_admin use case.
    """
    def setUp(self):
        self.repo = Mock()
        self.shelter_id = 'shelter_123'
        self.admin_email = 'admin@example.com'

    def test_add_shelter_admin_new_user(self):
        self.repo.get_user_permissions.return_value = None

        response = add_shelter_admin(
            self.repo,
            self.shelter_id,
            self.admin_email
        )

        self.repo.add.assert_called_once()
        self.repo.update.assert_called_once()
        self.assertIsInstance(response, ResponseSuccess)
        self.assertEqual(
            response.value,
            {'message': 'User added as admin for this shelter',
             'success': True
            }
        )

    def test_add_shelter_admin_existing_user_no_access(self):
        user_permission = UserPermission(email=self.admin_email)
        self.repo.get_user_permissions.return_value = user_permission

        response = add_shelter_admin(
            self.repo,
            self.shelter_id,
            self.admin_email
        )

        self.repo.update.assert_called_once()
        self.assertIsInstance(response, ResponseSuccess)
        self.assertEqual(
            response.value,
            {'message': 'User added as admin for this shelter',
             'success': True
            }
        )

    def test_add_shelter_admin_existing_user_with_access(self):
        user_permission = UserPermission(email=self.admin_email)
        user_permission.add_access(Resources.SHELTER, self.shelter_id)
        self.repo.get_user_permissions.return_value = user_permission

        response = add_shelter_admin(
            self.repo,
            self.shelter_id,
            self.admin_email
        )

        self.repo.update.assert_not_called()
        self.assertIsInstance(response, ResponseSuccess)
        self.assertEqual(
            response.value,
            {'message': 'This user is already an admin for this shelter',
             'success': False
            }
        )

    def test_add_shelter_admin_existing_user_admin_for_another_shelter(self):
        another_shelter_id = 'shelter_456'
        user_permission = UserPermission(email=self.admin_email)
        user_permission.add_access(Resources.SHELTER, another_shelter_id)
        self.repo.get_user_permissions.return_value = user_permission

        response = add_shelter_admin(
            self.repo,
            self.shelter_id,
            self.admin_email
        )

        self.repo.update.assert_called_once()
        self.assertIsInstance(response, ResponseSuccess)
        self.assertEqual(
            response.value,
            {'message': 'User added as admin for this shelter',
             'success': True
            }
        )

    def test_add_shelter_admin_existing_system_admin(self):
        user_permission = UserPermission(email=self.admin_email)
        user_permission.add_access(Resources.SYSTEM)
        self.repo.get_user_permissions.return_value = user_permission

        response = add_shelter_admin(
            self.repo,
            self.shelter_id,
            self.admin_email
        )

        self.repo.update.assert_called_once()
        self.assertIsInstance(response, ResponseSuccess)
        self.assertEqual(
            response.value,
            {'message': 'User added as admin for this shelter',
             'success': True
            }
        )

    def test_add_shelter_admin_without_shelter_id(self):
        with self.assertRaises(ValueError):
            add_shelter_admin(
                self.repo,
                None,
                self.admin_email
            )

    def test_add_shelter_admin_without_email(self):
        with self.assertRaises(ValueError):
            add_shelter_admin(
                self.repo,
                self.shelter_id,
                None
            )

if __name__ == '__main__':
    unittest.main()

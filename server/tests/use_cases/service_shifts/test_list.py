import unittest
from unittest.mock import Mock
from use_cases.list_service_shifts_use_case import service_shifts_list_use_case

class TestServiceShiftsListUseCase(unittest.TestCase):
    def test_service_shifts_list_use_case(self):
        class TestServiceShiftsListUseCase(unittest.TestCase):
            def test_service_shifts_list_use_case(self):
                # Create a mock repository
                mock_repo = Mock()

                # Create mock ServiceShift objects
                service_shift_1 = {
                    'id': 'shift1',
                    'worker': 'worker1',
                    'shelter': 'shelter1',
                    'start_time': '2023-10-01T08:00:00Z',
                    'end_time': '2023-10-01T12:00:00Z'
                }
                service_shift_2 = {
                    'id': 'shift2',
                    'worker': 'worker2',
                    'shelter': 'shelter2',
                    'start_time': '2023-10-02T08:00:00Z',
                    'end_time': '2023-10-02T12:00:00Z'
                }

                # Mock the repo.list method to return the mock ServiceShift objects
                mock_repo.list.return_value = [service_shift_1, service_shift_2]

                # Call the use case function
                result = service_shifts_list_use_case(mock_repo)

                # Verify that the result is the same as the mock ServiceShift objects
                self.assertEqual(result, [service_shift_1, service_shift_2])
                mock_repo.list.assert_called_once_with(None)

            def test_service_shifts_list_use_case_empty(self):
                # Create a mock repository
                mock_repo = Mock()

                # Mock the repo.list method to return an empty list
                mock_repo.list.return_value = []

                # Call the use case function
                result = service_shifts_list_use_case(mock_repo)

                # Verify that the result is an empty list
                self.assertEqual(result, [])
                mock_repo.list.assert_called_once_with(None)

            def test_service_shifts_list_use_case_with_shelter(self):
                # Create a mock repository
                mock_repo = Mock()

                # Create mock ServiceShift objects
                service_shift_1 = {
                    'id': 'shift1',
                    'worker': 'worker1',
                    'shelter': 'shelter1',
                    'start_time': '2023-10-01T08:00:00Z',
                    'end_time': '2023-10-01T12:00:00Z'
                }
                service_shift_2 = {
                    'id': 'shift2',
                    'worker': 'worker2',
                    'shelter': 'shelter1',
                    'start_time': '2023-10-02T08:00:00Z',
                    'end_time': '2023-10-02T12:00:00Z'
                }

                # Mock the repo.list method to return the mock ServiceShift objects
                mock_repo.list.return_value = [service_shift_1, service_shift_2]

                # Call the use case function with a specific shelter
                result = service_shifts_list_use_case(mock_repo, shelter='shelter1')

                # Verify that the result is the same as the mock ServiceShift objects
                self.assertEqual(result, [service_shift_1, service_shift_2])
                mock_repo.list.assert_called_once_with('shelter1')

            def test_service_shifts_list_use_case_with_exception(self):
                # Create a mock repository
                mock_repo = Mock()

                # Mock the repo.list method to raise an exception
                mock_repo.list.side_effect = Exception("Database error")

                # Call the use case function and verify it raises the same exception
                with self.assertRaises(Exception) as context:
                    service_shifts_list_use_case(mock_repo)

                self.assertTrue("Database error" in str(context.exception))
                mock_repo.list.assert_called_once_with(None)

        if __name__ == '__main__':
            unittest.main()
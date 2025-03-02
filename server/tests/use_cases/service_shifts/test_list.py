import unittest
from unittest.mock import Mock
from server.use_cases.list_service_shifts_use_case import service_shifts_list_use_case

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

if __name__ == '__main__':
    unittest.main()
    
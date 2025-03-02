"""Unit tests for the service_shifts_list_use_case module."""
import unittest
from unittest.mock import Mock
from use_cases.list_service_shifts_use_case import service_shifts_list_use_case


class TestServiceShiftsListUseCase(unittest.TestCase):
    """Unit tests for service_shifts_list_use_case."""

    def test_service_shifts_list_use_case(self):
        """Test if service_shifts_list_use_case returns the correct shifts."""
        mock_repo = Mock()

        service_shift_1 = {
            "id": "shift1",
            "worker": "worker1",
            "shelter": "shelter1",
            "start_time": "2023-10-01T08:00:00Z",
            "end_time": "2023-10-01T12:00:00Z",
        }
        service_shift_2 = {
            "id": "shift2",
            "worker": "worker2",
            "shelter": "shelter2",
            "start_time": "2023-10-02T08:00:00Z",
            "end_time": "2023-10-02T12:00:00Z",
        }

        mock_repo.list.return_value = [service_shift_1, service_shift_2]

        result = service_shifts_list_use_case(mock_repo)

        self.assertEqual(result, [service_shift_1, service_shift_2])
        mock_repo.list.assert_called_once_with(None)

    def test_service_shifts_list_use_case_empty(self):
        """Test if service_shifts_list_use_case handles an empty list."""
        mock_repo = Mock()
        mock_repo.list.return_value = []

        result = service_shifts_list_use_case(mock_repo)

        self.assertEqual(result, [])
        mock_repo.list.assert_called_once_with(None)

    def test_service_shifts_list_use_case_with_shelter(self):
        """Test if service_shifts_list_use_case filters by shelter correctly."""
        mock_repo = Mock()

        service_shift_1 = {
            "id": "shift1",
            "worker": "worker1",
            "shelter": "shelter1",
            "start_time": "2023-10-01T08:00:00Z",
            "end_time": "2023-10-01T12:00:00Z",
        }
        service_shift_2 = {
            "id": "shift2",
            "worker": "worker2",
            "shelter": "shelter1",
            "start_time": "2023-10-02T08:00:00Z",
            "end_time": "2023-10-02T12:00:00Z",
        }

        mock_repo.list.return_value = [service_shift_1, service_shift_2]

        result = service_shifts_list_use_case(mock_repo, shelter="shelter1")

        self.assertEqual(result, [service_shift_1, service_shift_2])
        mock_repo.list.assert_called_once_with("shelter1")

    def test_service_shifts_list_use_case_with_exception(self):
        """Test if service_shifts_list_use_case handles exceptions properly."""
        mock_repo = Mock()
        mock_repo.list.side_effect = Exception("Database error")

        with self.assertRaises(Exception) as context:
            service_shifts_list_use_case(mock_repo)

        self.assertTrue("Database error" in str(context.exception))
        mock_repo.list.assert_called_once_with(None)


if __name__ == "__main__":
    unittest.main()

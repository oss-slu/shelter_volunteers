import unittest
import json
from unittest.mock import patch
from server.application.rest.service_shifts import app

class TestServiceShiftAPI(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    @patch('server.application.rest.service_shifts.shift_add_use_case')
    def test_post_service_shift(self, mock_shift_add_use_case):
        # Arrange: Set up the expected IDs returned by the use case.
        expected_ids = [101, 102]
        mock_shift_add_use_case.return_value = expected_ids

        # Define the POST request payload.
        payload = [
            {"shelter_id": 12345, "shift_start": 10, "shift_end": 20},
            {"shelter_id": 12345, "shift_start": 100, "shift_end": 200}
        ]
        headers = {
            'Authorization': '1234567890-developer-token',
            'Content-Type': 'application/json'
        }

        # Act: Send POST request.
        response = self.client.post('/service_shift', data=json.dumps(payload), headers=headers)

        # Assert: Verify the response.
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode('utf-8'))
        self.assertTrue(data.get('success'))
        self.assertEqual(data.get('service_shift_ids'), expected_ids)
        mock_shift_add_use_case.assert_called_once_with(payload)

    @patch('server.application.rest.service_shifts.service_shifts_list_use_case')
    def test_get_service_shift(self, mock_list_use_case):
        # Arrange: Define the expected shift list.
        expected_shifts = [
            {
                "_id": 201,
                "shelter_id": 1111,
                "shift_start": 10,
                "shift_end": 20,
                "required_volunteer_count": 1,
                "max_volunteer_count": 5,
                "can_sign_up": True,
                "shift_name": "Default Shift"
            },
            {
                "_id": 202,
                "shelter_id": 2222,
                "shift_start": 10,
                "shift_end": 20,
                "required_volunteer_count": 1,
                "max_volunteer_count": 5,
                "can_sign_up": True,
                "shift_name": "Default Shift"
            }
        ]
        mock_list_use_case.return_value = expected_shifts

        # Act: Send GET request.
        response = self.client.get('/service_shift')

        # Assert: Verify the response.
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode('utf-8'))
        self.assertEqual(data, expected_shifts)
        mock_list_use_case.assert_called_once()

if __name__ == '__main__':
    unittest.main()

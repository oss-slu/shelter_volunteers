"""
This module contains unit tests for the service_shift API.
"""
import unittest
import json
import re
from unittest.mock import patch
from flask import Flask
from application.rest.service_shifts import service_shift_bp
from domains.service_shift import ServiceShift

class TestServiceShiftAPI(unittest.TestCase):
    """
    Test cases for the service_shift API.
    """
    def setUp(self):
        # Create a test Flask app and register the service_shift blueprint.
        self.app = Flask(__name__)
        self.app.register_blueprint(service_shift_bp)
        self.app.testing = True
        self.client = self.app.test_client()

    @patch("application.rest.service_shifts.shift_add_use_case")
    def test_post_service_shift(self, mock_shift_add_use_case):
        # Arrange: Set up the expected response from the use case.
        expected_ids = [101, 102]
        # The production code expects a dict with keys 'success'
        # and 'service_shift_ids'
        mock_shift_add_use_case.return_value = {
            "success": True,
            "service_shift_ids": expected_ids
        }

        # Define the POST request payload.
        payload = [
            {"shelter_id": "12345", "shift_start": 10, "shift_end": 20},
            {"shelter_id": "12345", "shift_start": 100, "shift_end": 200}
        ]
        headers = {
            "Authorization": "1234567890-developer-token",
            "Content-Type": "application/json"  
        }

        # Act: Send POST request.
        response = self.client.post(
            "/service_shift",
            data=json.dumps(payload),
            headers=headers
            )

        # Assert: Verify that the response status is 200 and
        # the JSON payload is correct.
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode("utf-8"))
        self.assertTrue(data.get("success"))
        self.assertEqual(data.get("service_shift_ids"), expected_ids)
        mock_shift_add_use_case.assert_called_once()

    @patch("application.rest.service_shifts.service_shifts_list_use_case")
    def test_get_service_shift(self, mock_list_use_case):
        # Arrange: Define the expected list of shift objects.
        expected_shifts = [
            {
                "_id": 201,
                "shelter_id": "1111",
                "shift_start": 10,
                "shift_end": 20,
                "required_volunteer_count": 1,
                "max_volunteer_count": 5,
                "can_sign_up": True,
                "shift_name": "Default Shift"
            },
            {
                "_id": 202,
                "shelter_id": "2222",
                "shift_start": 10,
                "shift_end": 20,
                "required_volunteer_count": 1,
                "max_volunteer_count": 5,
                "can_sign_up": True,
                "shift_name": "Default Shift"
            }
        ]
        mock_list_use_case.return_value = [ServiceShift.from_dict(expected_shifts)]

        # Act: Send GET request.
        response = self.client.get("/service_shift")

        # The production code returns an iterable of JSON strings
        # without proper array delimiters.
        # We'll extract each JSON object from the concatenated response.
        data_str = response.get_data(as_text=True)
        # Find all JSON object substrings (assuming the objects are not nested).
        json_strings = re.findall(r"\{.*?\}", data_str)
        parsed_objects = [json.loads(s) for s in json_strings]

        # Assert: Verify that the parsed objects match the expected shifts.
        self.assertEqual(response.status_code, 200)
        self.assertEqual(parsed_objects, expected_shifts)
        mock_list_use_case.assert_called_once()

    @patch("application.rest.service_shifts.service_shifts_list_use_case")
    def test_get_service_shift_with_shelter_id_filter(self, mock_list_use_case):
        # Arrange: Define the expected shift for a specific shelter
        test_shelter_id = "ID1"
        expected_shift = {
          "_id": 301,
          "shelter_id": test_shelter_id,
          "shift_start": 10,
          "shift_end": 20,
          "required_volunteer_count": 1,
          "max_volunteer_count": 5,
          "can_sign_up": True,
          "shift_name": "Default Shift"
        }
        mock_list_use_case.return_value = [ServiceShift.from_dict(expected_shift)]

        # Act: Send GET request with shelter_id filter
        response = self.client.get(
            f"/service_shift?shelter_id={test_shelter_id}")

        # Parse response data
        data = json.loads(response.data.decode("utf-8"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["shelter_id"], test_shelter_id)
        mock_list_use_case.assert_called_once()

if __name__ == "__main__":
    unittest.main()

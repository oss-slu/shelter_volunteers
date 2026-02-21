"""
This module contains unit tests for the service_shift API.
"""
import unittest
import json
from unittest.mock import patch
from flask import Flask
from application.rest.service_shifts import service_shift_bp
from authentication.token import create_token
from domains.service_shift import ServiceShift


# pylint: disable=line-too-long
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
        self.test_secret = "test_secret"
        self.app.config["JWT_SECRET"] = self.test_secret
        token = create_token({"email": "user@app.com"}, self.test_secret)
        self.headers = {
            "Authorization": f"{token}",
            "Content-Type": "application/json"
        }

    @patch("application.rest.service_shifts.shift_add_use_case")
    @patch("application.rest.shelter_admin_permission_required.is_authorized")
    def test_post_service_shift(self, mock_is_authorized, mock_shift_add_use_case):
        mock_is_authorized.return_value = True
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

        # Act: Send POST request.
        response = self.client.post(
            "/shelters/12345/service_shifts",
            data=json.dumps(payload),
            headers=self.headers
        )

        # Assert: Verify that the response status is 200 and
        # the JSON payload is correct.
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode("utf-8"))
        self.assertTrue(data.get("success"))
        self.assertEqual(data.get("service_shift_ids"), expected_ids)
        mock_shift_add_use_case.assert_called_once()

    @patch("application.rest.service_shifts.shift_add_use_case")
    @patch("application.rest.shelter_admin_permission_required.is_authorized")
    def test_post_service_shift_trims_instructions(
        self, mock_is_authorized, mock_shift_add_use_case
    ):
        mock_is_authorized.return_value = True
        mock_shift_add_use_case.return_value = {"success": True, "service_shift_ids": [101]}

        payload = [
            {
                "shelter_id": "12345",
                "shift_start": 10,
                "shift_end": 20,
                "instructions": "  bring gloves  ",
            }
        ]
        response = self.client.post(
            "/shelters/12345/service_shifts",
            data=json.dumps(payload),
            headers=self.headers,
        )

        self.assertEqual(response.status_code, 200)
        (_, shifts_obj), _ = mock_shift_add_use_case.call_args
        self.assertEqual(shifts_obj[0].instructions, "bring gloves")

    @patch("application.rest.service_shifts.list_service_shifts_with_volunteers_use_case")
    def test_get_service_shift(self, mock_list_use_case):
        # Arrange: Define the expected list of shift objects.
        expected_shifts = [
            {
                "_id": "201",
                "shelter_id": "1111",
                "shift_start": 10,
                "shift_end": 20,
                "required_volunteer_count": 1,
                "max_volunteer_count": 5,
                "can_sign_up": True,
                "shift_name": "Default Shift",
                "instructions": "",
            },
            {
                "_id": "202",
                "shelter_id": "2222",
                "shift_start": 10,
                "shift_end": 20,
                "required_volunteer_count": 1,
                "max_volunteer_count": 5,
                "can_sign_up": True,
                "shift_name": "Default Shift",
                "instructions": "",
            }
        ]
        mock_list_use_case.return_value = ([ServiceShift.from_dict(shift)
                                           for shift in expected_shifts],
                                           [[],[]])
        expected_shifts[0]["volunteer_count"] = 0
        expected_shifts[1]["volunteer_count"] = 0
        # Act: Send GET request.
        response = self.client.get("/service_shifts")

        data = json.loads(response.data.decode("utf-8"))
        # Assert: Verify that the parsed objects match the expected shifts.
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data, expected_shifts)
        mock_list_use_case.assert_called_once()

    @patch("application.rest.service_shifts.list_service_shifts_with_volunteers_use_case")
    @patch("application.rest.shelter_admin_permission_required.is_authorized")
    def test_get_service_shift_with_shelter_id_filter(self, mock_is_authorized, mock_list_use_case):
        mock_is_authorized.return_value = True
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
          "shift_name": "Default Shift",
          "instructions": "",
        }
        mock_list_use_case.return_value = ([ServiceShift.from_dict(
            expected_shift)], [[]])

        # Act: Send GET request with shelter_id filter
        response = self.client.get(
            f"/shelters/{test_shelter_id}/service_shifts",
            headers=self.headers)

        # Parse response data
        data = json.loads(response.data.decode("utf-8"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["shelter_id"], test_shelter_id)
        mock_list_use_case.assert_called_once()

    @patch("application.rest.service_shifts.service_shifts_repo")
    @patch("application.rest.shelter_admin_permission_required.is_authorized")
    def test_patch_service_shift_updates_instructions(
        self, mock_is_authorized, mock_service_shifts_repo
    ):
        mock_is_authorized.return_value = True
        existing_shift = ServiceShift(
            shelter_id="12345",
            shift_start=10,
            shift_end=20,
            required_volunteer_count=1,
            instructions="old text",
            _id="abc123",
        )
        updated_shift = ServiceShift(
            shelter_id="12345",
            shift_start=10,
            shift_end=20,
            required_volunteer_count=2,
            instructions="updated instructions",
            _id="abc123",
        )

        mock_service_shifts_repo.get_shift.side_effect = [existing_shift, updated_shift]
        mock_service_shifts_repo.check_shift_overlap.return_value = False
        mock_service_shifts_repo.update_service_shift.return_value = True

        response = self.client.patch(
            "/shelters/12345/service_shifts/abc123",
            data=json.dumps(
                {
                    "required_volunteer_count": 2,
                    "instructions": "  updated instructions  ",
                }
            ),
            headers=self.headers,
        )

        data = json.loads(response.data.decode("utf-8"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data["instructions"], "updated instructions")
        mock_service_shifts_repo.update_service_shift.assert_called_once_with(
            "abc123",
            {"required_volunteer_count": 2, "instructions": "updated instructions"},
        )

    @patch("application.rest.shelter_admin_permission_required.is_authorized")
    def test_patch_service_shift_rejects_long_instructions(self, mock_is_authorized):
        mock_is_authorized.return_value = True
        long_instructions = "x" * 501

        with patch("application.rest.service_shifts.service_shifts_repo") as mock_repo:
            mock_repo.get_shift.return_value = ServiceShift(
                shelter_id="12345",
                shift_start=10,
                shift_end=20,
                _id="abc123",
            )
            response = self.client.patch(
                "/shelters/12345/service_shifts/abc123",
                data=json.dumps({"instructions": long_instructions}),
                headers=self.headers,
            )

        data = json.loads(response.data.decode("utf-8"))
        self.assertEqual(response.status_code, 400)
        self.assertIn("at most 500 characters", data["message"])

if __name__ == "__main__":
    unittest.main()
# pylint: enable=line-too-long

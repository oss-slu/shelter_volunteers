"""Unit tests for the /schedule GET endpoint using mocked repository."""

import unittest
from unittest.mock import patch
from application.app import create_app
from domains.service_shift import ServiceShift
from authentication.token import create_token

class TestScheduleEndpoint(unittest.TestCase):
    """Test case for verifying the /schedule endpoint returns correct JSON."""

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        self.shelter_id = "abc123"
        self.fake_shifts = [
            ServiceShift(
                shelter_id=self.shelter_id,
                shift_start=1714000000000,
                shift_end=1714007200000,
                shift_name="Test Shift",
                required_volunteer_count=2,
                max_volunteer_count=5,
                can_sign_up=True,
                _id="fake_id_1"
            )
        ]
        self.test_secret = "test_secret"
        self.app.config["JWT_SECRET"] = self.test_secret
        token = create_token({"email": "user@app.com"}, self.test_secret)
        self.headers = {
            "Authorization": f"{token}",
            "Content-Type": "application/json"
        }

    @patch("application.rest.schedule.ScheduleMongoRepo")
    @patch("application.rest.shelter_admin_permission_required.is_authorized")
    def test_get_schedule_returns_expected_data(self, mock_is_authorized, mock_repo):
        mock_is_authorized.return_value = True
        instance = mock_repo.return_value
        instance.list.return_value = self.fake_shifts

        response = self.client.get(
            f"/shelters/{self.shelter_id}/schedule", headers=self.headers
        )
        self.assertEqual(response.status_code, 200)

        data = response.get_json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["shift_name"], "Test Shift")

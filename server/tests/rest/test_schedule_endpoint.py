"""Unit tests for the /schedule GET endpoint using mocked repository."""

import unittest
from unittest.mock import patch
from application.app import create_app
from domains.service_shift import ServiceShift

class TestScheduleEndpoint(unittest.TestCase):
    """Test case for verifying the /schedule endpoint returns correct JSON."""

    def setUp(self):
        self.app = create_app().test_client()
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

    @patch("application.rest.schedule_get.ScheduleMongoRepo")
    def test_get_schedule_returns_expected_data(self, mock_repo):
        instance = mock_repo.return_value
        instance.list.return_value = self.fake_shifts

        response = self.app.get(f"/schedule?shelter_id={self.shelter_id}")
        self.assertEqual(response.status_code, 200)

        data = response.get_json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["shift_name"], "Test Shift")

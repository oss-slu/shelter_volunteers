"""
Tests for listing service commitments
"""

from unittest.mock import MagicMock
from use_cases.list_service_commitments import list_service_commitments
from request.time_filter import TimeFilter

class FakeCommitment:
    def __init__(self, service_shift_id, user_email):
        self.service_shift_id = service_shift_id
        self.user_email = user_email

def test_list_service_commitments_no_commitments():
    commitments_repo = MagicMock()
    shifts_repo = MagicMock()

    commitments_repo.fetch_service_commitments.return_value = []
    shifts_repo.get_shifts.return_value = []

    user_email = "test@example.com"
    commitments, shifts = list_service_commitments(
        commitments_repo, shifts_repo, TimeFilter(None), user_email
    )

    assert commitments == []
    assert shifts == []


def test_list_service_commitments_with_commitments():
    commitments_repo = MagicMock()
    shifts_repo = MagicMock()

    commitments_repo.fetch_service_commitments.return_value = [
        FakeCommitment(1, "test@example.com"),
        FakeCommitment(2, "test@example.com")
    ]

    shifts_repo.get_shifts.return_value = [
        {"shift_id": 1, "name": "Shift 1"},
        {"shift_id": 2, "name": "Shift 2"}
    ]

    user_email = "test@example.com"
    commitments, shifts = list_service_commitments(
        commitments_repo, shifts_repo, TimeFilter(None), user_email
    )

    assert len(commitments) == 2
    assert len(shifts) == 2

    assert commitments[0].service_shift_id == 1
    assert commitments[1].service_shift_id == 2

import pytest
from server.use_cases.service_commitments.add_service_commitments import add_service_commitments

class MockCommitmentRepo:
    def __init__(self):
        self.commitments = []

    def get_commitments_by_user(self, user_id):
        return self.commitments

    def insert_service_commitments(self, commitments):
        for commitment in commitments:
            commitment["_id"] = len(self.commitments) + 1  # Simulating DB ID assignment
            self.commitments.append(commitment)

class MockShiftRepo:
    def __init__(self, shifts):
        self.shifts = {s["id"]: s for s in shifts}

    def get_shifts(self, shift_ids):
        return [self.shifts[shift_id] for shift_id in shift_ids if shift_id in self.shifts]

@pytest.fixture
def setup_repos():
    shifts = [
        {"id": 1, "shift_start": 10, "shift_end": 20},
        {"id": 2, "shift_start": 10, "shift_end": 20},  # Overlapping with shift 1 (same start time)
        {"id": 3, "shift_start": 30, "shift_end": 40},  # No overlap
    ]
    return MockCommitmentRepo(), MockShiftRepo(shifts)

def test_non_overlapping_commitments(setup_repos):
    commitment_repo, shift_repo = setup_repos
    user_id = "test_user"

    commitments = [{"service_shift_id": 3}]  # No overlap
    response = add_service_commitments(commitment_repo, shift_repo, commitments, user_id)

    assert len(response) == 1
    assert response[0]["success"] is True

def test_overlapping_commitments_same_shift(setup_repos):
    """Test overlapping commitments for the same shift ID"""
    commitment_repo, shift_repo = setup_repos
    user_id = "test_user"

    response1 = add_service_commitments(commitment_repo, shift_repo, [{"service_shift_id": 1}], user_id)
    assert response1[0]["success"] is True

    response2 = add_service_commitments(commitment_repo, shift_repo, [{"service_shift_id": 1}], user_id)
    assert response2[0]["success"] is False
    assert response2[0]["message"] == "Overlapping commitment"

def test_overlapping_commitments_different_shift_ids(setup_repos):
    """Test overlapping commitments with different shift IDs but same start times"""
    commitment_repo, shift_repo = setup_repos
    user_id = "test_user"

    response1 = add_service_commitments(commitment_repo, shift_repo, [{"service_shift_id": 1}], user_id)
    assert response1[0]["success"] is True

    response2 = add_service_commitments(commitment_repo, shift_repo, [{"service_shift_id": 2}], user_id)
    assert response2[0]["success"] is False
    assert response2[0]["message"] == "Overlapping commitment"


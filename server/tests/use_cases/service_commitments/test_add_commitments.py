"""
Unit tests for add_service_commitments function.
"""

from unittest.mock import MagicMock
from use_cases.add_service_commitments import add_service_commitments  # Clean import

class MockShift:
    """Mock class for a service shift."""
    def __init__(self, shift_id, shift_start, shift_end):
        self.shift_id = shift_id
        self.shift_start = shift_start
        self.shift_end = shift_end

def test_add_service_commitment_existing_shift():
    """Test adding a service commitment for an existing shift."""
    # Create mocks
    commitments_repo = MagicMock()
    shifts_repo = MagicMock()

    # Mock existing shift
    existing_shift = MockShift("existing_shift", "10:00", "12:00")
    shifts_repo.get_shifts.return_value = [existing_shift]

    # Mock commitment object
    commitment = MagicMock()
    commitment.service_shift_id = existing_shift.shift_id
    commitment.to_dict.return_value = {"_id": "commitment_1"}

    # Call function
    result = add_service_commitments(
        commitments_repo, shifts_repo, [commitment])

    # Expected result
    assert result == [
        {"service_commitment_id": "commitment_1", "success": True}]

    # Verify insert_service_commitments was called correctly
    commitments_repo.insert_service_commitments.assert_called_once_with(
        [{"_id": "commitment_1"}])

def test_add_service_commitment_non_existing_shift():
    """Test adding a service commitment for a non-existing shift."""
    # Create mocks
    commitments_repo = MagicMock()
    shifts_repo = MagicMock()
=======
import pytest
from use_cases.add_service_commitments import add_service_commitments

@pytest.fixture
def mocked_repos():
    """Fixture to provide mocked repositories."""
    return {
        "commitments_repo": MagicMock(),
        "shifts_repo": MagicMock()
    }

def test_add_service_commitment_non_existing_shift(repos):
    """Test adding a service commitment for a non-existing shift."""
    commitments_repo = repos["commitments_repo"]
    shifts_repo = repos["shifts_repo"]

    # Mock no shifts found
    shifts_repo.get_shifts.return_value = []

    # Mock commitment object
    commitment = MagicMock()
    commitment.service_shift_id = "non_existing_shift"
    commitment.to_dict.return_value = {"_id": "None"}

    # Call function
    result = add_service_commitments(
        commitments_repo, shifts_repo, [commitment])

    # Expected result
    assert result == [{"service_commitment_id": "None", "success": True}]

    # Verify insert_service_commitments was called with the invalid commitment
    commitments_repo.insert_service_commitments.assert_called_once_with(
        [{"_id": "None"}])

def test_add_multiple_service_commitments_mixed():
    """Test adding multiple service commitments, some valid and some invalid."""
    # Create mocks
    commitments_repo = MagicMock()
    shifts_repo = MagicMock()

    # Mock existing shifts
    existing_shift_1 = MockShift("existing_shift_1", "10:00", "12:00")
    existing_shift_2 = MockShift("existing_shift_2", "13:00", "15:00")

    shifts_repo.get_shifts.return_value = [existing_shift_1, existing_shift_2]

    # Mock commitments
    commitment_1 = MagicMock()
    commitment_1.service_shift_id = existing_shift_1.shift_id
    commitment_1.to_dict.return_value = {"_id": "commitment_1"}

    commitment_2 = MagicMock()
    commitment_2.service_shift_id = "non_existing_shift"
    commitment_2.to_dict.return_value = {"_id": "None"}

    commitment_3 = MagicMock()
    commitment_3.service_shift_id = existing_shift_2.shift_id
    commitment_3.to_dict.return_value = {"_id": "commitment_3"}

    # Call function
    result = add_service_commitments(
        commitments_repo, shifts_repo,
        [commitment_1, commitment_2, commitment_3]
    )

    # Expected result
    assert result == [
        {"service_commitment_id": "commitment_1", "success": True},
        {"service_commitment_id": "None", "success": True},
        {"service_commitment_id": "commitment_3", "success": True}
    ]

    # Verify insert_service_commitments includes all commitments
    commitments_repo.insert_service_commitments.assert_called_once_with([
        {"_id": "commitment_1"},
        {"_id": "None"},
        {"_id": "commitment_3"}
    ])

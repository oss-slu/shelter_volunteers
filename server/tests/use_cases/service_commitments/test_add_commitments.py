"""
This module contains tests for the service_commitments use case, focusing on 
adding service commitments.
"""
from unittest.mock import MagicMock
import pytest
from use_cases.add_service_commitments import add_service_commitments

@pytest.fixture
def mock_repos():
    """Fixture to provide mocked repositories."""
    return {
        "commitments_repo": MagicMock(),
        "shifts_repo": MagicMock()
    }

def test_add_service_commitment_non_existing_shift(mocked_repos):
    """Test adding a service commitment for a non-existing shift."""
    commitments_repo = mocked_repos["commitments_repo"]
    shifts_repo = mocked_repos["shifts_repo"]

    # Mock no shifts found
    shifts_repo.get_shifts.return_value = []

    # Mock commitment object
    commitment = MagicMock()
    commitment.service_shift_id = "non_existing_shift"
    commitment.to_dict.return_value = {"_id": "None"}

    # Call function
    result = add_service_commitments(
        commitments_repo, shifts_repo, [commitment]
    )

    # Expected: No commitments created
    assert result == [{"service_commitment_id": "None", "success": True}]

    # Verify that the repository was called correctly
    commitments_repo.insert_service_commitments.assert_called_once_with(
        [{"_id": "None"}]
    )

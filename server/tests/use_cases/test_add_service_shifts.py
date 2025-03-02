import pytest
from datetime import datetime, timedelta
from server.use_cases.add_service_shifts import shift_add_use_case
from server.domains.service_shift import ServiceShift


class MockShiftRepository:
    """
    Mock repository to simulate database operations.
    """
    def __init__(self):
        self.shifts = []

    def check_shift_overlap(self, shelter_id, shift_start, shift_end):
        """
        Simulates checking for overlapping shifts in the database.
        """
        for shift in self.shifts:
            if shift["shelter_id"] == shelter_id and \
               max(shift["shift_start"], shift_start) < min(shift["shift_end"], shift_end):
                return True  # Overlap detected
        return False

    def add_service_shifts(self, shift_dicts):
        """
        Simulates adding shifts to the database.
        """
        self.shifts.extend(shift_dicts)


@pytest.fixture
def mock_repo():
    return MockShiftRepository()


def test_add_non_overlapping_shifts(mock_repo):
    """
    Test: Two shifts for the same shelter, no overlap.
    Expected: Both should be added.
    """
    shift1 = ServiceShift(shelter_id=1, shift_start=datetime(2025, 3, 1, 9, 0), shift_end=datetime(2025, 3, 1, 12, 0))
    shift2 = ServiceShift(shelter_id=1, shift_start=datetime(2025, 3, 1, 13, 0), shift_end=datetime(2025, 3, 1, 16, 0))

    print("\n Adding non-overlapping shifts for the same shelter...")
    result = shift_add_use_case(mock_repo, [shift1, shift2])
    print(" Result:", result)

    assert result["success"] is True
    assert len(result["service_shift_ids"]) == 2

def test_add_shifts_same_time_different_shelters(mock_repo):
    """
    Test: Two shifts at the same time but for different shelters.
    Expected: Both should be added.
    """
    shift1 = ServiceShift(shelter_id=1, shift_start=datetime(2025, 3, 2, 10, 0), shift_end=datetime(2025, 3, 2, 12, 0))
    shift2 = ServiceShift(shelter_id=2, shift_start=datetime(2025, 3, 2, 10, 0), shift_end=datetime(2025, 3, 2, 12, 0))

    print("\n Adding shifts at the same time for different shelters...")
    result = shift_add_use_case(mock_repo, [shift1, shift2])
    print(" Result:", result)

    assert result["success"] is True
    assert len(result["service_shift_ids"]) == 2
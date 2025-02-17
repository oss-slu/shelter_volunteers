"""
Tests for the add service shifts use case.
"""
from unittest import mock
from use_cases.add_service_shifts import shift_add_multiple_use_case
from domains.service_shift import ServiceShift

def test_add_repeated_shifts():
    repo = mock.Mock()
    repo.get_shifts_for_volunteer.return_value = []

    test_shift = ServiceShift(
        shelter_id=1,
        shift_name="Morning Shift",
        start_time=1000,
        end_time=2000,
        required_volunteer_count=2,
        max_volunteer_count=5,
        can_sign_up=True
    )

    responses = shift_add_multiple_use_case(repo, [test_shift.to_dict()], "volunteer@slu.edu", repeat_days=[1, 2, 3])
    
    assert len(responses) == 1
    assert "repeat_shifts" in responses[0]
    assert len(responses[0]["repeat_shifts"]) == 3

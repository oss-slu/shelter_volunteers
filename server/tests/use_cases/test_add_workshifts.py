"""
Module containing test cases for adding work shifts.
"""

import pytest
from unittest import mock

from domains.work_shift import WorkShift
from use_cases.add_workshifts import workshift_add_use_case, workshift_add_multiple_use_case

@pytest.fixture
def domain_work_shifts():
    """
    Fixture that returns mock work shifts data.
    """
    work_shift_1 = WorkShift(
        worker="volunteer@slu.edu",
        shelter="shelter-id-for-st-patric-center",
        start_time=1696168800000,
        end_time=1696179600000,
    )

    work_shift_2 = WorkShift(
        worker="volunteer2@slu.edu",
        shelter="shelter-id-for-st-patric-center",
        start_time=1696255200000,
        end_time=1696269600000,
    )

    work_shift_3 = WorkShift(
        worker="volunteer@slu.edu",
        shelter="shelter-id-for-st-patric-center",
        start_time=1701442800000,
        end_time=1701453600000,
    )

    return [work_shift_1, work_shift_2, work_shift_3]

# pylint: disable=redefined-outer-name
def test_workshift_add_use_case(domain_work_shifts):
    repo = mock.Mock()
    existing_shifts = []
    workshift_add_use_case(repo, domain_work_shifts[0], existing_shifts)
    repo.add.assert_called_with(domain_work_shifts[0].to_dict())

def test_workshift_add_multiple_use_case(domain_work_shifts):
    repo = mock.Mock()
    repo.get_shifts_for_user.return_value = []
    work_shift_dicts = [work_shift.to_dict()
                        for work_shift in domain_work_shifts]
    workshift_add_multiple_use_case(repo, work_shift_dicts)
    assert repo.add.call_count == len(domain_work_shifts)
    for work_shift_dict in work_shift_dicts:
        repo.add.assert_any_call(work_shift_dict)

def test_workshift_add_use_case_with_overlap(domain_work_shifts):
    repo = mock.Mock()
    existing_shifts = [domain_work_shifts[0]]
    overlapping_shift = WorkShift(
        worker="volunteer@slu.edu",
        shelter="shelter-id-for-st-patric-center",
        start_time=domain_work_shifts[0].start_time,
        end_time=domain_work_shifts[0].end_time + 10000,
    )

    response = workshift_add_use_case(repo, overlapping_shift, existing_shifts)
    assert response == {"success": False,
                "message": "You are signed up for another shift at this time"}
    repo.add.assert_not_called()

def test_workshift_add_multiple_use_case_with_overlap(domain_work_shifts):
    repo = mock.Mock()
    repo.get_shifts_for_user.return_value = [domain_work_shifts[0]]
    new_shifts = [
        domain_work_shifts[1].to_dict(),
        WorkShift(
            worker="volunteer3@slu.edu",
            shelter="shelter-id-for-st-patric-center",
            start_time=domain_work_shifts[0].start_time,
            end_time=domain_work_shifts[0].end_time + 10000,
        ).to_dict(),
    ]
    responses = workshift_add_multiple_use_case(repo, new_shifts)
    assert len(responses) == 2
    assert responses[0]["success"] is True
    assert responses[1]["success"] is False

def test_workshift_add_multiple_use_case_no_overlap():
    repo = mock.Mock()
    repo.get_shifts_for_user.return_value = []
    shift_1 = WorkShift(
        worker="volunteer@slu.edu",
        shelter="shelter-id-for-st-patric-center",
        start_time=1000,
        end_time=2000,
    )
    shift_2 = WorkShift(
        worker="volunteer@slu.edu",
        shelter="shelter-id-for-st-patric-center",
        start_time=2000,
        end_time=3000,
    )
    responses = workshift_add_multiple_use_case(repo,
                            [shift_1.to_dict(), shift_2.to_dict()])
    assert len(responses) == 2
    assert responses[0]["success"] is True
    assert responses[1]["success"] is True
    repo.add.assert_any_call(shift_1.to_dict())
    repo.add.assert_any_call(shift_2.to_dict())

def test_workshift_add_multiple_use_case_timestamps(domain_work_shifts):
    repo = mock.Mock()
    repo.get_shifts_for_user.return_value = []
    new_shifts = [
        domain_work_shifts[2].to_dict(),
        WorkShift(
            worker="volunteer@slu.edu",
            shelter="shelter-id-for-st-patric-center",
            start_time=1701453600000,
            end_time=1801453600000,
        ).to_dict(),
    ]
    workshift_add_multiple_use_case(repo, new_shifts)
    user_id = domain_work_shifts[2].worker
    responses = repo.get_shifts_for_user(user_id)
    assert len(responses) == 2
    assert responses[0].end_time == responses[1].start_time

# pylint: enable=redefined-outer-name

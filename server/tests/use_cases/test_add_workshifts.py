"""
This module contains the test cases for adding work shifts.
"""
import uuid
from unittest import mock
import pytest
from domains.work_shift import WorkShift
from use_cases.add_workshifts import workshift_add_use_case, workshift_add_multiple_use_case

@pytest.fixture
def domain_work_shifts_data():
    """
mock data
"""
    work_shift_1 = WorkShift(
        code = uuid.uuid4(),
        worker = "volunteer@slu.edu",
        shelter = "shelter-id-for-st-patric-center",
        start_time = 1696168800000,
        end_time = 1696179600000,
    )

    work_shift_2 = WorkShift(
        code = uuid.uuid4(),
        worker = "volunteer2@slu.edu",
        shelter = "shelter-id-for-st-patric-center",
        start_time = 1696255200000,
        end_time = 1696269600000,
    )

    work_shift_3 = WorkShift(
        code = uuid.uuid4(),
        worker = "volunteer@slu.edu",
        shelter = "shelter-id-for-st-patric-center",
        start_time = 1701442800000,
        end_time = 1701453600000,
    )

    return [work_shift_1, work_shift_2, work_shift_3]

def test_workshift_add_use_case(domain_work_shifts_data):
    """
    test case for adding workshift
    """
    repo = mock.Mock()

    workshift_add_use_case(repo, domain_work_shifts_data[0])

    repo.add.assert_called_with(domain_work_shifts_data[0])

def test_workshift_add_multiple_use_case(domain_work_shifts_data):
    """
    test case for adding multiple workshifts
    """
    repo = mock.Mock()

    workshift_add_multiple_use_case(repo, domain_work_shifts_data)

    assert repo.add.call_count == len(domain_work_shifts_data)
    repo.add.assert_any_call(domain_work_shifts_data[0])
    repo.add.assert_any_call(domain_work_shifts_data[1])
    repo.add.assert_any_call(domain_work_shifts_data[2])

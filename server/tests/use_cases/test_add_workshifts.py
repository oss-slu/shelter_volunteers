"""
Module containing test cases for adding work shifts.
"""

import pytest
import uuid
from unittest import mock

from domains.work_shift import WorkShift
from use_cases.add_workshifts import workshift_add_use_case, workshift_add_multiple_use_case

@pytest.fixture
def domain_work_shifts():
    """
    Fixture that returns mock work shifts data.
    """
    work_shift_1 = WorkShift(
        code=uuid.uuid4(),
        worker="volunteer@slu.edu",
        shelter="shelter-id-for-st-patric-center",
        start_time=1696168800000,
        end_time=1696179600000,
    )

    work_shift_2 = WorkShift(
        code=uuid.uuid4(),
        worker="volunteer2@slu.edu",
        shelter="shelter-id-for-st-patric-center",
        start_time=1696255200000,
        end_time=1696269600000,
    )

    work_shift_3 = WorkShift(
        code=uuid.uuid4(),
        worker="volunteer@slu.edu",
        shelter="shelter-id-for-st-patric-center",
        start_time=1701442800000,
        end_time=1701453600000,
    )

    return [work_shift_1, work_shift_2, work_shift_3]

# pylint: disable=redefined-outer-name
def test_workshift_add_use_case(domain_work_shifts):
    repo = mock.Mock()
    workshift_add_use_case(repo, domain_work_shifts[0])
    repo.add.assert_called_with(domain_work_shifts[0])
    repo.add.return_value = None

def test_workshift_add_multiple_use_case(domain_work_shifts):
    repo = mock.Mock()
    workshift_add_multiple_use_case(repo, domain_work_shifts)
    assert repo.add.call_count == len(domain_work_shifts)
    repo.add.assert_any_call(domain_work_shifts[0])
    repo.add.assert_any_call(domain_work_shifts[1])
    repo.add.assert_any_call(domain_work_shifts[2])
    repo.add.return_value = None
# pylint: enable=redefined-outer-name


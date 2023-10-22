"""
Tests for the delete work shifts use case.
"""

import uuid
from unittest import mock

from domains.work_shift import WorkShift
from use_cases.delete_workshifts import delete_shift_use_case, ResponseTypes

domain_shifts = [
    WorkShift(
        code=uuid.uuid4(),
        worker="volunteer@slu.edu",
        shelter="shelter-id-for-st-patric-center",
        start_time=1706168800000,
        end_time=1706179600000
        ),
    WorkShift(
        code=uuid.uuid4(),
        worker="volunteer@slu1.edu",
        shelter="shelter-id-for-st-patric-center",
        start_time=1706168800000,
        end_time=1706179600000
        )
]

def test_delete_shift_successfully():
    repo = mock.Mock()
    repo.get_by_id.return_value = domain_shifts[0]

    response = delete_shift_use_case(repo,
                                    domain_shifts[0].code,
                                    domain_shifts[0].worker)

    assert response.response_type == ResponseTypes.SUCCESS
    assert response.value == {"message": "Shift deleted successfully"}
    repo.delete.assert_called_with(domain_shifts[0].code)

def test_delete_shift_unauthorized():
    repo = mock.Mock()
    repo.get_by_id.return_value = domain_shifts[1]

    response = delete_shift_use_case(repo,
                                     domain_shifts[1].code,
                                     domain_shifts[0].worker)

    assert response.response_type == ResponseTypes.AUTHORIZATION_ERROR
    assert response.value == {
        "type": ResponseTypes.AUTHORIZATION_ERROR,
        "message": "Permission denied"
    }
    repo.delete.assert_not_called()

def test_delete_shift_not_found():
    repo = mock.Mock()
    repo.get_by_id.return_value = None

    non_existent_code = uuid.uuid4()
    response = delete_shift_use_case(repo,
                                     non_existent_code,
                                     "volunteer@slu.edu")

    assert response.response_type == ResponseTypes.NOT_FOUND
    assert response.value == {
        "type": ResponseTypes.NOT_FOUND,
        "message": "Shift not found"
    }
    repo.delete.assert_not_called()

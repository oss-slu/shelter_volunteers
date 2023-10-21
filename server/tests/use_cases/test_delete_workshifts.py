"""
This module contains tests for the delete work shift use cases.
"""

from use_cases.delete_workshifts import delete_shift_use_case, ResponseTypes
from repository.memrepo import MemRepo

domain_shifts_data = [
    {
        "code": "f853578c-fc0f-4e65-81b8-566c5dffa35a",
        "worker": "volunteer@slu.edu",
        "shelter": "shelter-id-for-st-patric-center",
        "start_time": 1696168800000,
        "end_time": 1696179600000
    },
    {
        "code": "f853578c-fc0f-4e65-81b8-566c5dffa35b",
        "worker": "volunteer@slu1.edu",
        "shelter": "shelter-id-for-st-patric-center",
        "start_time": 1706168800000,
        "end_time": 1706179600000
    }
]

def test_delete_shift_successfully():
    repo = MemRepo(domain_shifts_data)
    response = delete_shift_use_case(repo,
                                     "f853578c-fc0f-4e65-81b8-566c5dffa35a",
                                     "volunteer@slu.edu")
    assert response.response_type == ResponseTypes.SUCCESS
    assert response.value == {"message": "Shift deleted successfully"}

def test_delete_shift_unauthorized():
    repo = MemRepo(domain_shifts_data)
    response = delete_shift_use_case(repo,
                                     "f853578c-fc0f-4e65-81b8-566c5dffa35b",
                                     "volunteer@slu.edu")
    print("test_delete_shift_unauthorized response:", response.value)
    assert response.response_type == ResponseTypes.AUTHORIZATION_ERROR
    assert response.value == {"type": "AuthorizationError",
                            "message": "Permission denied"}

def test_delete_shift_not_found():
    repo = MemRepo(domain_shifts_data)
    response = delete_shift_use_case(repo,
                                     "f853578c-fc0f-4e65-81b8-566c5dffa35c",
                                     "volunteer@slu.edu")
    print("test_delete_shift_not_found response:", response.value)
    assert response.response_type == ResponseTypes.NOT_FOUND
    assert response.value == {"type": "NotFound",
                              "message": "Shift not found"}





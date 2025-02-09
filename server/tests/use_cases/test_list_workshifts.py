"""
This module contains tests for the list service shift use cases.
"""

from unittest import mock
from use_cases.list_workshifts import workshift_list_use_case
from responses import ResponseSuccess
from domains.service_shift import ServiceShift  # Updated import

domain_shifts_data = [
    {
        "_id": {
            "$oid": "f853578c-fc0f-4e65-81b8-566c5dffa35a"
        },
        "worker": "volunteer@slu.edu",
        "first_name": "SLU",
        "last_name": "Developer",
        "shelter": "shelter-id-for-st-patric-center",
        "start_time": 1696168800000,
        "end_time": 1696179600000
    },
    {
        "_id": {
            "$oid": "f853578c-fc0f-4e65-81b8-566c5dffa35b"
        },
        "worker": "volunteer2@slu.edu",
        "first_name": "SLU",
        "last_name": "Developer",
        "shelter": "shelter-id-for-st-patric-center",
        "start_time": 1696255200000,
        "end_time": 1696269600000
    },
    {
        "_id": {
            "$oid": "f853578c-fc0f-4e65-81b8-566c5dffa35a"
        },
        "worker": "volunteer@slu.edu",
        "first_name": "SLU",
        "last_name": "Developer",
        "shelter": "shelter-id-for-st-patric-center",
        "start_time": 1701442800000,
        "end_time": 1701453600000
    }
]

class Object:
    def __init__(self, filters=None):
        self.filters = filters or {}

def test_fetch_all_service_shifts_for_volunteer():
    repo = mock.Mock()
    service_shifts_for_volunteer = \
        [ServiceShift.from_dict(s) for s in domain_shifts_data
        if s["worker"] == "volunteer@slu.edu"]

    repo.list.return_value = service_shifts_for_volunteer
    request = Object()
    response = workshift_list_use_case(repo, request,
                                       "volunteer@slu.edu")
    assert isinstance(response, ResponseSuccess)
    assert len(response.value) == 2

def test_fetch_service_shifts_start_before_time():
    repo = mock.Mock()
    shifts_before_time = [ServiceShift.from_dict(s) for s in domain_shifts_data
                          if s["start_time"] < 1696255300000
                          and s["worker"] == "volunteer@slu.edu"]
    repo.list.return_value = shifts_before_time
    request = Object(filters={"start_before": 1696255300000})
    response = workshift_list_use_case(repo, request,
                                       "volunteer@slu.edu")

    assert isinstance(response, ResponseSuccess)
    assert len(response.value) == 1
    assert response.value[0].start_time < 1696255300000

def test_fetch_service_shifts_end_after_time():
    repo = mock.Mock()
    shifts_after_time = [ServiceShift.from_dict(s) for s in domain_shifts_data
                         if s["end_time"] > 1696269500000
                         and s["worker"] == "volunteer2@slu.edu"]
    repo.list.return_value = shifts_after_time
    request = Object(filters={"end_after": 1696269500000})
    response = workshift_list_use_case(repo, request,
                                       "volunteer2@slu.edu")

    assert isinstance(response, ResponseSuccess)
    assert len(response.value) == 1
    assert response.value[0].end_time > 1696269500000

def test_combined_filters():
    repo = mock.Mock()
    shifts_within_range = [ServiceShift.from_dict(s) for s in domain_shifts_data
                           if s["start_time"] < 1701453600001
                           and s["end_time"] > 1696168700000
                           and s["worker"] == "volunteer@slu.edu"]
    repo.list.return_value = shifts_within_range
    request = Object(filters={"start_before": 1701453600001,
                              "end_after": 1696168700000})
    response = workshift_list_use_case(repo, request,
                                       "volunteer@slu.edu")

    assert isinstance(response, ResponseSuccess)
    assert len(response.value) == 2
    for service_shift in response.value:
        assert service_shift.start_time < 1701453600001
        assert service_shift.end_time > 1696168700000

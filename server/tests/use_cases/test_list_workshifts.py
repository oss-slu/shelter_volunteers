"""
This module contains tests for the list work shift use cases.
"""

from unittest import mock
from use_cases.list_workshifts import workshift_list_use_case
from responses import ResponseSuccess
from domains.work_shift import WorkShift

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
        "worker": "volunteer2@slu.edu",
        "shelter": "shelter-id-for-st-patric-center",
        "start_time": 1696255200000,
        "end_time": 1696269600000
    },
    {
        "code": "f853578c-fc0f-4e65-81b8-566c5dffa35a",
        "worker": "volunteer@slu.edu",
        "shelter": "shelter-id-for-st-patric-center",
        "start_time": 1701442800000,
        "end_time": 1701453600000
    }
]

class Object:
    def __init__(self, filters=None):
        self.filters = filters or {}

def test_fetch_all_workshifts_for_volunteer():
    repo = mock.Mock()
    workshifts_for_volunteer = \
        [WorkShift.from_dict(s) for s in domain_shifts_data
        if s["worker"] == "volunteer@slu.edu"]

    repo.list.return_value = workshifts_for_volunteer
    request = Object()
    response = workshift_list_use_case(repo, request,
                                       "volunteer@slu.edu")
    assert isinstance(response, ResponseSuccess)
    assert len(response.value) == 2

def test_fetch_workshifts_start_before_time():
    repo = mock.Mock()
    shifts_before_time = [WorkShift.from_dict(s) for s in domain_shifts_data
                          if s["start_time"] < 1696255300000
                          and s["worker"] == "volunteer@slu.edu"]
    repo.list.return_value = shifts_before_time
    request = Object(filters={"start_before": 1696255300000})
    response = workshift_list_use_case(repo, request,
                                       "volunteer@slu.edu")

    assert isinstance(response, ResponseSuccess)
    assert len(response.value) == 1
    assert response.value[0].start_time < 1696255300000

def test_fetch_workshifts_end_after_time():
    repo = mock.Mock()
    shifts_after_time = [WorkShift.from_dict(s) for s in domain_shifts_data
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
    shifts_within_range = [WorkShift.from_dict(s) for s in domain_shifts_data
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
    for workshift in response.value:
        assert workshift.start_time < 1701453600001
        assert workshift.end_time > 1696168700000

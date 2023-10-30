"""
This module contains tests for the count volunteers use case
"""

from unittest import mock
from use_cases.count_volunteers import count_volunteers_use_case
from domains.work_shift import WorkShift
from domains.staffing import Staffing

class Object:
    def __init__(self, filters=None):
        self.filters = filters or {}

def test_nonoverlapping_shifts():
    repo = mock.Mock()
    shifts_data = [
        {
            "code": "1",
            "worker": "volunteer@slu.edu",
            "shelter": 1,
            "start_time": 1,
            "end_time": 2
        },
        {
            "code": "2",
            "worker": "volunteer@slu.edu",
            "shelter": 1,
            "start_time": 2,
            "end_time": 3
        }
    ]

    shifts = [WorkShift.from_dict(s) for s in shifts_data]
    repo.list.return_value = shifts
    request = Object(filters={"start_after":1, "end_before":2})
    response = count_volunteers_use_case(repo, request, 1)
    assert len(response.value) == 2
    expected = [{"start_time":1, "end_time":2, "count":1},
                {"start_time":2, "end_time":3, "count":1}]
    for i, value in enumerate(response.value):
        staff = Staffing.from_dict(expected[i])
        assert value.start_time == staff.start_time
        assert value.end_time == staff.end_time
        assert value.count == staff.count

def test_identical_shifts():
    repo = mock.Mock()
    shifts_data = [
        {
            "code": "1",
            "worker": "volunteer@slu.edu",
            "shelter": 1,
            "start_time": 1,
            "end_time": 2
        },
        {
            "code": "2",
            "worker": "volunteer2@slu.edu",
            "shelter": 1,
            "start_time": 1,
            "end_time": 2
        }
    ]

    shifts = [WorkShift.from_dict(s) for s in shifts_data]
    repo.list.return_value = shifts
    request = Object(filters={"start_after":1, "end_before":2})
    response = count_volunteers_use_case(repo, request, 1)
    assert len(response.value) == 1
    expected = [{"start_time":1, "end_time":2, "count":2}]
    for i, value in enumerate(response.value):
        staff = Staffing.from_dict(expected[i])
        assert value.start_time == staff.start_time
        assert value.end_time == staff.end_time
        assert value.count == staff.count

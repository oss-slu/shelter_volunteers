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

def compare(expected_staff, shifts_data, request):
    shifts = [WorkShift.from_dict(s) for s in shifts_data]
    repo = mock.Mock()
    repo.list.return_value = shifts
    response = count_volunteers_use_case(repo, request, 1)

    assert len(response.value) == len(expected_staff)
    for i, value in enumerate(response.value):
        staff = Staffing.from_dict(expected_staff[i])
        assert value.start_time == staff.start_time
        assert value.end_time == staff.end_time
        assert value.count == staff.count


def test_nonoverlapping_shifts():
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

    request = Object(filters={"start_after":1, "end_before":2})
    expected = [{"start_time":1, "end_time":2, "count":1},
                {"start_time":2, "end_time":3, "count":1}]
    compare(expected, shifts_data, request)

def test_identical_shifts():
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

    request = Object(filters={"start_after":1, "end_before":2})
    expected = [{"start_time":1, "end_time":2, "count":2}]
    compare(expected, shifts_data, request)

# XY....X....Y
def test_overlapping_shifts():
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
            "start_time": 1,
            "end_time": 3
        }
    ]

    request = Object(filters={"start_after":1, "end_before":2})
    expected = [{"start_time":1, "end_time":2, "count":2},
                {"start_time":2, "end_time":3, "count":1}]
    compare(expected, shifts_data, request)

# X....Y....X....Y
def test_overlapping2_shifts():
    shifts_data = [
        {
            "code": "1",
            "worker": "volunteer@slu.edu",
            "shelter": 1,
            "start_time": 1,
            "end_time": 3
        },
        {
            "code": "2",
            "worker": "volunteer@slu.edu",
            "shelter": 1,
            "start_time": 2,
            "end_time": 4
        }
    ]

    request = Object(filters={"start_after":1, "end_before":4})
    expected = [{"start_time":1, "end_time":2, "count":1},
                {"start_time":2, "end_time":3, "count":2},
                {"start_time":3, "end_time":4, "count":1}]
    compare(expected, shifts_data, request)

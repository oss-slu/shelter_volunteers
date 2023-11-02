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

#
# request  1...............3
# ---------------------------
# timeline 1.......2.......3
# ---------------------------
# shift 1: |.......|
# shift 2:         |.......|
# ---------------------------
# result:  | 1     | 1     |
#
def test_nonoverlapping_shifts():
    shifts_data = [
        {
            "code": "1",
            "worker": "volunteer1@slu.edu",
            "shelter": 1,
            "start_time": 1,
            "end_time": 2
        },
        {
            "code": "2",
            "worker": "volunteer2@slu.edu",
            "shelter": 1,
            "start_time": 2,
            "end_time": 3
        }
    ]

    request = Object(filters={"start_after":1, "end_before":3})
    expected = [{"start_time":1, "end_time":2, "count":1},
                {"start_time":2, "end_time":3, "count":1}]
    compare(expected, shifts_data, request)

#
# request  1.......2
# ---------------------------
# timeline 1.......2
# ---------------------------
# shift 1: |.......|
# shift 2: |.......|
# ---------------------------
# result:  | 2     |
#
def test_identical_shifts():
    shifts_data = [
        {
            "code": "1",
            "worker": "volunteer1@slu.edu",
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

# request  1...............3
# ---------------------------
# timeline 1.......2.......3
# ---------------------------
# shift 1: |.......|
# shift 2: |...............|
# ---------------------------
# result:  | 2     | 1     |
#
def test_overlapping_shifts():
    shifts_data = [
        {
            "code": "1",
            "worker": "volunteer1@slu.edu",
            "shelter": 1,
            "start_time": 1,
            "end_time": 2
        },
        {
            "code": "2",
            "worker": "volunteer2@slu.edu",
            "shelter": 1,
            "start_time": 1,
            "end_time": 3
        }
    ]

    request = Object(filters={"start_after":1, "end_before":3})
    expected = [{"start_time":1, "end_time":2, "count":2},
                {"start_time":2, "end_time":3, "count":1}]
    compare(expected, shifts_data, request)

# request  1.......................4
# -----------------------------------
# timeline 1.......2.......3.......4
# -----------------------------------
# shift 1: |...............|
# shift 2:         |...............|
# -----------------------------------
# result:  | 1     | 2     | 1     |
#
def test_overlapping2_shifts():
    shifts_data = [
        {
            "code": "1",
            "worker": "volunteer1@slu.edu",
            "shelter": 1,
            "start_time": 1,
            "end_time": 3
        },
        {
            "code": "2",
            "worker": "volunteer2@slu.edu",
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

# request  1.......................4
# -----------------------------------
# timeline 1.......2.......3.......4
# -----------------------------------
# shift 1: |.......................|
# shift 2:         |.......|
# -----------------------------------
# result:  | 1     | 2     | 1     |
#
def test_overlapping3_shifts():
    shifts_data = [
        {
            "code": "1",
            "worker": "volunteer1@slu.edu",
            "shelter": 1,
            "start_time": 1,
            "end_time": 4
        },
        {
            "code": "2",
            "worker": "volunteer2@slu.edu",
            "shelter": 1,
            "start_time": 2,
            "end_time": 3
        }
    ]

    request = Object(filters={"start_after":1, "end_before":4})
    expected = [{"start_time":1, "end_time":2, "count":1},
                {"start_time":2, "end_time":3, "count":2},
                {"start_time":3, "end_time":4, "count":1}]
    compare(expected, shifts_data, request)

# request  1.......................4
# -----------------------------------
# timeline 1.......2.......3.......4
# -----------------------------------
# shift 1: |.......................|
# shift 2:         |...............|
# -----------------------------------
# result:  | 1     | 2             |
#
def test_overlapping4_shifts():
    shifts_data = [
        {
            "code": "1",
            "worker": "volunteer1@slu.edu",
            "shelter": 1,
            "start_time": 1,
            "end_time": 4
        },
        {
            "code": "2",
            "worker": "volunteer2@slu.edu",
            "shelter": 1,
            "start_time": 2,
            "end_time": 4
        }
    ]

    request = Object(filters={"start_after":1, "end_before":4})
    expected = [{"start_time":1, "end_time":2, "count":1},
                {"start_time":2, "end_time":4, "count":2}]
    compare(expected, shifts_data, request)

# request  1.......................................6
# ---------------------------------------------------
# timeline 1.......2.......3.......4.......5.......6
# ---------------------------------------------------
# shift 1: |.......................|
# shift 2:         |.......................|
# shift 3:                 |.......................|
# ---------------------------------------------------
# result:  | 1     | 2     | 3     | 2     | 1     |
#
def test_many_overlapping_shifts():
    shifts_data = [
        {
            "code": "1",
            "worker": "volunteer1@slu.edu",
            "shelter": 1,
            "start_time": 1,
            "end_time": 4
        },
        {
            "code": "2",
            "worker": "volunteer2@slu.edu",
            "shelter": 1,
            "start_time": 2,
            "end_time": 5
        },
        {
            "code": "3",
            "worker": "volunteer3@slu.edu",
            "shelter": 1,
            "start_time": 3,
            "end_time": 6
        }

    ]

    request = Object(filters={"start_after":1, "end_before":6})
    expected = [{"start_time":1, "end_time":2, "count":1},
                {"start_time":2, "end_time":3, "count":2},
                {"start_time":3, "end_time":4, "count":3},
                {"start_time":4, "end_time":5, "count":2},
                {"start_time":5, "end_time":6, "count":1}]

    compare(expected, shifts_data, request)

#
# request  1.......................................6
# ---------------------------------------------------
# timeline 1.......2.......3.......4.......5.......6
# ---------------------------------------------------
# shift 1: |.......................................|
# shift 2:         |.......................|
# shift 3:                 |.......|
# ---------------------------------------------------
# result:  | 1     | 2     | 3     | 2     | 1     |
#
def test_many_overlapping2_shifts():
    shifts_data = [
        {
            "code": "3",
            "worker": "volunteer3@slu.edu",
            "shelter": 1,
            "start_time": 3,
            "end_time": 4
        },
        {
            "code": "1",
            "worker": "volunteer1@slu.edu",
            "shelter": 1,
            "start_time": 1,
            "end_time": 6
        },
        {
            "code": "2",
            "worker": "volunteer2@slu.edu",
            "shelter": 1,
            "start_time": 2,
            "end_time": 5
        }
    ]

    request = Object(filters={"start_after":1, "end_before":6})
    expected = [{"start_time":1, "end_time":2, "count":1},
                {"start_time":2, "end_time":3, "count":2},
                {"start_time":3, "end_time":4, "count":3},
                {"start_time":4, "end_time":5, "count":2},
                {"start_time":5, "end_time":6, "count":1}]

    compare(expected, shifts_data, request)

#
# request  1.......................................6
# ---------------------------------------------------
# timeline 1.......2.......3.......4.......5.......6
# ---------------------------------------------------
# shift 1: |.......................................|
# shift 2:                 |...............|
# shift 3:         |...............|
# ---------------------------------------------------
# result:  | 1     | 2     | 3     | 2     | 1     |
#
def test_many_overlapping3_shifts():
    shifts_data = [
        {
            "code": "3",
            "worker": "volunteer3@slu.edu",
            "shelter": 1,
            "start_time": 2,
            "end_time": 4
        },
        {
            "code": "1",
            "worker": "volunteer1@slu.edu",
            "shelter": 1,
            "start_time": 1,
            "end_time": 6
        },
        {
            "code": "2",
            "worker": "volunteer2@slu.edu",
            "shelter": 1,
            "start_time": 3,
            "end_time": 5
        }
    ]

    request = Object(filters={"start_after":1, "end_before":6})
    expected = [{"start_time":1, "end_time":2, "count":1},
                {"start_time":2, "end_time":3, "count":2},
                {"start_time":3, "end_time":4, "count":3},
                {"start_time":4, "end_time":5, "count":2},
                {"start_time":5, "end_time":6, "count":1}]

    compare(expected, shifts_data, request)

#
# request  1.......................................6
# ---------------------------------------------------
# timeline 1.......2.......3.......4.......5.......6
# ---------------------------------------------------
# shift 1: |.......................|
# shift 2:         |...............................|
# shift 3:                 |...............|
# ---------------------------------------------------
# result:  | 1     | 2     | 3     | 2     | 1     |
#
def test_many_overlapping4_shifts():
    shifts_data = [
        {
            "code": "3",
            "worker": "volunteer3@slu.edu",
            "shelter": 1,
            "start_time": 3,
            "end_time": 5
        },
        {
            "code": "1",
            "worker": "volunteer1@slu.edu",
            "shelter": 1,
            "start_time": 1,
            "end_time": 4
        },
        {
            "code": "2",
            "worker": "volunteer2@slu.edu",
            "shelter": 1,
            "start_time": 2,
            "end_time": 6
        }
    ]

    request = Object(filters={"start_after":1, "end_before":6})
    expected = [{"start_time":1, "end_time":2, "count":1},
                {"start_time":2, "end_time":3, "count":2},
                {"start_time":3, "end_time":4, "count":3},
                {"start_time":4, "end_time":5, "count":2},
                {"start_time":5, "end_time":6, "count":1}]

    compare(expected, shifts_data, request)
#
# request  1.......................4
# --------------------------------------------------
# timeline 1.......2.......3.......4.......5.......6
# --------------------------------------------------
# shift 1: |.......................................|
# --------------------------------------------------
# result:  | 1                     |
#
def test_workers_in_range():
    shifts_data = [
       {
            "code": "1",
            "worker": "volunteer1@slu.edu",
            "shelter": 1,
            "start_time": 1,
            "end_time": 6
        }
    ]

    request = Object(filters={"start_after":1, "end_before":4})
    expected = [{"start_time":1, "end_time":4, "count":1}]

    compare(expected, shifts_data, request)

#
# request          2...............4
# ---------------------------------------------------
# timeline 1.......2.......3.......4.......5.......6
# ---------------------------------------------------
# shift 1: |.......................................|
# shift 2:         |.......................|
# shift 3:                 |.......|
# ---------------------------------------------------
# result:          | 2     | 3     |
#
def test_workers_in_range_overlap():
    shifts_data = [
       {
            "code": "1",
            "worker": "volunteer1@slu.edu",
            "shelter": 1,
            "start_time": 1,
            "end_time": 6
       },
       {
            "code": "2",
            "worker": "volunteer2@slu.edu",
            "shelter": 1,
            "start_time": 2,
            "end_time": 5
       },
       {
            "code": "3",
            "worker": "volunteer3@slu.edu",
            "shelter": 1,
            "start_time": 3,
            "end_time": 4
       },
    ]
    request = Object(filters={"start_after":2, "end_before":4})
    expected = [{"start_time":2, "end_time":3, "count":2},
                {"start_time":3, "end_time":4, "count":3}]

    compare(expected, shifts_data, request)

#
# request          2...............4
# -----------------------------------
# timeline 1.......2.......3.......4
# -----------------------------------
# shift 1: |.......|
# -----------------------------------
# result:         (empty list)
#
def test_no_workers_in_range():
    shifts_data = [
       {
            "code": "1",
            "worker": "volunteer1@slu.edu",
            "shelter": 1,
            "start_time": 1,
            "end_time": 2
       }
    ]
    request = Object(filters={"start_after":2, "end_before":4})
    expected = []
    compare(expected, shifts_data, request)

#
# request          2.......3
# -----------------------------------
# timeline 1.......2.......3.......4
# -----------------------------------
# shift 1:                 |.......|
# -----------------------------------
# result:         (empty list)
#
def test_no_workers_in_range2():
    shifts_data = [
       {
            "code": "1",
            "worker": "volunteer1@slu.edu",
            "shelter": 1,
            "start_time": 3,
            "end_time": 4
       }
    ]
    request = Object(filters={"start_after":2, "end_before":3})
    expected = []
    compare(expected, shifts_data, request)


#
# request          2...............4
# --------------------------------------
# timeline 1.......2.......3.......4
# --------------------------------------
# no shifts are present in the database
# --------------------------------------
# result:         (empty list)
#
def test_no_workers():
    shifts_data = []
    request = Object(filters={"start_after":2, "end_before":4})
    expected = []
    compare(expected, shifts_data, request)

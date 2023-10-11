"""
This module is for in-memory repository implementation.
"""
from domains.work_shift import WorkShift


class MemRepo:
    """
    An in-memory repository for storing work shifts.
    """

    def __init__(self, data):
        """
        Initialize the repo with passed data.
        """
        self.data = data

    def list(self, user, filters=None):
        """
        Return a list of WorkShift objects based on the data.
        """
        shifts = [WorkShift.from_dict(i) for i in self.data if \
                  WorkShift.from_dict(i).worker == user]
        if filters is None:
            return shifts

        if "start_before" in filters:
            shifts = [
                shift for shift in shifts if \
                shift.start_time < filters["start_before"]
            ]
        if "start_after" in filters:
            shifts = [
                shift for shift in shifts if \
                shift.start_time >=filters["start_after"]
            ]
        if "end_before" in filters:
            shifts = [
                shift for shift in shifts if \
                shift.end_time < filters["end_before"]
            ]
        if "end_after" in filters:
            shifts = [
                shift for shift in shifts if \
                shift.end_time >= filters["end_after"]
            ]
        return shifts

    def add(self, work_shift):
        """
        Add a WorkShift object to the data.
        """
        self.data.append(work_shift)

    def get_by_id(self, shift_id):
        for item in self.data:
            if item["code"] == shift_id:
                return WorkShift.from_dict(item)
        return None

    def delete(self, shift_id):
        for item in self.data:
            if item["code"] == shift_id:
                self.data.remove(item)
                return
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

    def list(self):
        """
        Return a list of WorkShift objects based on the data.
        """
        return [WorkShift.from_dict(i) for i in self.data]

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

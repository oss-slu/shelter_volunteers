"""
This module is for in-memory repository implementation.
"""
from domains.service_shift import ServiceShift


class MemRepo:
    """
    An in-memory repository for storing service shifts.
    """

    def __init__(self, data):
        """
        Initialize the repo with passed data.
        """
        self.data = data

    def list(self, user=None, shelter=None):
        """
        Return a list of ServiceShift objects based on the data.
        """
        shifts = [ServiceShift.from_dict(i) for i in self.data if \
                  (user is None or i["worker"] == user) and \
                  (shelter is None or i["shelter"].shelter == shelter)]
        return shifts

    def add(self, service_shift):
        """
        Add a ServiceShift object to the data.
        """
        self.data.append(service_shift)

    def get_by_id(self, shift_id):
        for item in self.data:
            if item["_id"] == shift_id:
                return ServiceShift.from_dict(item)
        return None

    def delete(self, shift_id):
        for item in self.data:
            if item["_id"] == shift_id:
                self.data.remove(item)
                return

    # This is for the new use case of a volunteer deleting a shift
    def delete_shift_use_case(self, shift_id, user_id):
        for item in self.data:
            if shift_id in item["signed_up_shifts"] and item["id"] == user_id:
                item["signed_up_shifts"].remove(shift_id)
                return

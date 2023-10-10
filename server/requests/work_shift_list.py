"""
This module builds a valid and an invalid request object
for the list_work_shift use case
"""
from collections.abc import Mapping


class WorkShiftListInvalidRequest:
    def __init__(self):
        self.errors = []

    def add_error(self, parameter, message):
        self.errors.append({"parameter": parameter, "message": message})

    def has_errors(self):
        return len(self.errors) > 0

    def __bool__(self):
        return False


class WorkShiftListValidRequest:
    def __init__(self, filters=None):
        self.filters = filters

    def __bool__(self):
        return True


def build_work_shift_list_request(filters=None):
    accepted_filters = [
        "start_after", "start_before", "end_after", "end_before"
    ]
    invalid_req = WorkShiftListInvalidRequest()

    converted_filters = {}

    if filters is not None:
        if not isinstance(filters, Mapping):
            invalid_req.add_error("filters", "Is not iterable")
            return invalid_req

        for key, value in filters.items():
            if key not in accepted_filters:
                invalid_req.add_error(
                    "filters", f"Key {key} cannot be used"
                )
            try:
                converted_filters[key] = int(value)
            except ValueError:
                invalid_req.add_error(
                    "filters", f"Value of {key} must be an integer"
                )
        if invalid_req.has_errors():
            return invalid_req

    return WorkShiftListValidRequest(filters=converted_filters)

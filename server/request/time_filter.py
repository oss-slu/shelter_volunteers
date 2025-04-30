from collections.abc import Mapping
class TimeFilter:
    """
    Request object passed to the list_service_commitments use case.
    """
    def __init__(self, filters=None):
        self.filters = filters

    def __bool__(self):
        return True
    def get_filters(self):
        return self.filters
    def get_filter(self, key):
        return self.filters.get(key) if self.filters else None
    
def build_time_filter(filters=None):
    """
    Build a TimeFilter object.

    Args:
        filters (dict): Optional filters for the request.

    Returns:
        TimeFilter: The constructed time filter object.
    """
    accepted_filters = [
        "start_after", "start_before"
    ]
    converted_filters = {}
    if filters is not None:
        if not isinstance(filters, Mapping):
            raise (
                TypeError("filters must be an iterable")
            )

        for key, value in filters.items():
            if key not in accepted_filters:
                raise (
                    KeyError(f"Key {key} cannot be used")
                )
            try:
                converted_filters[key] = int(value)
            except ValueError:
                raise (
                    ValueError("filters", f"Value of {key} must be an integer")
                )

    return TimeFilter(filters=converted_filters)
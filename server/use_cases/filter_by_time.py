"""
This module contains functions that apply time based filtering
to shifts data
"""
def apply_time_filters(shifts, filters):
    """
    Returns shifts that match the given filters
    """
    if "start_before" in filters:
        shifts = [
            shift for shift in shifts if \
            shift.start_time <= filters["start_before"]
        ]
    if "start_after" in filters:
        shifts = [
            shift for shift in shifts if \
            shift.start_time >=filters["start_after"]
        ]
    if "end_before" in filters:
        shifts = [
            shift for shift in shifts if \
            shift.end_time <= filters["end_before"]
        ]
    if "end_after" in filters:
        shifts = [
            shift for shift in shifts if \
            shift.end_time >= filters["end_after"]
        ]
    return shifts

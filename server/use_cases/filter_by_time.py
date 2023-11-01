"""
This module contains functions that apply time based filtering
to filtered_shifts data
"""
def apply_time_filters(shifts, filters):
    """
    Returns filtered_shifts that match the given filters
    """
    filtered_shifts = shifts.copy()
    if "start_before" in filters:
        filtered_shifts = [
            shift for shift in filtered_shifts if \
            shift.start_time <= filters["start_before"]
        ]
    if "start_after" in filters:
        filtered_shifts = [
            shift for shift in filtered_shifts if \
            shift.start_time >=filters["start_after"]
        ]
    if "end_before" in filters:
        filtered_shifts = [
            shift for shift in filtered_shifts if \
            shift.end_time <= filters["end_before"]
        ]
    if "end_after" in filters:
        filtered_shifts = [
            shift for shift in filtered_shifts if \
            shift.end_time >= filters["end_after"]
        ]
    return filtered_shifts

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

def get_shifts_between(shifts, start_time, end_time):
    """
    Returns shifts from the given list that are strictly between the given start
    and end times. Adjust the start and end times of a given shift to be within
    the required range, if needed.
    """
    time_filter = {"end_before":end_time,
                   "end_after":start_time}
    filtered_shifts = apply_time_filters(shifts, time_filter)

    time_filter = {"start_before":end_time,
                   "start_after":start_time}
    filtered_shifts = filtered_shifts+apply_time_filters(shifts, time_filter)

    time_filter = {"start_before":start_time,
                   "end_after":end_time}
    filtered_shifts = filtered_shifts+apply_time_filters(shifts, time_filter)


    # remove duplicate shifts that may have resulted from applying the
    # filtering twice and merging the results
    filtered_shifts = [obj for i, obj in enumerate(filtered_shifts) \
            if obj not in filtered_shifts[:i]]

    # adjust start and end time, if needed
    for shift in filtered_shifts:
        if shift.start_time < start_time:
            shift.start_time = start_time
        if shift.end_time > end_time:
            shift.end_time = end_time

    # After our time adjustments, it's possible to have a shift
    # that starts and ends at the same time. We don't want to keep those
    filtered_shifts = [obj for obj in filtered_shifts \
            if obj.start_time != obj.end_time]

    return filtered_shifts

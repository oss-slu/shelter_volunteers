"""
This module contains the use case for counting volunteers.
"""
from responses import ResponseSuccess, ResponseFailure, ResponseTypes
from use_cases.filter_by_time import apply_time_filters
from domains.staffing import Staffing

def count_volunteers_use_case(repo, request, shelter):
    """
    Calculates unique time intervals with number of volunteers signed up to
    work during those time intervals, for a given shelter and a given
    gime period. The time period is defined as request.filters
    """

    # retrieve all the shifts for a given shelter
    all_shifts = repo.list(user=None, shelter=shelter)

    # filter the shifts: only keep those that overlap
    # our time interval of interest
    if not "start_after" in request.filters or \
       not "end_before" in request.filters:
       return ResponseFailure(ResponseTypes.PARAMETER_ERROR,
               "start_after and end_before values are required")

    time_filter = {"end_before":request.filters["end_before"],
                   "end_after":request.filters["start_after"]}
    shifts = apply_time_filters(all_shifts, time_filter)
    time_filter = {"start_before":request.filters["end_before"],
                   "start_after":request.filters["start_after"]}
    shifts = shifts+apply_time_filters(all_shifts, time_filter)
    time_filter = {"start_before":request.filters["start_after"],
                   "end_after":request.filters["end_before"]}
    shifts = shifts+apply_time_filters(all_shifts, time_filter)


    # remove duplicate shifts that may have resulted from applying the
    # filtering twice and merging the results
    shifts = [obj for i, obj in enumerate(all_shifts) \
              if obj not in all_shifts[:i]]

    # calculate unique time intervals with worker counts
    # workers is a list of Staffing objects that may have non-unique
    # time intervals
    workers = make_staffing_from_shifts(shifts)
    # workforce Staffing objects with only unique time intervals
    workforce = []

    # Algorithm:
    # Always keep the workers list sorted: first by start time, then by end time
    # Repeat until workers list is empty:
    #   Insert the first Staffing object from workers to workforce,
    #   possibly dividing a Staffing object in workforce into multiple
    #   (slicing the time interval)
    #   If new Staffing objects are created in the process, they get added to
    #   the workers list.
    # In the comments below, S is a staffing object from the workforce list,
    # and W is a staffing object from the workers list.
    while len(workers) > 0:
        workers.sort(key=lambda worker:(worker.start_time, worker.end_time))
        worker = workers.pop(0)
        # terminate the loop if our remaining workers start after the
        # requested end time
        if worker.start_time > request.filters["end_before"]:
            break

        # adjust worker start and end time to the requested range
        if worker.start_time < request.filters["start_after"]:
            worker.start_time = request.filters["start_after"]
        if worker.end_time > request.filters["end_before"]:
            worker.end_time = request.filters["end_before"]

        found = False
        for i, staff in enumerate(workforce):
            if worker.start_time == staff.start_time:
                found = True
                staff.count+=worker.count
                # SW____WS
                # SW_____S___W
                if not worker.end_time == staff.end_time:
                    workers.append(Staffing.from_dict({
                                        "start_time":staff.end_time, 
                                        "end_time":worker.end_time,
                                        "count":worker.count
                                    }))
            elif worker.end_time < staff.end_time:
                found = True
                # S__W__W__S
                insert_staff1 = Staffing.from_dict(
                                    {"start_time":worker.start_time,
                                     "end_time":worker.end_time,
                                     "count":staff.count+worker.count}
                                )
                insert_staff2 = Staffing.from_dict(
                                    {"start_time":worker.end_time,
                                     "end_time":staff.end_time,
                                     "count":staff.count}
                                )
                staff.end_time = worker.start_time
                workers.append(insert_staff1)
                workers.append(insert_staff2)
            elif worker.start_time < staff.end_time:
                # S___W___WS or S___W____S____W
                found = True
                move_to_workers = workforce[i+1:]
                workforce[i+1:]=[]
                workers.extend(move_to_workers)

                workers.append(Staffing.from_dict(
                                    {"start_time":worker.start_time,
                                     "end_time":staff.end_time,
                                     "count":staff.count+worker.count})
                              )

                if not worker.end_time == staff.end_time:
                    workers.append(Staffing.from_dict(
                                    {"start_time":staff.end_time,
                                     "end_time":worker.end_time,
                                     "count":worker.count}
                                   ))
                staff.end_time = worker.start_time
            if found:
                break

        if not found:
            # S_____S_W____W
            workforce.append(worker)

    return ResponseSuccess(workforce)


def make_staffing_from_shifts(shifts):
    """
    Converts WorkShift objects to Staffing objects, with the same 
    time interval and count 1
    """
    workers = []
    for shift in shifts:
        workers.append(Staffing.from_dict({"start_time":shift.start_time,
                                             "end_time":shift.end_time,
                                             "count":1}))
    return workers


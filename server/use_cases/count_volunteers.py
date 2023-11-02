"""
This module contains the use case for counting volunteers.
"""
from responses import ResponseSuccess, ResponseFailure, ResponseTypes
from use_cases.filter_by_time import get_shifts_between
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

    shifts = get_shifts_between(
        all_shifts,
        request.filters["start_after"],
        request.filters["end_before"])

    # Calculate non-overlapping time intervals with worker counts
    # workers is a list of Staffing objects that may have overlapping
    # time intervals
    workers = make_staffing_from_shifts(shifts)
    # workforce Staffing objects with non-overlapping time intervals
    workforce = []

    # Algorithm Overview: only non-overlapping time intervals with worker counts
    # will be inserted into the workforce list. We will process Staffing objects
    # from the workers list one at a time. If a Staffing object we are processing
    # does not overlap with the current workforce, we simply insert it into the
    # workforce. If a Staffing object results in an overlap, we will split that
    # Staffing object into multiple ones, adjust volunteer counts in the existing
    # workforce and insert new resulting Staffing objects back into our workers list
    # to be processed later.
    #
    # Algorithm:
    # Always keep the workers list sorted: first by start time, then by end time
    # Repeat until workers list is empty:
    #   Insert the first Staffing object from workers to workforce,
    #   possibly dividing a Staffing object in workforce into multiple
    #   (slicing the time interval)
    #   If new Staffing objects are created in the process, they get added to
    #   the workers list.
    # In the comments below, s is the number of volunteers from the staff (Staffing
    # object from the workforce list), and w is the number of volunteers from the worker
    # (Staffing object from the workers list)
    while len(workers) > 0:
        # always keep the workers sorted by start time, then end time
        workers.sort(key=lambda worker:(worker.start_time, worker.end_time))
        worker = workers.pop(0)

        found = False
        for i, staff in enumerate(workforce):
            # If staff and worker have the same starting time,
            # then we can merge worker volunteer counts with staff
            # volunteer count
            # Case 1:
            #   staff:  |______|
            #   worker: |______|
            #   result: |  s+w |
            # Case 2:
            #   staff:  |______|
            #   worker: |___________|
            #   resutl: |s+w   | w  |
            if worker.start_time == staff.start_time:
                found = True
                staff.count+=worker.count
                # if worker and staff have different end time, we know
                # that worker end time must be after staff end time
                # as shown in case 2 comment. This is because all workers
                # were sorted by first start time, then end time. Workers 
                # are added to workforce in that sorted order (staff is an 
                # object from the workforce list)
                # In this case, we'll create a new Staffing object, to account
                # for the volunteer count during non-overlapping time.
                if not worker.end_time == staff.end_time:
                    workers.append(Staffing.from_dict({
                                        "start_time":staff.end_time, 
                                        "end_time":worker.end_time,
                                        "count":worker.count
                                    }))
            # since all staff were sorted by start time, then end time,
            # we know that worker start time cannot be before staff start time
            # if worker end time is before staff end time and their start times
            # are not the same, we must have the following
            # staff:  |_________|
            # worker:    |___|
            # result: |s |s+w| s|
            elif worker.end_time < staff.end_time:
                found = True
                insert_staff1 = Staffing.from_dict(
                    {"start_time":worker.start_time,
                     "end_time":worker.end_time,
                     "count":staff.count+worker.count})

                insert_staff2 = Staffing.from_dict(
                                    {"start_time":worker.end_time,
                                     "end_time":staff.end_time,
                                     "count":staff.count}
                                )
                staff.end_time = worker.start_time
                workers.append(insert_staff1)
                workers.append(insert_staff2)

            # if worker starts before staff ends, we have one of the following cases
            # Case 1:
            #   staff:  |__________|
            #   worker:    |_______|
            #   result: |s | s+w   |
            # Case 2:
            #   staff:  |_________|
            #   worker:     |__________|
            #   result: |s  |s+w  | w  |
            elif worker.start_time < staff.end_time:
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

        # if none of the previous cases matched, we can append the worker
        # to our workforce, because it has no overlap
        # staff:  |______|
        # worker:          |___________|
        # result: | s    | | w         |
        if not found:
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


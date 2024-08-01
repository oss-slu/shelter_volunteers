"""
This module contains the use case for counting volunteers and getting the volunteer list.
"""
from responses import ResponseSuccess, ResponseFailure, ResponseTypes
from use_cases.filter_by_time import get_shifts_between
from domains.volunteer import Volunteer

def get_volunteers_use_case(repo, request, shelter):
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
    # workers is a list of Volunteer objects that may have overlapping
    # time intervals
    workers = make_staffing_from_shifts(shifts)
    # workforce Volunteer objects with non-overlapping time intervals
    workforce = []

    # Algorithm Overview: only non-overlapping time intervals with worker counts
    # will be inserted into the workforce list. We will process Volunteer objects
    # from the workers list one at a time. If a Volunteer object we are
    # processing does not overlap with the current workforce, we simply insert
    # workforce. If a Volunteer object results in an overlap, we will split that
    # it into the Volunteer object into multiple ones, adjust volunteer counts in
    # the existing workforce and insert new resulting Volunteer objects back into
    # our workers list to be processed later.
    #
    # Algorithm:
    # Always keep the workers list sorted: first by start time, then by end time
    # Repeat until workers list is empty:
    #   Insert the first Volunteer object from workers to workforce,
    #   possibly dividing a Volunteer object in workforce into multiple
    #   (slicing the time interval)
    #   If new Volunteer objects are created in the process, they get added to
    #   the workers list.
    # In the comments below, s is the number of volunteers from the staff
    # (Volunteer object from the workforce list), and w is the number of
    # volunteers from the worker (Volunteer object from the workers list)
    while len(workers) > 0:
        # always keep the workers sorted by start time, then end time
        workers.sort(key=lambda worker:(worker.start_time, worker.end_time))
        worker = workers.pop(0)

        found = False
        for i, staff in enumerate(workforce):
            # If staff and worker have the same starting time,
            # then we can merge worker volunteer counts with staff
            # volunteer count and worker email id with staff email id
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
                staff.worker+=", "+worker.worker
                # if worker and staff have different end time, we know
                # that worker end time must be after staff end time
                # as shown in case 2 comment. This is because all workers
                # were sorted by first start time, then end time. Workers
                # are added to workforce in that sorted order (staff is an
                # object from the workforce list)
                # In this case, we'll create a new Volunteer object, to account
                # for the volunteer count during non-overlapping time.
                if not worker.end_time == staff.end_time:
                    workers.append(Volunteer.from_dict({
                                        "start_time":staff.end_time, 
                                        "end_time":worker.end_time,
                                        "count":worker.count,
                                        "worker":worker.worker
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
                insert_staff1 = Volunteer.from_dict(
                    {"start_time":worker.start_time,
                     "end_time":worker.end_time,
                     "count":staff.count+worker.count,
                     "worker":staff.worker+", "+worker.worker})

                insert_staff2 = Volunteer.from_dict(
                                    {"start_time":worker.end_time,
                                     "end_time":staff.end_time,
                                     "count":staff.count,
                                     "worker":staff.worker}
                                )
                staff.end_time = worker.start_time
                workers.append(insert_staff1)
                workers.append(insert_staff2)

            # if worker starts before staff ends, we have one of the following
            # cases
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

                workers.append(Volunteer.from_dict(
                                    {"start_time":worker.start_time,
                                     "end_time":staff.end_time,
                                     "count":staff.count+worker.count,
                                     "worker":staff.worker+", "+worker.worker})
                              )

                if not worker.end_time == staff.end_time:
                    workers.append(Volunteer.from_dict(
                                    {"start_time":staff.end_time,
                                     "end_time":worker.end_time,
                                     "count":worker.count,
                                     "worker":worker.worker}
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
    Converts WorkShift objects to Volunteer objects, with the same 
    time interval, count 1, and worker id
    """
    workers = []
    for shift in shifts:
        workers.append(Volunteer.from_dict({"start_time":shift.start_time,
                                             "end_time":shift.end_time,
                                             "count":1,
                                             "worker":shift.worker}))
    return workers


"""
This module contains the use case for counting volunteers.
"""
from responses import ResponseSuccess
from use_cases.filter_by_time import apply_time_filters
from domains.staffing import Staffing

def count_volunteers_use_case(repo, request, shelter):
    shifts = repo.list(user=None, shelter=shelter)
    all_shifts = shifts.copy()
    if "start_after" in request.filters and "end_before" in request.filters:
        time_filter = {"end_before":request.filters["end_before"],
                       "end_after":request.filters["start_after"]}
        shifts = apply_time_filters(shifts, time_filter)
        time_filter = {"start_before":request.filters["end_before"],
                       "start_after":request.filters["start_after"]}
        shifts = shifts+apply_time_filters(all_shifts, time_filter)
   
        shifts.sort(key=lambda shift:(shift.start_time, shift.end_time))

    print(shifts)
    workforce = []
    for shift in shifts:
        found = False
        for i, staff in enumerate(workforce):
            if shift.start_time == staff.start_time:
                found = True
                staff.count+=1
                # |!____!|
                # |!_____|___!
                if not shift.end_time == staff.end_time:
                    workforce.append(Staffing.from_dict({
                                        "start_time":staff.end_time, 
                                        "end_time":shift.end_time,
                                        "count":1
                                    }))
            elif shift.end_time < staff.end_time:
                found = True
                # |__!__!__|
                insert_staff1 = Staffing.from_dict({"start_time":shift.start_time,
                                                   "end_time":shift.end_time,
                                                   "count":staff.count+1})
                
                insert_staff2 = Staffing.from_dict({"start_time":shift.end_time,
                                                   "end_time":staff.end_time,
                                                   "count":staff.count+1})

                staff.end_time = shift.start_time
                workforce.insert(i+1, insert_staff1)
                workforce.append(i+2, insert_staff2)
                
            elif shift.start_time < staff.end_time:
                found = True
                if shift.end_time == staff.end_time:
                    # |___!___!|
                    insert_staff = Staffing.from_dict({"start_time":shift.start_time,
                                                       "end_time":shift.end_time,
                                                       "count":staff.count+1})
                    workforce.insert(i+1, insert_staff)
                else:
                    # |___!____|____!
                    insert_staff1 = Staffing.from_dict({"start_time":shift.start_time,
                                                        "end_time":staff.end_time,
                                                        "count":staff.count+1})
                    insert_staff2 = Staffing.from_dict({"start_time":staff.end_time,
                                                        "end_time":shift.end_time,
                                                        "count":1})
                    workforce.insert(i+1, insert_staff1)
                    workforce.insert(i+2, insert_staff2)

        if not found:
            # |_____|_!____!
            workforce.append(Staffing.from_dict({"start_time":shift.start_time,
                                                 "end_time":shift.end_time,
                                                 "count":1}))
    print(workforce) 
    return ResponseSuccess(workforce)

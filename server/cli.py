"""
Command line interface for displaying the data, shift data for example
"""
from repository.memrepo import MemRepo
from use_cases.list_workshifts import workshift_list_use_case
from requests.work_shift_list import build_work_shift_list_request

shifts = [
    {
        "code": "f853578c-fc0f-4e65-81b8-566c5dffa35a",
        "worker": "volunteer@slu.edu",
        "shelter": "shelter-id-for-st-patric-center",
        "start_time": 1696168800000,
        "end_time": 1696179600000,
    },
    {
        "code": "f853578c-fc0f-4e65-81b8-566c5dffa35b",
        "worker": "volunteer2@slu.edu",
        "shelter": "shelter-id-for-st-patric-center",
        "start_time": 1696255200000,
        "end_time": 1696269600000,
    },
]

repo = MemRepo(shifts)
request = build_work_shift_list_request()
result = workshift_list_use_case(repo, request, "volunteer@slu.edu")

print([shift.to_dict() for shift in result.value])

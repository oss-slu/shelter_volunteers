from repository.memrepo import MemRepo
from use_cases.list_workshifts import workshift_list_use_case

shifts = [
   {
      "code":"f853578c-fc0f-4e65-81b8-566c5dffa35a",
      "worker":"volunteer@slu.edu",
      "shelter":"shelter-id-for-st-patric-center",
      "start_time": 1696168800000,
      "end_time": 1696179600000
   },
   {
      "code":"f853578c-fc0f-4e65-81b8-566c5dffa35b",
      "worker":"volunteer2@slu.edu",
      "shelter":"shelter-id-for-st-patric-center",
      "start_time": 1696255200000,
      "end_time": 1696269600000
   }
]

repo = MemRepo(shifts)
result = workshift_list_use_case(repo)

print([shift.to_dict() for shift in result])

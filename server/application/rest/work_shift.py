import json

from flask import Blueprint, Response
from flask_cors import cross_origin

from repository.memrepo import MemRepo
from use_cases.list_workshifts import workshift_list_use_case
from serializers.work_shift import WorkShiftJsonEncoder

blueprint = Blueprint("work_shift", __name__)

shifts = [
   {
      "code":"f853578c-fc0f-4e65-81b8-566c5dffa35a",
      "worker":"volunteer@slu.edu",
      "shelter":"shelter-id-for-st-patric-center",
      "start_time": 1695913039455,
      "end_time": 1695913049455
   },
   {
      "code":"f853578c-fc0f-4e65-81b8-566c5dffa35b",
      "worker":"volunteer2@slu.edu",
      "shelter":"shelter-id-for-st-patric-center",
      "start_time": 1695914039455,
      "end_time": 1695914049455
   }
]

@blueprint.route("/shifts", methods=["GET"])
@cross_origin()
def list_work_sifts():
    repo = MemRepo(shifts)
    result = workshift_list_use_case(repo)

    return Response(
        json.dumps(result, cls=WorkShiftJsonEncoder),
        mimetype="application/json",
        status=200,
    ) 

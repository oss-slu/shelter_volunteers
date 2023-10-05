"""
This module handles the API endpoints related to workshift
"""

import json

from flask import Blueprint, Response, request
from flask_cors import cross_origin

from repository.memrepo import MemRepo
from use_cases.list_workshifts import workshift_list_use_case
from serializers.work_shift import WorkShiftJsonEncoder

blueprint = Blueprint("work_shift", __name__)

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


@blueprint.route("/shifts", methods=["GET", "POST"])
@cross_origin()
def work_shifts():
    """
        On GET: The function returns a list of all work shifts in the system.
        On POST: The function adds shifts to the system.
    """
    if request.method == "GET":
        repo = MemRepo(shifts)
        result = workshift_list_use_case(repo)

        return Response(
            json.dumps(result, cls=WorkShiftJsonEncoder),
            mimetype="application/json",
            status=200,
        )
    elif request.method == "POST":
        data = request.get_json()
        shifts.extend(data)
        print(shifts)
        return Response(
            json.dumps(data, cls=WorkShiftJsonEncoder),
            mimetype="application/json",
            status=200,
        )
        
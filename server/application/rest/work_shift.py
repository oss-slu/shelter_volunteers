"""
This module handles the API endpoints related to work shifts.
"""

import json
from flask import Blueprint, Response, request
from flask_cors import cross_origin
from repository.memrepo import MemRepo
from errors.authentication import AuthenticationError
from errors.not_found import NotFoundError
from use_cases.list_workshifts import (
    workshift_list_use_case,
    workshift_add_multiple_use_case,
    delete_shift_use_case,
)
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
        try:
            result = workshift_list_use_case(repo)
            response_data = json.dumps(result, cls=WorkShiftJsonEncoder)
            return Response(response_data, mimetype="application/json", status=200)
        except (AuthenticationError, NotFoundError) as e:
            return handle_error_response(e)
    elif request.method == "POST":
        user = get_user_from_token(request.headers)
        data = request.get_json()
        for shift in data:
            shift["worker"] = user
        repo = MemRepo(shifts)
        try:
            workshift_add_multiple_use_case(repo, data)
            response_data = json.dumps(data, cls=WorkShiftJsonEncoder)
            return Response(response_data, mimetype="application/json", status=200)
        except (AuthenticationError, NotFoundError) as e:
            return handle_error_response(e)


def get_user_from_token(headers):
    if "Authorization" in headers:
        return headers["Authorization"]
    raise AuthenticationError("Authentication failed")


@blueprint.route("/shifts/<shift_id>", methods=["DELETE"])
@cross_origin()
def delete_work_shift(shift_id):
    try:
        shift_id = str(shift_id)
        user_email = get_user_from_token(request.headers)
        repo = MemRepo(shifts)
        delete_shift_use_case(repo, shift_id, user_email)
        return Response(
            json.dumps({"message": "Shift deleted successfully"}),
            mimetype="application/json",
            status=200,
        )
    except (AuthenticationError, NotFoundError) as e:
        return handle_error_response(e)


def handle_error_response(error):
    if isinstance(error, (AuthenticationError, NotFoundError)):
        status_code = error.status_code
    else:
        status_code = 500  # Internal Server Error
    return Response(
        json.dumps({"error": str(error)}),
        mimetype="application/json",
        status=status_code,
    )

"""
This module contains the RESTful route handlers
for work shifts in the server application.
"""
import json
from flask import Blueprint, Response, request
from flask_cors import cross_origin
from repository import mongorepo, manage
from use_cases.list_workshifts import workshift_list_use_case
from use_cases.add_workshifts import workshift_add_multiple_use_case
from use_cases.delete_workshifts import delete_shift_use_case
from use_cases.count_volunteers import count_volunteers_use_case
from serializers.work_shift import WorkShiftJsonEncoder
from serializers.staffing import StaffingJsonEncoder
from responses import ResponseTypes
from application.rest.request_from_params import list_shift_request

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
    {
        "code": "f853578c-fc0f-4e65-81b8-566c5dffa35a",
        "worker": "volunteer@slu.edu",
        "shelter": "shelter-id-for-st-patric-center",
        "start_time": 1701442800000,
        "end_time": 1701453600000,
    },

]

HTTP_STATUS_CODES_MAPPING = {
    ResponseTypes.NOT_FOUND: 404,
    ResponseTypes.SYSTEM_ERROR: 500,
    ResponseTypes.AUTHORIZATION_ERROR: 403,
    ResponseTypes.PARAMETER_ERROR: 400,
    ResponseTypes.SUCCESS: 200
}


@blueprint.route("/counts/<int:shelter_id>", methods=["GET"])
@cross_origin()
def counts(shelter_id):
    """
    On GET: The function returns volunteer counts for times that are
    specified by parameters.
    """
    repo = mongorepo.MongoRepo(app_configuration())
    request_object = list_shift_request(request.args)

    # find workshifts matching the request object
    response = count_volunteers_use_case(repo, request_object, shelter_id)
    return Response(
        json.dumps(response.value, cls=StaffingJsonEncoder),
        mimetype="application/json",
        status=HTTP_STATUS_CODES_MAPPING[response.response_type],
    )


@blueprint.route("/shifts", methods=["GET", "POST"])
@cross_origin()
def work_shifts():
    """
    On GET: The function returns a list of all work shifts in the system.
    On POST: The function adds shifts to the system.
    """
    repo = mongorepo.MongoRepo(app_configuration())
    user = get_user_from_token(request.headers)

    if request.method == "GET":
        # process the GET request parameters
        request_object = list_shift_request(request.args)

        # find workshifts matching the request object
        response = workshift_list_use_case(repo, request_object, user)
        return Response(
            json.dumps(response.value, cls=WorkShiftJsonEncoder),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[response.response_type],
        )

    elif request.method == "POST":
        data = request.get_json()
        for shift in data:
            shift["worker"] = user
        workshift_add_multiple_use_case(repo, data)
        return Response(
            json.dumps(data, cls=WorkShiftJsonEncoder),
            mimetype="application/json",
            status=200,
        )

def get_user_from_token(headers):
    return headers["Authorization"]

@blueprint.route("/shifts/<shift_id>", methods=["DELETE"])
@cross_origin()
def delete_work_shift(shift_id):
    shift_id = str(shift_id)
    user_email = get_user_from_token(request.headers)

    repo = mongorepo.MongoRepo(app_configuration())

    response = delete_shift_use_case(repo, shift_id, user_email)
    status_code = HTTP_STATUS_CODES_MAPPING[response.response_type]

    return Response(
        json.dumps(response.value),
        mimetype="application/json",
        status=status_code
    )

def app_configuration():
    result = manage.read_json_configuration("mongo_config")
    return result













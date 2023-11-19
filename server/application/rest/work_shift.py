"""
This module contains the RESTful route handlers
for work shifts in the server application.
"""
import json
from flask import Blueprint, Response, request, jsonify
from flask_cors import cross_origin
from repository import mongorepo, manage
from use_cases.list_workshifts import workshift_list_use_case
from use_cases.add_workshifts import workshift_add_multiple_use_case
from use_cases.delete_workshifts import delete_shift_use_case
from use_cases.count_volunteers import count_volunteers_use_case
from use_cases.get_facility_info import get_facility_info_use_case
from serializers.work_shift import WorkShiftJsonEncoder
from serializers.staffing import StaffingJsonEncoder
from responses import ResponseTypes
from application.rest.request_from_params import list_shift_request
import requests
from requests.exceptions import HTTPError, Timeout, RequestException


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

    if not user:
        return jsonify({"message": "Invalid or missing token"}), \
            ResponseTypes.AUTHORIZATION_ERROR

    if request.method == "GET":
        # process the GET request parameters
        request_object = list_shift_request(request.args)

        # find workshifts matching the request object
        response = workshift_list_use_case(repo, request_object, user)
        if response.response_type == ResponseTypes.SUCCESS:
            enriched_shifts = []
            for work_shift in response.value:
                # Convert the WorkShift object to JSON
                work_shift_json = json.loads(json.dumps(work_shift,
                                                    cls=WorkShiftJsonEncoder))
                facility_response = get_facility_info_use_case(
                    work_shift_json["shelter"])
                if facility_response.response_type == ResponseTypes.SUCCESS:
                    work_shift_json["facility_info"]=facility_response.value
                else:
                    work_shift_json["facility_info"]=\
                    "Facility information could not be retrieved"
                enriched_shifts.append(work_shift_json)
            return Response(
                json.dumps(enriched_shifts),
                mimetype="application/json",
                status=HTTP_STATUS_CODES_MAPPING[response.response_type]
            )
        else:
            # Handle error response
            return Response(
                json.dumps(response.value),
                mimetype="application/json",
                status=HTTP_STATUS_CODES_MAPPING[response.response_type]
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
    token = headers.get("Authorization")
    if not token:
        return None, "No token provided"

    try:
        response = requests.get(
            "https://api2-qa.gethelp.com/v1/users/current",
            headers={"Authorization": f"Bearer {token}"}
        )
        response.raise_for_status()
        return response.json(), None
    except HTTPError as e:
        return None, f"HTTP error: {e}"
    except Timeout:
        return None, "Timeout error"
    except RequestException:
        return None, "Request error"

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

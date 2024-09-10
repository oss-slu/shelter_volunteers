"""
This module contains the RESTful route handlers
for work shifts in the server application.
"""
import json
from flask import Blueprint, Response, request, jsonify, current_app
from flask_cors import cross_origin
from repository import mongorepo, manage
from use_cases.list_workshifts import workshift_list_use_case
from use_cases.add_workshifts import workshift_add_multiple_use_case
from use_cases.delete_workshifts import delete_shift_use_case
from use_cases.count_volunteers import count_volunteers_use_case
from use_cases.get_volunteers import get_volunteers_use_case
from use_cases.get_facility_info import get_facility_info_use_case
from use_cases.authenticate import login_user
from use_cases.authenticate import get_user
from serializers.work_shift import WorkShiftJsonEncoder
from serializers.staffing import StaffingJsonEncoder
from serializers.volunteer import VolunteerJsonEncoder
from responses import ResponseTypes
from application.rest.request_from_params import list_shift_request
import os


blueprint = Blueprint("work_shift", __name__)

shifts = [
    {
        "_id": {
            "$oid": "f853578c-fc0f-4e65-81b8-566c5dffa35a"
        },
        "worker": "volunteer@slu.edu",
        "shelter": "shelter-id-for-st-patric-center",
        "start_time": 1696168800000,
        "end_time": 1696179600000,
    },
    {
        "_id": {
            "$oid":"f853578c-fc0f-4e65-81b8-566c5dffa35b"
        },
        "worker": "volunteer2@slu.edu",
        "shelter": "shelter-id-for-st-patric-center",
        "start_time": 1696255200000,
        "end_time": 1696269600000,
    },
    {
        "_id": {
            "$oid":"f853578c-fc0f-4e65-81b8-566c5dffa35a"
        },
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
    ResponseTypes.SUCCESS: 200,
    ResponseTypes.CONFLICT: 409
}

user_list = {
    "nhi.tran@slu.edu": ("Nhi", "Tran"),
    "chloe.biddle@slu.edu": ("Chloe", "Biddle"),
    "siri.chandana@slu.edu": ("Siri", "Chandana"),
}

@blueprint.route("/getvolunteers/<int:shelter_id>", methods=["GET"])
@cross_origin()
def get_volunteers(shelter_id):
    """
    On GET: The function returns volunteer counts and usernames for times 
    that are specified by parameters.
    """
    repo = mongorepo.MongoRepo(app_configuration())
    request_object = list_shift_request(request.args)

    # find workshifts matching the request object
    response = get_volunteers_use_case(repo, request_object, shelter_id)
    return Response(
        json.dumps(response.value, cls=VolunteerJsonEncoder),
        mimetype="application/json",
        status=HTTP_STATUS_CODES_MAPPING[response.response_type],
    )


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

    if not user[0]:
        return jsonify({"message": "Invalid or missing token"}), \
            ResponseTypes.AUTHORIZATION_ERROR

    if request.method == "GET":
        # process the GET request parameters
        request_object = list_shift_request(request.args)

        # find workshifts matching the request object
        response = workshift_list_use_case(repo, request_object, user[0])
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
        repo = mongorepo.MongoRepo(app_configuration())
        user, first_name, last_name = get_user_from_token(request.headers)
        if not user:
            return jsonify({"message": "Invalid or missing token"}), \
                           ResponseTypes.AUTHORIZATION_ERROR
        data = request.get_json()
        for shift in data:
            shift["worker"] = user
            shift["first_name"] = first_name
            shift["last_name"] = last_name
        add_responses = workshift_add_multiple_use_case(repo, data)
        success = all(item["success"] for item in add_responses)
        status_code = (
            HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]
            if success
            else HTTP_STATUS_CODES_MAPPING[ResponseTypes.CONFLICT]
        )
        return Response(
            json.dumps(add_responses, cls=WorkShiftJsonEncoder),
            mimetype="application/json",
            status=status_code
        )

def get_user_from_token(headers):
    token = headers.get("Authorization")
    if not token:
        raise ValueError

    # in debug mode, see if real authentication should be bypassed
    if (current_app.config["DEBUG"] and
        "DEV_USER" in current_app.config and
        "DEV_TOKEN" in current_app.config and
        token == current_app.config["DEV_TOKEN"]):
        return (current_app.config["DEV_USER"],
            current_app.config["FIRST_NAME"],
            current_app.config["LAST_NAME"])

    user = get_user(token)
    if user is None:
        raise ValueError

    return user

@blueprint.route("/shifts/<shift_id>", methods=["DELETE"])
@cross_origin()
def delete_work_shift(shift_id):
    shift_id = str(shift_id)
    user_email = get_user_from_token(request.headers)

    repo = mongorepo.MongoRepo(app_configuration())

    response = delete_shift_use_case(repo, shift_id, user_email[0])
    status_code = HTTP_STATUS_CODES_MAPPING[response.response_type]

    return Response(
        json.dumps(response.value),
        mimetype="application/json",
        status=status_code
    )

@blueprint.route("/login", methods=["POST"])
@cross_origin()
def login():
    data = request.get_json()
    if not ("username" in data and "password" in data):
        return Response([],
            mimetype="application/json",
            status = HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]
        )

    status = ResponseTypes.SUCCESS

    # check if authentication should be bypassed for development purposes
    if (current_app.config["DEBUG"] and
        "DEV_TOKEN" in current_app.config and
        "DEV_USER" in current_app.config):
        os.environ["DEV_USER"] = data["username"]
        current_app.config["DEV_USER"] = data["username"]
        if data["username"] in user_list:
            first_name, last_name = user_list[data["username"]]
            os.environ["FIRST_NAME"] = first_name
            os.environ["LAST_NAME"] = last_name
            current_app.config["FIRST_NAME"] = first_name
            current_app.config["LAST_NAME"] = last_name
        return Response(
            json.dumps({"access_token":current_app.config["DEV_TOKEN"]}),
            mimetype="application/json",
            status = HTTP_STATUS_CODES_MAPPING[status])

    # go through the login process
    response = login_user(data["username"], data["password"])
    if not response.ok:
        status = ResponseTypes.AUTHORIZATION_ERROR

    return Response(json.dumps(response.json()),
        mimetype="application/json", status = HTTP_STATUS_CODES_MAPPING[status])

def app_configuration():
    result = manage.read_json_configuration("mongo_config")
    return result

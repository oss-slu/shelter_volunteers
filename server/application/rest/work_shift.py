"""
This module contains the RESTful route handlers for work shifts in the server application.
"""
import json
import logging
from flask import Blueprint, Response, request, jsonify, current_app
from flask_cors import cross_origin
from repository import mongorepo
from use_cases.list_workshifts import workshift_list_use_case
from use_cases.add_workshifts import workshift_add_multiple_use_case
from use_cases.delete_workshifts import delete_shift_use_case
from use_cases.count_volunteers import count_volunteers_use_case
from use_cases.get_volunteers import get_volunteers_use_case
from use_cases.get_facility_info import get_facility_info_use_case
from use_cases.authenticate import login_user, get_user
from serializers.work_shift import WorkShiftJsonEncoder
from serializers.staffing import StaffingJsonEncoder
from serializers.volunteer import VolunteerJsonEncoder
from responses import ResponseTypes
from application.rest.request_from_params import list_shift_request
import os
import copy  # Ensure shifts are copied properly

# Enable logging
logging.basicConfig(level=logging.DEBUG)

blueprint = Blueprint("work_shift", __name__)

HTTP_STATUS_CODES_MAPPING = {
    ResponseTypes.NOT_FOUND: 404,
    ResponseTypes.SYSTEM_ERROR: 500,
    ResponseTypes.AUTHORIZATION_ERROR: 403,
    ResponseTypes.PARAMETER_ERROR: 400,
    ResponseTypes.SUCCESS: 200,
    ResponseTypes.CONFLICT: 409
}

@blueprint.route("/shifts", methods=["GET", "POST"])
@cross_origin()
def work_shifts():
    """
    On GET: Returns a list of all work shifts in the system.
    On POST: Adds shifts to the system, supporting repeatable shifts.
    """
    db_config = db_configuration()
    repo = mongorepo.MongoRepo(db_config[0], db_config[1])
    
    try:
        user, first_name, last_name = get_user_from_token(request.headers)
    except ValueError:
        return jsonify({"message": "Invalid or missing token"}), HTTP_STATUS_CODES_MAPPING[ResponseTypes.AUTHORIZATION_ERROR]

    if request.method == "GET":
        request_object = list_shift_request(request.args)
        response = workshift_list_use_case(repo, request_object, user)

        if response.response_type == ResponseTypes.SUCCESS:
            enriched_shifts = []
            for work_shift in response.value:
                work_shift_json = json.loads(json.dumps(work_shift, cls=WorkShiftJsonEncoder))
                
                facility_response = get_facility_info_use_case(work_shift_json["shelter"])
                work_shift_json["facility_info"] = (
                    facility_response.value if facility_response.response_type == ResponseTypes.SUCCESS
                    else "Facility information could not be retrieved"
                )

                enriched_shifts.append(work_shift_json)

            return Response(
                json.dumps(enriched_shifts),
                mimetype="application/json",
                status=HTTP_STATUS_CODES_MAPPING[response.response_type]
            )
        else:
            return Response(
                json.dumps(response.value),
                mimetype="application/json",
                status=HTTP_STATUS_CODES_MAPPING[response.response_type]
            )

    elif request.method == "POST":
        data = request.get_json()
        logging.debug(f"Received shift data: {data}")

        all_shifts = []
        for shift in data:
            shift["worker"] = user
            shift["first_name"] = first_name
            shift["last_name"] = last_name
            repeat_days = shift.get("repeat_days", [])  

            all_shifts.append(copy.deepcopy(shift))

            for day_offset in repeat_days:
                new_shift = copy.deepcopy(shift)
                new_shift["start_time"] += day_offset * 86400000  
                new_shift["end_time"] += day_offset * 86400000
                all_shifts.append(new_shift)

        add_responses = workshift_add_multiple_use_case(repo, all_shifts)
        success = all(item["success"] for item in add_responses)
        status_code = HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS] if success else HTTP_STATUS_CODES_MAPPING[ResponseTypes.CONFLICT]

        return Response(
            json.dumps(add_responses, cls=WorkShiftJsonEncoder),
            mimetype="application/json",
            status=status_code
        )

@blueprint.route("/service_shift", methods=["POST"])
@cross_origin()
def service_shift():
    """
    API endpoint to add service shifts, supporting repeatable shifts.
    """
    data = request.get_json(force=True)
    logging.debug(f"Received service shift data: {data}")

    if not data:
        return jsonify({"message": "Invalid or missing JSON"}), HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]

    db_config = db_configuration()
    repo = mongorepo.MongoRepo(db_config[0], db_config[1])

    try:
        user, first_name, last_name = get_user_from_token(request.headers)
    except ValueError:
        return jsonify({"message": "Invalid or missing token"}), HTTP_STATUS_CODES_MAPPING[ResponseTypes.AUTHORIZATION_ERROR]

    all_shifts = []
    for shift in data:
        shift["worker"] = user
        shift["first_name"] = first_name
        shift["last_name"] = last_name
        repeat_days = shift.get("repeat_days", [])

        all_shifts.append(copy.deepcopy(shift))

        for day_offset in repeat_days:
            new_shift = copy.deepcopy(shift)
            new_shift["start_time"] += day_offset * 86400000  
            new_shift["end_time"] += day_offset * 86400000
            all_shifts.append(new_shift)

    add_responses = workshift_add_multiple_use_case(repo, all_shifts)
    success = all(item["success"] for item in add_responses)
    status_code = HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS] if success else HTTP_STATUS_CODES_MAPPING[ResponseTypes.CONFLICT]

    return Response(
        json.dumps(add_responses, cls=WorkShiftJsonEncoder),
        mimetype="application/json",
        status=status_code
    )

@blueprint.route("/shifts/<shift_id>", methods=["DELETE"])
@cross_origin()
def delete_work_shift(shift_id):
    """
    Deletes a specific work shift based on shift ID.
    """
    shift_id = str(shift_id)

    try:
        user_email = get_user_from_token(request.headers)
    except ValueError:
        return jsonify({"message": "Invalid or missing token"}), HTTP_STATUS_CODES_MAPPING[ResponseTypes.AUTHORIZATION_ERROR]

    db_config = db_configuration()
    repo = mongorepo.MongoRepo(db_config[0], db_config[1])

    response = delete_shift_use_case(repo, shift_id, user_email[0])
    status_code = HTTP_STATUS_CODES_MAPPING[response.response_type]

    return Response(
        json.dumps(response.value),
        mimetype="application/json",
        status=status_code
    )

def get_user_from_token(headers):
    """
    Extracts and verifies user identity from the Authorization token.
    """
    token = headers.get("Authorization")
    if not token:
        raise ValueError

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

def db_configuration():
    """
    Retrieves database configuration settings.
    """
    return (current_app.config["MONGODB_URI"], current_app.config["MONGODB_DATABASE"])

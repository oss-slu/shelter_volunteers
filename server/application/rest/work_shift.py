"""
This module contains the RESTful route handlers for work shifts.
"""
import json
from flask import Blueprint, Response, request, jsonify, current_app
from flask_cors import cross_origin
from repository import mongorepo
from use_cases.add_service_shifts import shift_add_multiple_use_case
from serializers.service_shift import WorkJsonEncoder
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

@blueprint.route("/service_shift", methods=["POST"])
@cross_origin()
def service_shift():
    """
    On POST: Adds service shifts to the system, supporting repeatable shifts.
    """
    data = request.get_json(force=True)

    if not data:
        return jsonify({"message": "Invalid or missing JSON"}), HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]


@blueprint.route("/counts/<int:shelter_id>", methods=["GET"])
@cross_origin()
def counts(shelter_id):
    """
    On GET: The function returns volunteer counts for times that are
    specified by parameters.
    """
    db_config = db_configuration()
    repo = mongorepo.MongoRepo(db_config[0], db_config[1])
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
    db_config = db_configuration()
    repo = mongorepo.MongoRepo(db_config[0], db_config[1])
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
        db_config = db_configuration()
        repo = mongorepo.MongoRepo(db_config[0], db_config[1])
    user, first_name, last_name = get_user_from_token(request.headers)
    if not user:
        return jsonify({"message": "Invalid or missing token"}), HTTP_STATUS_CODES_MAPPING[ResponseTypes.AUTHORIZATION_ERROR]

    repo = mongorepo.MongoRepo(current_app.config["MONGODB_URI"], current_app.config["MONGODB_DATABASE"])

    repeat_days = data.get("repeat_days", [])  # List of days to repeat the shift

    add_responses = shift_add_multiple_use_case(repo, data["shifts"], user, repeat_days)
    success = all(item["success"] for item in add_responses)
    status_code = HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS] if success else HTTP_STATUS_CODES_MAPPING[ResponseTypes.CONFLICT]

    return Response(json.dumps(add_responses, cls=WorkJsonEncoder), mimetype="application/json", status=status_code)

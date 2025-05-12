"""
This module handles schedule operations for repeatable shifts.
"""
import json
from flask import Blueprint, request, Response, jsonify
from flask_cors import cross_origin
from use_cases.add_service_shifts import shift_add_use_case
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from responses import ResponseTypes
from authentication.authenticate_user import get_user_from_token
from repository.mongo.schedule_repo import ScheduleMongoRepo
from domains.service_shift import ServiceShift  # Import the existing ServiceShift class
schedule_post_bp = Blueprint("schedule_post", __name__)
@schedule_post_bp.route("/schedule", methods=["POST"])
@cross_origin()
def create_schedule():
    """
    Endpoint to create repeatable schedule templates.
    Expects a JSON array of service shift objects.
    """
    user = get_user_from_token(request.headers)
    if not user[0]:
        return jsonify({"message": "Invalid or missing token"}), \
            ResponseTypes.AUTHORIZATION_ERROR
    shifts_data = request.get_json()
    if not shifts_data or not isinstance(shifts_data, list):
        return Response(
            json.dumps({"error": "Expected a list of service shifts"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )
    try:
        # Convert dictionaries to ServiceShift objects
        shifts_obj = [
            ServiceShift.from_dict(shift)
            for shift in shifts_data
        ]
    except (KeyError, TypeError, ValueError) as err:
        return Response(
            json.dumps({"error": f"Invalid data format: {str(err)}"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )
    repo = ScheduleMongoRepo()
    response = shift_add_use_case(repo, shifts_obj)
    status_code = (
        HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]
        if response.get("success")
        else HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]
    )
    return Response(
        json.dumps(response, default=str),
        mimetype="application/json",
        status=status_code,
    )

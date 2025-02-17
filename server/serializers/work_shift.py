"""
This module contains the RESTful route handlers for work shifts.
"""
import json
from flask import Blueprint, Response, request, jsonify, current_app
from flask_cors import cross_origin

# Repository imports
from repository import mongorepo

# Use case imports
from use_cases.add_service_shifts import shift_add_multiple_use_case
from use_cases.count_volunteers import count_volunteers_use_case
from use_cases.get_facility_info import get_facility_info_use_case
from use_cases.authenticate import get_user_from_token

# Request processing imports
from application.rest.request_from_params import list_shift_request

# Serializer imports
from serializers.service_shift import WorkJsonEncoder
from serializers.staffing import StaffingJsonEncoder
from serializers.work_shift import WorkShiftJsonEncoder

blueprint = Blueprint("work_shift", __name__)

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

    # Initialize database connection
    repo = mongorepo.MongoRepo(current_app.config["MONGODB_URI"], current_app.config["MONGODB_DATABASE"])

    # Authenticate user
    user, first_name, last_name = get_user_from_token(request.headers)
    if not user:
        return jsonify({"message": "Invalid or missing token"}), HTTP_STATUS_CODES_MAPPING[ResponseTypes.AUTHORIZATION_ERROR]

    # Extract repeat days from request
    repeat_days = data.get("repeat_days", [])  # List of days to repeat the shift

    # Add shifts
    add_responses = shift_add_multiple_use_case(repo, data["shifts"], user, repeat_days)
    success = all(item["success"] for item in add_responses)
    status_code = HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS] if success else HTTP_STATUS_CODES_MAPPING[ResponseTypes.CONFLICT]

    return Response(
        json.dumps(add_responses, cls=WorkJsonEncoder),
        mimetype="application/json",
        status=status_code
    )

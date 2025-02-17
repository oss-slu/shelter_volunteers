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

    repo = mongorepo.MongoRepo(current_app.config["MONGODB_URI"], current_app.config["MONGODB_DATABASE"])
    user = request.headers.get("User")  # Replace with actual authentication logic

    repeat_days = data.get("repeat_days", [])  # List of days to repeat the shift

    add_responses = shift_add_multiple_use_case(repo, data["shifts"], user, repeat_days)
    success = all(item["success"] for item in add_responses)
    status_code = HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS] if success else HTTP_STATUS_CODES_MAPPING[ResponseTypes.CONFLICT]

    return Response(json.dumps(add_responses, cls=WorkJsonEncoder), mimetype="application/json", status=status_code)

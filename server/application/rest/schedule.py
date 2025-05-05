"""
This module handles schedule operations for repeatable shifts.
"""
import json
from flask import Blueprint, request, Response
from flask_cors import cross_origin
from use_cases.schedule_add_use_case import schedule_add_use_case
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from responses import ResponseTypes

schedule_bp = Blueprint("schedule", __name__)

@schedule_bp.route("/schedule", methods=["POST"])
@cross_origin()
def create_schedule():
    """
    Endpoint to create repeatable schedule templates.
    Expects a JSON array of service shift objects.
    """
    shifts_data = request.get_json()
    if not shifts_data or not isinstance(shifts_data, list):
        return Response(
            json.dumps({"error": "Expected a list of service shifts"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )
    response = schedule_add_use_case(shifts_data)
    
    return Response(
        json.dumps(response.value),
        mimetype="application/json",
        status=HTTP_STATUS_CODES_MAPPING[response.response_type],
    )
    
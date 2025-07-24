"""
This module handles schedule operations for repeatable shifts.
"""
import json
from flask import Blueprint, request, Response
from application.rest.shelter_admin_permission_required import shelter_admin_permission_required
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from use_cases.add_service_shifts import shift_add_use_case
from use_cases.list_service_shifts_use_case import service_shifts_list_use_case
from responses import ResponseTypes
from repository.mongo.schedule_repo import ScheduleMongoRepo
from domains.service_shift import ServiceShift
from serializers.service_shift import ServiceShiftJsonEncoder
schedule_bp = Blueprint("schedule", __name__)

@schedule_bp.route("/shelters/<shelter_id>/schedule", methods=["POST"])
@shelter_admin_permission_required
def create_schedule(shelter_id):
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
    # Verify that all shifts have the correct shelter_id
    for shift in shifts_obj:
        if str(shift.shelter_id) != str(shelter_id):
            return Response(
                json.dumps({"error": "shelter_id in shift does not match URL parameter"}),
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

@schedule_bp.route("/shelters/<shelter_id>/schedule", methods=["GET"])
@shelter_admin_permission_required
def get_schedule(shelter_id):
    repo = ScheduleMongoRepo()
    shifts = service_shifts_list_use_case(repo, shelter_id)

    return Response(
        json.dumps(shifts, cls=ServiceShiftJsonEncoder),
        mimetype="application/json",
        status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS],
    )

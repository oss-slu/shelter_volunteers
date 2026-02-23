"""
This module handles service shift operations.
"""

import json

from flask import Blueprint, request, Response

from application.rest.shelter_admin_permission_required import shelter_admin_permission_required
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from domains.service_shift import ServiceShift
from repository.mongo.service_commitments import MongoRepoCommitments
from repository.mongo.service_shifts import ServiceShiftsMongoRepo
from repository.mongo.user_info_repository import UserInfoRepository
from responses import ResponseTypes
from serializers.service_commitment import ServiceCommitmentJsonEncoder
from serializers.service_shift import ServiceShiftJsonEncoder
from use_cases.add_service_shifts import shift_add_use_case
from use_cases.list_service_shifts_use_case import list_service_shifts_with_volunteers_use_case
from use_cases.service_commitments.list_user_infos_in_shift import list_user_infos_in_shift

service_shift_bp = Blueprint("service_shift", __name__)
MAX_INSTRUCTIONS_LENGTH = 500

commitments_repo = MongoRepoCommitments()
service_shifts_repo = ServiceShiftsMongoRepo()
user_info_repo = UserInfoRepository()


def retrieve_service_shifts(http_request, shelter_id=None):
    filter_start_after_str = http_request.args.get("filter_start_after")

    filter_start_after = (
        int(filter_start_after_str)
        if filter_start_after_str and filter_start_after_str.isdigit()
        else None
    )

    shifts, volunteers = list_service_shifts_with_volunteers_use_case(
        service_shifts_repo,
        commitments_repo,
        shelter_id,
        filter_start_after=filter_start_after
    )

    shifts_json = json.dumps(shifts, cls=ServiceShiftJsonEncoder)
    volunteers_json = json.dumps(
        volunteers,
        cls=ServiceCommitmentJsonEncoder)

    shifts_list = json.loads(shifts_json)
    volunteers_list = json.loads(volunteers_json)
    volunteers_by_shift = []
    for volunteer_group in volunteers_list:
        email_group = []
        for volunteer in volunteer_group:
            email_volunteer = {}
            email_volunteer["email"] = volunteer["volunteer_id"]
            email_group.append(email_volunteer)
        volunteers_by_shift.append(email_group)
    return shifts_list, volunteers_by_shift


def _sanitize_instructions(instructions):
    if instructions is None:
        return ""
    if not isinstance(instructions, str):
        raise ValueError("instructions must be a string")

    trimmed = instructions.strip()
    if len(trimmed) > MAX_INSTRUCTIONS_LENGTH:
        raise ValueError(
            f"instructions must be at most {MAX_INSTRUCTIONS_LENGTH} characters"
        )
    return trimmed


def _validate_shift_payload(shift_payload):
    validated = dict(shift_payload)
    validated["instructions"] = _sanitize_instructions(
        shift_payload.get("instructions", "")
    )
    return validated


@service_shift_bp.route("/service_shifts", methods=["GET"])
def get_service_shifts():
    """
    Handles GET to list all shifts for a shelter.
    GET requests can be made to retrieve the list of shifts.
    """

    shifts_list, volunteers_by_shift = retrieve_service_shifts(request)

    for i, shift in enumerate(shifts_list):
        shift["volunteer_count"] = len(volunteers_by_shift[i])

    shifts_json = json.dumps(shifts_list)
    return Response(
        shifts_json,
        mimetype="application/json",
        status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS],
    )


@service_shift_bp.get("/service_shifts/<shift_id>/user_info")
@shelter_admin_permission_required
def get_user_infos_in_shift(shift_id: str):
    user_infos = list_user_infos_in_shift(shift_id, commitments_repo, user_info_repo)
    user_infos = [ui.to_dict() for ui in user_infos]
    body = json.dumps(user_infos)
    return Response(
        body,
        mimetype="application/json",
        status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS],
    )


@service_shift_bp.route("/shelters/<shelter_id>/service_shifts", methods=["GET"])
@shelter_admin_permission_required
def get_service_shifts_for_shelter(shelter_id):
    """
    Handles GET to list all shifts for a shelter.
    GET requests can be made to retrieve the list of shifts.
    Requires shelter admin permissions for the given shelter.
    """
    shifts_list, volunteers_by_shift = retrieve_service_shifts(request, shelter_id)

    for i, shift in enumerate(shifts_list):
        shift["volunteers"] = volunteers_by_shift[i]

    shifts_json = json.dumps(shifts_list)
    return Response(
        shifts_json,
        mimetype="application/json",
        status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS],
    )


@service_shift_bp.route("/shelters/<shelter_id>/service_shifts", methods=["POST"])
@shelter_admin_permission_required
def post_service_shifts(shelter_id):
    """
    Handles POST to add service shifts.
    POST requests can be made by authenticated users with permissions to 
    be this shelter's admin.
    """
    repo = ServiceShiftsMongoRepo()

    shifts_as_dict = request.get_json()

    # Validate JSON payload
    if not shifts_as_dict or not isinstance(shifts_as_dict, list):
        return Response(
            json.dumps({"message": "Invalid JSON object"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )
    try:
        shifts_obj = [
            ServiceShift.from_dict(_validate_shift_payload(shift))
            for shift in shifts_as_dict
        ]
    except (KeyError, TypeError, ValueError) as err:
        return Response(
            json.dumps({"message": f"Invalid data format: {str(err)}"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )
    # Verify that all shifts have the correct shelter_id
    for shift in shifts_obj:
        if str(shift.shelter_id) != str(shelter_id):
            return Response(
                json.dumps({"message": "shelter_id in shift does not match URL parameter"}),
                mimetype="application/json",
                status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
            )

    add_response = shift_add_use_case(repo, shifts_obj)
    status_code = (
        HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]
        if add_response.get("success")
        else HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]
    )

    return Response(
        json.dumps(add_response, default=str),
        mimetype="application/json",
        status=status_code,
    )


@service_shift_bp.route("/shelters/<shelter_id>/service_shifts/<shift_id>", methods=["PATCH"])
@shelter_admin_permission_required
def patch_service_shift(shelter_id, shift_id):
    """
    Handles PATCH to update an existing service shift.
    Requires shelter admin permissions for the given shelter.
    """
    shift_updates = request.get_json()

    if not shift_updates or not isinstance(shift_updates, dict):
        return Response(
            json.dumps({"message": "Invalid JSON object"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )

    existing_shift = service_shifts_repo.get_shift(shift_id)
    if not existing_shift:
        return Response(
            json.dumps({"message": "Service shift not found"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.NOT_FOUND],
        )

    if str(existing_shift.shelter_id) != str(shelter_id):
        return Response(
            json.dumps({"message": "shelter_id in URL does not match shift shelter"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )

    allowed_update_fields = {
        "shift_start",
        "shift_end",
        "required_volunteer_count",
        "max_volunteer_count",
        "shift_name",
        "can_sign_up",
        "instructions",
    }
    invalid_fields = [k for k in shift_updates if k not in allowed_update_fields]
    if invalid_fields:
        return Response(
            json.dumps({"message": f"Invalid update fields: {', '.join(invalid_fields)}"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )

    try:
        updates = dict(shift_updates)
        if "instructions" in updates:
            updates["instructions"] = _sanitize_instructions(updates.get("instructions"))
    except ValueError as err:
        return Response(
            json.dumps({"message": f"Invalid data format"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )

    merged_shift = {
        **existing_shift.to_dict(),
        **updates,
    }

    try:
        shift_obj = ServiceShift.from_dict(merged_shift)
    except (KeyError, TypeError, ValueError):
        return Response(
            json.dumps({"message": f"Invalid data format"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )

    if shift_obj.shift_start >= shift_obj.shift_end:
        return Response(
            json.dumps({"message": "shift_start must be before shift_end"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )

    overlap = service_shifts_repo.check_shift_overlap(
        shelter_id,
        shift_obj.shift_start,
        shift_obj.shift_end,
        exclude_shift_id=shift_id,
    )
    if overlap:
        return Response(
            json.dumps({"message": "overlapping shift"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.CONFLICT],
        )

    update_success = service_shifts_repo.update_service_shift(shift_id, updates)
    if not update_success:
        return Response(
            json.dumps({"message": "Failed to update service shift"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.NOT_FOUND],
        )

    refreshed_shift = service_shifts_repo.get_shift(shift_id)
    return Response(
        json.dumps(refreshed_shift, cls=ServiceShiftJsonEncoder),
        mimetype="application/json",
        status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS],
    )

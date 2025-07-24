"""
This module handles service shift operations.
"""

import json
from flask import Blueprint, request, Response
from use_cases.add_service_shifts import shift_add_use_case
from use_cases.list_service_shifts_use_case import list_service_shifts_with_volunteers_use_case
from repository.mongo.service_shifts import ServiceShiftsMongoRepo
from repository.mongo.service_commitments import MongoRepoCommitments
from domains.service_shift import ServiceShift
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from application.rest.shelter_admin_permission_required import shelter_admin_permission_required
from responses import ResponseTypes
from serializers.service_shift import ServiceShiftJsonEncoder
from serializers.service_commitment import ServiceCommitmentJsonEncoder

service_shift_bp = Blueprint("service_shift", __name__)

def retrieve_service_shifts(http_request, shelter_id=None):
    repo = ServiceShiftsMongoRepo()
    commitments_repo = MongoRepoCommitments()

    filter_start_after_str = http_request.args.get("filter_start_after")

    filter_start_after = (
        int(filter_start_after_str)
        if filter_start_after_str and filter_start_after_str.isdigit()
        else None
    )

    shifts, volunteers = list_service_shifts_with_volunteers_use_case(
        repo,
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
    if not shifts_as_dict:
        return Response(
            json.dumps({"message": "Invalid JSON object"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )
    try:
        shifts_obj = [
            ServiceShift.from_dict(shift)
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

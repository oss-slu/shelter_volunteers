"""
This module handles service shift operations.
"""

import json
from flask import Blueprint, request, Response
from flask_cors import cross_origin

# Application-specific imports grouped by package
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from authentication.authenticate_user import get_user_from_token

from domains.service_shift import ServiceShift
from domains.resources import Resources

from repository.mongo.service_shifts import ServiceShiftsMongoRepo

from responses import ResponseTypes

from serializers.service_shift import ServiceShiftJsonEncoder

from use_cases.add_service_shifts import shift_add_use_case
from use_cases.list_service_shifts_use_case import service_shifts_list_use_case
from use_cases.authorization.is_authorized import is_authorized


service_shift_bp = Blueprint("service_shift", __name__)


@service_shift_bp.route("/service_shift", methods=["GET", "POST"])
@cross_origin()
def handle_service_shift():
    """
    Handles POST to add service shifts and GET to list all shifts for a shelter.
    
    GET: List service shifts for a shelter.
        Required permissions: READ access to Resources.SHIFT for 
        the specific shelter_id 
        or system admin access
    
    POST: Add new service shifts.
        Required permissions: WRITE access to Resources.SHIFT 
        for the specific shelter_id 
        or system admin access
    """
    repo = ServiceShiftsMongoRepo()

    # Authentication check
    auth_token = request.headers.get("Authorization")
    if not auth_token:
        return Response(
            json.dumps({"message": "Authentication required"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.UNAUTHORIZED]
        )
    # Get the user email from the token
    user_email = get_user_from_token(auth_token)
    if not user_email:
        return Response(
            json.dumps({"message": "Invalid authentication token"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.UNAUTHORIZED]
        )

    if request.method == "GET":
        shelter_id_str = request.args.get("shelter_id")
        filter_start_after_str = request.args.get("filter_start_after")

        # Ensure proper conversion to int, handling empty or invalid cases
        shelter_id = (
            int(shelter_id_str)
            if shelter_id_str and shelter_id_str.isdigit()
            else None
        )
        filter_start_after = (
            int(filter_start_after_str)
            if filter_start_after_str and filter_start_after_str.isdigit()
            else None
        )

        shifts = service_shifts_list_use_case(
            repo, shelter_id, filter_start_after
        )

        return Response(
            json.dumps(shifts, cls=ServiceShiftJsonEncoder),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS],
        )

    if request.method == "POST":
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
            # Check if all shifts are for the same shelter
            shelters = set(shift.shelter_id for shift in shifts_obj)
            if len(shelters) != 1:
                return Response(
                    json.dumps({"error": "All shifts must be for "
                    "the same shelter"}),
                    mimetype="application/json",
                    status=HTTP_STATUS_CODES_MAPPING[
                        ResponseTypes.PARAMETER_ERROR],
                )
            # Get the shelter_id from the first shift
            shelter_id = shifts_obj[0].shelter_id
            # Authorization check for adding service
            # shifts to a specific shelter
            if not is_authorized(repo, user_email,
                                 Resources.SHELTER, shelter_id):
                return Response(
                    json.dumps({"message": "Unauthorized to "
                    "add service shifts for this shelter"}),
                    mimetype="application/json",
                    status=HTTP_STATUS_CODES_MAPPING
                    [ResponseTypes.FORBIDDEN])
        except (KeyError, TypeError, ValueError) as err:
            return Response(
                json.dumps({"error": f"Invalid data format: {str(err)}"}),
                mimetype="application/json",
                status=400,
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
    
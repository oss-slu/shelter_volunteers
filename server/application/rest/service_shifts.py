"""
This module handles service shift operations.
"""

import json
from flask import Blueprint, request, Response
from flask_cors import cross_origin
from use_cases.add_service_shifts import shift_add_use_case
from use_cases.list_service_shifts_use_case import list_service_shifts_with_volunteers_use_case
from repository.mongo.service_shifts import ServiceShiftsMongoRepo
from repository.mongo.service_commitments import MongoRepoCommitments
from domains.service_shift import ServiceShift
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from responses import ResponseTypes
from serializers.service_shift import ServiceShiftJsonEncoder
from serializers.service_commitment import ServiceCommitmentJsonEncoder

service_shift_bp = Blueprint("service_shift", __name__)

@service_shift_bp.route("/service_shift", methods=["GET", "POST"])
@cross_origin()
def handle_service_shift():
    """
    Handles POST to add service shifts and GET to list all shifts for a shelter.
    """
    repo = ServiceShiftsMongoRepo()
    commitments_repo = MongoRepoCommitments()

    if request.method == "GET":
        shelter_id_str = request.args.get("shelter_id")
        filter_start_after_str = request.args.get("filter_start_after")

        shelter_id = shelter_id_str
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
        volunteers_json = json.dumps(volunteers, cls=ServiceCommitmentJsonEncoder)

        shifts_list = json.loads(shifts_json)
        volunteers_list = json.loads(volunteers_json)
        volunteers_email = []
        for volunteer_group in volunteers_list:
            email_group = []
            for volunteer in volunteer_group:
                email_volunteer = {}
                email_volunteer["email"] = volunteer["volunteer_id"]
                email_group.append(email_volunteer)
            volunteers_email.append(email_group)

        for i, shift in enumerate(shifts_list):
            shift["volunteers"] = volunteers_email[i]

        shifts_json = json.dumps(shifts_list)
        return Response(
            shifts_json,
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

"""Module for handling GET requests to the /schedule endpoint."""

import json
from flask import Blueprint, request, Response
from flask_cors import cross_origin
from repository.mongo.schedule_repo import ScheduleMongoRepo
from use_cases.list_service_shifts_use_case import service_shifts_list_use_case
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from responses import ResponseTypes
from serializers.service_shift import ServiceShiftJsonEncoder

schedule_bp = Blueprint("schedule", __name__)

@schedule_bp.route("/schedule", methods=["GET"])
@cross_origin()
def handle_schedule_shift():
    shelter_id = request.args.get("shelter_id")
    if not shelter_id:
        return Response(
            json.dumps({"error": "shelter_id is required"}),
            mimetype="application/json",
            status=400
        )

    repo = ScheduleMongoRepo()
    shifts = service_shifts_list_use_case(repo, shelter_id)

    return Response(
        json.dumps(shifts, cls=ServiceShiftJsonEncoder),
        mimetype="application/json",
        status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS],
    )

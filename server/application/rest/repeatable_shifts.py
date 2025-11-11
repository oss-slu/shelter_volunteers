"""
This module contains the RESTful route handlers
for repeatable shifts in the server application.
"""

import json
import logging
from flask import Blueprint, Response, request

from application.rest.shelter_admin_permission_required import (
    shelter_admin_permission_required,
)
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from domains.shelter.schedule.repeatable_shift import RepeatableShift
from repository.mongo.repeatable_shifts_repository import RepeatableShiftsRepository
from responses import ResponseTypes
from use_cases.schedule.get_repeatable_shifts import get_repeatable_shifts
from use_cases.schedule.set_repeatable_shifts import set_repeatable_shifts

repeatable_shifts_bp = Blueprint("repeatable_shifts", __name__)

repo = RepeatableShiftsRepository()


# Configure module-level logger
logger = logging.getLogger(__name__)


@repeatable_shifts_bp.post("/shelters/<shelter_id>/schedule")
@shelter_admin_permission_required
def post_repeatable_shifts_endpoint(shelter_id):
    body = request.get_json()
    if not isinstance(body, list):
        return Response(
            json.dumps({"error": "Expected a list of repeatable shifts."}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )

    try:
        shifts = [RepeatableShift(**shift) for shift in body]
    except (KeyError, TypeError, ValueError) as err:
        # Use lazy %-formatting to avoid eager string interpolation in logging
        # and keep line length within lint limits.
        logger.error(
            "Failed to parse repeatable shifts input for shelter %s: %s",
            shelter_id,
            err,
            exc_info=True,
        )
        return Response(
            json.dumps({"error": "Invalid data format."}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )

    result = set_repeatable_shifts(shelter_id, shifts, repo)
    response = [shift.__dict__ for shift in result.value.shifts]
    return Response(
        json.dumps(response),
        mimetype="application/json",
        status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS],
    )


@repeatable_shifts_bp.get("/shelters/<shelter_id>/schedule")
@shelter_admin_permission_required
def get_repeatable_shifts_endpoint(shelter_id):
    result = get_repeatable_shifts(shelter_id, repo)
    response = [shift.__dict__ for shift in result.value.shifts]

    return Response(
        json.dumps(response),
        mimetype="application/json",
        status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS],
    )

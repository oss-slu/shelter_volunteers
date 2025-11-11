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
    """
    Returns a json body of either a list of the created shifts, or an error body,
    where generic_errors is a list of string errors, and keyed errors among
    all created shifts are accumulated by "${key_name}${shift_index}"=error_string.
    """

    body = request.get_json()
    if not isinstance(body, list):
        return Response(
            json.dumps({"error": "Expected a list of repeatable shifts."}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )

    try:
        create_shift_results = [RepeatableShift.create(**shift) for shift in body]
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

    errors = [(i, result) for (i, result) in
              enumerate(create_shift_results) if not result.is_success]
    if errors:
        keyed_errors = {
            idx: {
                key: value
            }
            for idx, error in errors
            for key, value in error.keyed_errors.items()
        }
        generic_errors = list(set([msg for idx, error in errors for msg in error.generic_errors]))
        return Response(
            json.dumps({"generic_errors": generic_errors, "keyed_errors": keyed_errors}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )

    shifts = [result.value for result in create_shift_results]
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

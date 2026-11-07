"""
Waitlist REST endpoints.

Routes:
  POST   /service_shifts/<shift_id>/waitlist  - join waitlist for a shift
  DELETE /service_shifts/<shift_id>/waitlist  - leave the waitlist for a shift
  GET    /waitlist                             - list current user's waitlist
                                                 entries (with shift details)
  GET    /service_shifts/<shift_id>/waitlist  - admin view of the queue for a shift
"""
import json

from flask import Blueprint, Response, jsonify

from application.rest.shelter_admin_permission_required import (
    shelter_admin_permission_required,
)
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from application.rest.token_required import token_required_with_request
from repository.mongo.service_commitments import MongoRepoCommitments
from repository.mongo.service_shifts import ServiceShiftsMongoRepo
from repository.mongo.shelter import ShelterRepo
from repository.mongo.waitlist import WaitlistMongoRepo
from responses import ResponseTypes
from serializers.service_shift import ServiceShiftJsonEncoder
from serializers.shelter import ShelterJsonEncoder
from serializers.waitlist_entry import WaitlistEntryJsonEncoder
from domains.service_commitment import ServiceCommitment
from use_cases.add_service_commitments import check_time_overlap
from use_cases.list_shelters_for_shifts import list_shelters_for_shifts
from use_cases.waitlist.join_waitlist import join_waitlist
from use_cases.waitlist.leave_waitlist import leave_waitlist
from use_cases.waitlist.list_user_waitlist import list_user_waitlist_with_shifts


waitlist_bp = Blueprint("waitlist", __name__)

waitlist_repo = WaitlistMongoRepo()
commitments_repo = MongoRepoCommitments()
shifts_repo = ServiceShiftsMongoRepo()
shelter_repo = ShelterRepo()


def _json_response(payload, response_code):
    return Response(
        json.dumps(payload, default=str),
        mimetype="application/json",
        status=HTTP_STATUS_CODES_MAPPING[response_code],
    )


@waitlist_bp.route("/service_shifts/<shift_id>/waitlist", methods=["POST"])
@token_required_with_request
def post_join_waitlist(user_email, shift_id):
    """Add the authenticated user to the waitlist for a shift."""
    result = join_waitlist(
        waitlist_repo,
        commitments_repo,
        shifts_repo,
        user_email,
        shift_id,
    )
    response_code = result.pop("response_code", ResponseTypes.SUCCESS)
    return _json_response(result, response_code)


@waitlist_bp.route("/service_shifts/<shift_id>/waitlist", methods=["DELETE"])
@token_required_with_request
def delete_leave_waitlist(user_email, shift_id):
    """Remove the authenticated user from the waitlist for a shift."""
    result = leave_waitlist(waitlist_repo, user_email, shift_id)
    response_code = result.pop("response_code", ResponseTypes.SUCCESS)
    return _json_response(result, response_code)


@waitlist_bp.route("/waitlist", methods=["GET"])
@token_required_with_request
def get_my_waitlist(user_email):
    """Return the user's waitlist entries with shift + shelter details."""
    entries, shifts, position_by_shift = list_user_waitlist_with_shifts(
        waitlist_repo, shifts_repo, user_email
    )
    if not entries:
        return _json_response([], ResponseTypes.SUCCESS)

    shifts_list = json.loads(json.dumps(shifts, cls=ServiceShiftJsonEncoder))
    entries_list = json.loads(json.dumps(entries, cls=WaitlistEntryJsonEncoder))

    shelters = list_shelters_for_shifts(shifts, shelter_repo)
    shelters_list = json.loads(json.dumps(shelters, cls=ShelterJsonEncoder))
    shelters_by_id = {s["_id"]: s for s in shelters_list}

    merged = []
    for entry, shift in zip(entries_list, shifts_list):
        shift_copy = {k: v for k, v in shift.items() if k != "_id"}
        item = {**entry, **shift_copy}
        item["service_shift_id"] = entry["service_shift_id"]
        item["waitlist_entry_id"] = entry["_id"]
        item["position"] = position_by_shift.get(entry["service_shift_id"])
        shelter = shelters_by_id.get(item.get("shelter_id"))
        if shelter:
            item["shelter"] = shelter
        merged.append(item)

    return _json_response(merged, ResponseTypes.SUCCESS)


@waitlist_bp.route(
    "/shelters/<shelter_id>/service_shifts/<shift_id>/waitlist",
    methods=["GET"],
)
@shelter_admin_permission_required
def get_shift_waitlist(shelter_id, shift_id):
    """Admin view: return the FIFO waitlist queue for a shift."""
    shift = shifts_repo.get_shift(shift_id)
    if not shift:
        return jsonify({"message": "Shift not found"}), HTTP_STATUS_CODES_MAPPING[
            ResponseTypes.NOT_FOUND
        ]
    if str(shift.shelter_id) != str(shelter_id):
        return (
            jsonify({"message": "shelter_id in URL does not match shift shelter"}),
            HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )
    queue = waitlist_repo.list_for_shift(shift_id) or []
    body = json.loads(json.dumps(queue, cls=WaitlistEntryJsonEncoder))
    for index, item in enumerate(body):
        item["position"] = index + 1
    return _json_response(body, ResponseTypes.SUCCESS)

@waitlist_bp.route(
    "/shelters/<shelter_id>/service_shifts/<shift_id>/waitlist/<waitlist_id>/approve",
    methods=["POST"],
)
@shelter_admin_permission_required
def approve_waitlist_participant(shelter_id, shift_id, waitlist_id):
    waitlist_entry = waitlist_repo.get_by_id(waitlist_id)

    if not waitlist_entry:
        return jsonify({"message": "Waitlist entry not found"}), HTTP_STATUS_CODES_MAPPING[
            ResponseTypes.NOT_FOUND
        ]

    # check shift ids match
    if shift_id != waitlist_entry.service_shift_id:
        return (
            jsonify({"message": "shift_id in URL does not match waitlist shift"}),
            HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )
    shift = shifts_repo.get_shift(shift_id=waitlist_entry.service_shift_id)

    # check shift belongs to this shelter
    if str(shift.shelter_id) != str(shelter_id):
        return (
            jsonify({"message": "shelter_id in URL does not match shift shelter"}),
            HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )

    # check existing commitments
    current_shift_commitments = commitments_repo.fetch_service_commitments(
        shift_id=waitlist_entry.service_shift_id
    )
    if len(current_shift_commitments) >= shift.max_volunteer_count:
        return (
            jsonify({"message": "This shift has reached the maximum allowed volunteers"}),
            HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )

    # check that the volunteer isn't double booked
    user_commitments = commitments_repo.fetch_service_commitments(
        user_id=waitlist_entry.volunteer_id
    ) or []
    user_shift_ids = [
        str(c.service_shift_id) for c in user_commitments if c.service_shift_id
    ]
    user_shifts = shifts_repo.get_shifts(user_shift_ids) if user_shift_ids else []
    if check_time_overlap(shift, user_shifts):
        return (
            jsonify({"message": "This user is committed to an overlaping shift already"}),
            HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )

    new_commitment = ServiceCommitment(
        volunteer_id=waitlist_entry.volunteer_id,
        service_shift_id=waitlist_entry.service_shift_id,
    )
    new_commitment_id = commitments_repo.insert_service_commitments([new_commitment])[0]
    promotion = {
        "volunteer_id": new_commitment.volunteer_id,
        "service_commitment_id": new_commitment_id,
        "waitlist_entry_id": str(waitlist_entry.get_id()),
    }
    waitlist_repo.remove_entry(waitlist_entry.get_id())

    return _json_response(promotion, ResponseTypes.SUCCESS)

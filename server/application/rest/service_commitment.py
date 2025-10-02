"""
Module for handling service commitment API endpoints.
Provides endpoints for creating and retrieving service commitments.
"""
import json
from flask import Blueprint, request, Response, jsonify
from domains.service_commitment import ServiceCommitment

from application.rest.token_required import token_required_with_request
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from application.rest.request_parameters import is_true
from application.rest.request_parameters import get_time_filters
from use_cases.add_service_commitments import add_service_commitments
from use_cases.list_service_commitments import list_service_commitments_with_shifts
from use_cases.list_shelters_for_shifts import list_shelters_for_shifts
from use_cases.delete_service_commitment import delete_service_commitment
from repository.mongo.service_commitments import MongoRepoCommitments
from repository.mongo.service_shifts import ServiceShiftsMongoRepo
from repository.mongo.shelter import ShelterRepo
from serializers.service_commitment import ServiceCommitmentJsonEncoder
from serializers.service_shift import ServiceShiftJsonEncoder
from serializers.shelter import ShelterJsonEncoder
from responses import ResponseTypes

service_commitment_bp = Blueprint("service_commitment", __name__)

commitments_repo = MongoRepoCommitments()
shifts_repo = ServiceShiftsMongoRepo()
shelter_repo = ShelterRepo()

@service_commitment_bp.route("/service_commitment", methods=["POST"])
@token_required_with_request
def create_service_commitment(user_email):
    """
    Handle POST request to create service commitments.
    Extract user info from Authorization token and create commitments.
    """
    try:
        request_data = request.get_json()
        if not isinstance(request_data, list):
            return (
                jsonify({"error": "Invalid request format, expected a list"}),
                HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
            )
        # Pass the repo object to the use case function
        commitments_as_obj = []
        for commitment in request_data:
            commitment["volunteer_id"] = user_email
            commitments_as_obj.append(ServiceCommitment.from_dict(commitment))
        response = add_service_commitments(
            commitments_repo,
            shifts_repo,
            commitments_as_obj)

        return Response(
            json.dumps(response, default=str),
            mimetype="application/json",
            status = HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]
        )
    except ValueError as error:
        return (
            jsonify({"error": str(error)}),
            HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )
    except KeyError as error:
        return (
            jsonify({"error": f"Missing key: {str(error)}"}),
            HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )

@service_commitment_bp.route("/service_commitment", methods=["GET"])
@token_required_with_request
def fetch_service_commitments(user_email):
    """
    Handle GET request to retrieve service commitments.
    """
    try:
        # Extract service_shift_id from query parameters if provided
        service_shift_id = request.args.get("service_shift_id")
        include_shift_details = is_true(request.args, "include_shift_details")
        time_filter_obj = get_time_filters(request.args)

        # If service_shift_id is provided, we want all
        # commitments for that shift
        # regardless of the user, as per requirements for shelters to
        # view all volunteers
        # If service_shift_id is not provided, we filter by user_email as before
        filter_user = None if service_shift_id else user_email
        commitments, shifts = list_service_commitments_with_shifts(
            commitments_repo,
            shifts_repo,
            time_filter_obj,
            filter_user,
            service_shift_id
        )

        # Convert commitments to JSON
        commitments_list = []
        for commitment in commitments:
            commitment_dict = json.loads(json.dumps(
                commitment, cls=ServiceCommitmentJsonEncoder))
            commitments_list.append(commitment_dict)

        if include_shift_details:
            shelters = list_shelters_for_shifts(shifts, shelter_repo)
            # Convert shifts to JSON
            shifts_list = []
            for shift in shifts:
                shift_dict = json.loads(json.dumps(
                    shift, cls=ServiceShiftJsonEncoder))
                shifts_list.append(shift_dict)
            # Convert shelters to JSON
            shelters_list = []
            for shelter in shelters:
                shelter_dict = json.loads(json.dumps(
                    shelter, cls=ShelterJsonEncoder))
                shelters_list.append(shelter_dict)

            # first, remove _id field from each object in shifts_list
            # because we want the _id field from the commitment
            # and not the shift
            for shift in shifts_list:
                if "_id" in shift:
                    del shift["_id"]
            # now we can merge the shifts_list into the commitments_list
            # by copying the fields of each shift into the commitment
            for i in range(len(commitments_list)):
                commitments_list[i].update({**shifts_list[i]})

            # merge the shelters data into the commitments_list
            # shelter_list might not be the same size as commitments_list
            # because there may be multiple commitments for the same shelter
            # so we will have to check if the shelter_id is the same
            # and then merge the data
            # add a new field: shelter in the commitment data
            shelters_dict = {
                shelter["_id"]: shelter for shelter in shelters_list
            }
            for commitment in commitments_list:
                shelter_id = commitment.get("shelter_id")
                if shelter_id in shelters_dict:
                    commitment.update({"shelter": shelters_dict[shelter_id]})
        return Response(
            json.dumps(
                commitments_list, default=str
            ),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS])
    except ValueError as error:
        return (
            jsonify({"error": str(error)}),
            HTTP_STATUS_CODES_MAPPING[ResponseTypes.AUTHORIZATION_ERROR],
        )
    except KeyError as error:
        return (
            jsonify({"error": f"Missing key: {str(error)}"}),
            HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )

# Add a DELETE /service_commitment/<COMMITMENT_ID>
@service_commitment_bp.route(
    "/service_commitment/<commitment_id>", methods=["DELETE"]
)
@token_required_with_request
def delete_service_commitment_by_id(user_email, commitment_id):
    """
    Handle DELETE request to remove a service commitment.
    """
    try:
        response = delete_service_commitment(
            commitments_repo,
            commitment_id,
            user_email)
        response_code = response["response_code"]
        # remove "response_code" from the response
        del response["response_code"]
        return Response(
            json.dumps(response, default=str),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[response_code])

    except ValueError as error:
        return (
            jsonify({"error": str(error)}),
            HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )
    except KeyError as error:
        return (
            jsonify({"error": f"Missing key: {str(error)}"}),
            HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
        )

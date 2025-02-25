"""
Module for handling service commitment API endpoints.
Provides endpoints for creating and retrieving service commitments.
"""
import json
from flask import Blueprint, request, Response, jsonify
from domains.service_commitment import ServiceCommitment

from application.rest.work_shift import (
    get_user_from_token, HTTP_STATUS_CODES_MAPPING, ResponseTypes
)
from use_cases.add_service_commitments import add_service_commitments
from use_cases.list_service_commitments import list_service_commitments
from repository.mongo.service_commitments import MongoRepoCommitments
from serializers.service_commitment import ServiceCommitmentJsonEncoder

service_commitment_bp = Blueprint("service_commitment", __name__)

repo = MongoRepoCommitments()

@service_commitment_bp.route("/service_commitment", methods=["POST"])
def create_service_commitment():
    """
    Handle POST request to create service commitments.
    Extract user info from Authorization token and create commitments.
    """
    try:
        user_tuple = get_user_from_token(request.headers)
        # get_user_from_token returns a tuple of (email, first_name, last_name)
        if not user_tuple or not isinstance(user_tuple, tuple):
            return (
                jsonify({"error": "Invalid token"}),
                HTTP_STATUS_CODES_MAPPING[ResponseTypes.AUTHORIZATION_ERROR],
            )
        user_email = user_tuple[0]  # First element of tuple is the email
        if not isinstance(user_email, str):
            return (
                jsonify({"error": "Invalid email format"}),
                HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
            )
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

        response = add_service_commitments(repo, commitments_as_obj)
        return Response(
            json.dumps(response, default=str),
            mimetype="application/json",
            status = HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]
        )
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

@service_commitment_bp.route("/service_commitment", methods=["GET"])
def fetch_service_commitments():
    """
    Handle GET request to retrieve service commitments for a user.
    """
    try:
        user_tuple = get_user_from_token(request.headers)
        # get_user_from_token returns a tuple of (email, first_name, last_name)
        if not user_tuple or not isinstance(user_tuple, tuple):
            return (
                jsonify({"error": "Invalid token"}),
                HTTP_STATUS_CODES_MAPPING[ResponseTypes.AUTHORIZATION_ERROR],
            )
        user_email = user_tuple[0]  # First element of tuple is the email
        if not isinstance(user_email, str):
            return (
                jsonify({"error": "Invalid email format"}),
                HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
            )
        commitments = list_service_commitments(repo, user_email)

        commitments_as_json = [
            json.dumps(commitment, cls = ServiceCommitmentJsonEncoder)
            for commitment in commitments
        ]
        return Response(
            commitments_as_json,
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

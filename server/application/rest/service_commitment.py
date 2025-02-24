"""
Module for handling service commitment API endpoints.
Provides endpoints for creating and retrieving service commitments.
"""
from flask import Blueprint, request, jsonify
from application.rest.work_shift import get_user_from_token, HTTP_STATUS_CODES_MAPPING, ResponseTypes
from use_cases.add_service_commitments import add_service_commitments, get_service_commitments
from repository.mongodb.service_commitments import MongoRepoCommitments  # Adjust the import path as needed

blueprint = Blueprint("service_commitment", __name__)

repo = MongoRepoCommitments()

@blueprint.route("/service_commitment", methods=["POST"])
def create_service_commitment():
    """
    Handle POST request to create service commitments.
    Extract user info from Authorization token and create commitments.
    """
    try:
        user_email = get_user_from_token(request.headers)
        
        request_data = request.get_json()
        if not isinstance(request_data, list):
            return jsonify(
                {"error": "Invalid request format, expected a list"}), \
                HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]

        # Pass the repo object to the use case function
        commitments = add_service_commitments(repo, user_email, request_data)
        return jsonify(commitments), \
            HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]

    except ValueError as e:
        return jsonify({"error": str(e)}), \
            HTTP_STATUS_CODES_MAPPING[ResponseTypes.AUTHORIZATION_ERROR]
    except KeyError as e:
        return jsonify({"error": f"Missing key: {str(e)}"}), \
            HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]

@blueprint.route("/service_commitment", methods=["GET"])
def fetch_service_commitments():
    """
    Handle GET request to retrieve service commitments for a user.
    """
    try:
        user_email = get_user_from_token(request.headers)
        # Pass the repo object to the use case function
        commitments = get_service_commitments(repo, user_email)
        return jsonify(commitments), \
            HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]

    except ValueError as e:
        return jsonify({"error": str(e)}), \
            HTTP_STATUS_CODES_MAPPING[ResponseTypes.AUTHORIZATION_ERROR]
    except KeyError as e:
        return jsonify({"error": f"Missing key: {str(e)}"}), \
            HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]
    
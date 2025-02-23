"""
Module for handling service commitment API endpoints.
Provides endpoints for creating and retrieving service commitments.
"""
from flask import Blueprint, request, jsonify
from application.rest.work_shift import get_user_from_token
from use_cases.add_service_commitments import add_service_commitments, get_service_commitments
from repository.mongodb.service_commitments import MongoRepoCommitments  # Adjust the import path as needed

blueprint = Blueprint("service_commitment", __name__)

# Create a MongoRepoCommitments object to connect to the database.
repo = MongoRepoCommitments()

@blueprint.route("/service_commitment", methods=["POST"])
def create_service_commitment():
    """
    Handle POST request to create service commitments.
    Extract user info from Authorization token and create commitments.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return jsonify({"error": "Missing Authorization token"}), 401

    user_email = get_user_from_token(auth_header)
    if not user_email:
        return jsonify({"error": "Invalid Authorization token"}), 403

    try:
        request_data = request.get_json()
        if not isinstance(request_data, list):
            return jsonify({"error": "Invalid request format, expected a list"}), 400

        # Pass the repo object to the use case function
        commitments = add_service_commitments(repo, user_email, request_data)
        return jsonify(commitments), 201

    except ValueError as e:
        return jsonify({"error": f"Value error: {str(e)}"}), 400
    except KeyError as e:
        return jsonify({"error": f"Missing key: {str(e)}"}), 400

@blueprint.route("/service_commitment", methods=["GET"])
def fetch_service_commitments():
    """
    Handle GET request to retrieve service commitments for a user.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return jsonify({"error": "Missing Authorization token"}), 401

    user_email = get_user_from_token(auth_header)
    
    if not user_email:
        return jsonify({"error": "Invalid Authorization token"}), 403

    try:
        # Pass the repo object to the use case function
        commitments = get_service_commitments(repo, user_email)
        return jsonify(commitments), 200

    except ValueError as e:
        return jsonify({"error": f"Value error: {str(e)}"}), 400
    except KeyError as e:
        return jsonify({"error": f"Missing key: {str(e)}"}), 400
    
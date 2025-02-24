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
        user_info = get_user_from_token(request.headers)
        user_email = user_info.get("email")  # Ensure only the email is extracted
        if not user_email:
            return jsonify({"error": "User email not found in token"}), \
                HTTP_STATUS_CODES_MAPPING[ResponseTypes.AUTHORIZATION_ERROR]
        
        request_data = request.get_json()
        if not isinstance(request_data, list):
            return jsonify(
                {"error": "Invalid request format, expected a list"}), \
                HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]

        # Pass the repo object to the use case function without generating service_commitment_id
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
        user_info = get_user_from_token(request.headers)
        user_email = user_info.get("email")  # Ensure only the email is extracted
        if not user_email:
            return jsonify({"error": "User email not found in token"}), \
                HTTP_STATUS_CODES_MAPPING[ResponseTypes.AUTHORIZATION_ERROR]
        
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

"""
Module for handling service commitments.
Provides functions to create and retrieve service commitments for users.
"""

def add_service_commitments(repo, user_email, shifts):
    """
    Creates service commitments for the given user and shifts.

    Args:
        repo: A repository object that provides 
        an insert_service_commitments method.
        user_email (str): The user's email.
        shifts (list): A list of shift dictionaries.

    Returns:
        list: A list of dictionaries indicating
        the success and service commitment IDs.
    """
    commitments = []
    for shift in shifts:
        if "service_shift_id" not in shift:
            continue

        commitment = {
            "service_shift_id": shift["service_shift_id"],
            "user_email": user_email
        }
        commitments.append(commitment)
    
    # Insert into repository (which should generate the ID)
    inserted_commitments = repo.insert_service_commitments(commitments)

    return [{
        "service_commitment_id": c["_id"],  # Use the _id assigned by the repository
        "success": True
    } for c in inserted_commitments]

def get_service_commitments(repo, user_email):
    """
    Retrieves all service commitments for a given user.

    Args:
        repo: A repository object that provides a 
        fetch_service_commitments method.
        user_email (str): The user's email.

    Returns:
        list: A list of service commitment dictionaries 
        with IDs and associated service shift IDs.
    """
    commitments = repo.fetch_service_commitments(user_email)
    return [{"service_commitment_id": c["_id"],  # Ensure the returned ID is correct
             "service_shift_id": c["service_shift_id"]}
            for c in commitments]

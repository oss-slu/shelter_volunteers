from flask import Blueprint, request, jsonify
from .work_shift import get_user_from_token
from application.use_cases.add_service_commitments import add_service_commitments


blueprint = Blueprint("service_commitment", __name__)

@blueprint.route("service_commitment", methods=["POST"])
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

        commitments = add_service_commitments(user_email, request_data)
        return jsonify(commitments), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


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
        commitments = get_service_commitments(user_email)
        return jsonify(commitments), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

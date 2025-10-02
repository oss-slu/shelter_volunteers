"""
This module is responsible for handling the login request.
"""
import os
from flask import Blueprint, Response, request, current_app
from flask_cors import cross_origin
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from responses import ResponseTypes
from authentication.google_authentication import verify_google_token
from authentication.token import create_token
import json



login_blueprint = Blueprint("login", __name__)
@login_blueprint.route("/login", methods=["POST"])
@cross_origin()
def login():
    data = request.get_json()
    id_token_str = data.get("idToken")
    if not id_token_str:
        return Response([],
            mimetype="application/json",
            status = HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]
        )
    try:
        # Verify Google token
        jwt_secret = current_app.config.get("JWT_SECRET")
        google_client_id = os.environ.get("GOOGLE_CLIENT_ID")

        user_data = verify_google_token(id_token_str, google_client_id)
        token = create_token(user_data, jwt_secret)

        return Response(json.dumps(
            {"access_token": token}),
            mimetype="application/json",
            status = HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]
        )
    except ValueError as e:
        return Response(json.dumps({"error": str(e)}),
            mimetype="application/json",
            status = HTTP_STATUS_CODES_MAPPING[ResponseTypes.AUTHORIZATION_ERROR]
        )

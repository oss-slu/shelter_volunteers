"""
This module is responsible for handling the login request.
"""
import os
from flask import Blueprint, Response, request, current_app
from flask_cors import cross_origin
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from responses import ResponseTypes
from authentication.google_authentication import verify_google_token
from authentication.local_admin import MAX_PASSWORD_LENGTH, authenticate_admin
from authentication.token import create_token
from requests.exceptions import HTTPError, RequestException
from use_cases.authenticate import get_user, login_user
import json


def _json_response(data, response_type):
    return Response(
        json.dumps(data),
        mimetype="application/json",
        status=HTTP_STATUS_CODES_MAPPING[response_type],
    )


login_blueprint = Blueprint("login", __name__)
@login_blueprint.route("/login", methods=["POST"])
@cross_origin()
def login():
    data = request.get_json(silent=True) or {}
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

        return _json_response(
            {"access_token": token},
            ResponseTypes.SUCCESS,
        )
    except ValueError as e:
        return Response(json.dumps({"error": str(e)}),
            mimetype="application/json",
            status = HTTP_STATUS_CODES_MAPPING[ResponseTypes.AUTHORIZATION_ERROR]
        )


@login_blueprint.route("/login/local-admin", methods=["POST"])
def local_admin_login():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        data = {}
    email = data.get("email")
    password = data.get("password")
    if (
        not isinstance(email, str)
        or not email.strip()
        or len(email) > 254
        or not isinstance(password, str)
        or not password
        or len(password) > MAX_PASSWORD_LENGTH
    ):
        return _json_response(
            {"message": "Valid email and password are required"},
            ResponseTypes.PARAMETER_ERROR,
        )
    email = email.strip()
    if not authenticate_admin(email, password):
        return _json_response(
            {"message": "Invalid credentials or sign-in temporarily unavailable"},
            ResponseTypes.AUTHORIZATION_ERROR,
        )
    token = create_token({"email": email}, current_app.config.get("JWT_SECRET"))
    return _json_response(
        {"access_token": token, "user": {"email": email, "name": email, "picture": ""}},
        ResponseTypes.SUCCESS,
    )


@login_blueprint.route("/login/password", methods=["POST"])
def password_login():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")
    if (
        not isinstance(email, str)
        or not email.strip()
        or not isinstance(password, str)
        or not password
    ):
        return _json_response(
            {"message": "Email and password are required"},
            ResponseTypes.PARAMETER_ERROR,
        )

    try:
        token_response = login_user(email.strip(), password)
        access_token = token_response.json().get("access_token")
        if not access_token:
            current_app.logger.error(
                "GetHelp OAuth response did not contain an access token"
            )
            return _json_response(
                {"message": "Unable to complete sign-in"},
                ResponseTypes.SYSTEM_ERROR,
            )

        user_info = get_user(access_token)
        user_email = user_info.get("email")
        if not isinstance(user_email, str) or not user_email.strip():
            current_app.logger.error(
                "GetHelp user profile did not contain an email"
            )
            return _json_response(
                {"message": "Unable to complete sign-in"},
                ResponseTypes.SYSTEM_ERROR,
            )

        user = {
            "email": user_email.strip(),
            "name": " ".join(
                part
                for part in (
                    user_info.get("firstName", ""),
                    user_info.get("lastName", ""),
                )
                if isinstance(part, str) and part.strip()
            ),
            "picture": "",
        }
        app_token = create_token(
            {"email": user["email"]},
            current_app.config.get("JWT_SECRET"),
        )
        return _json_response(
            {"access_token": app_token, "user": user},
            ResponseTypes.SUCCESS,
        )
    except RuntimeError:
        current_app.logger.exception("GetHelp OAuth is not configured")
        return _json_response(
            {"message": "Admin email sign-in is not configured"},
            ResponseTypes.SYSTEM_ERROR,
        )
    except HTTPError as error:
        if error.response is not None and error.response.status_code in (400, 401):
            return _json_response(
                {"message": "Invalid email or password"},
                ResponseTypes.AUTHORIZATION_ERROR,
            )
        current_app.logger.exception("GetHelp sign-in request failed")
        return _json_response(
            {"message": "Unable to verify sign-in with GetHelp"},
            ResponseTypes.SYSTEM_ERROR,
        )
    except RequestException:
        current_app.logger.exception("GetHelp sign-in service is unavailable")
        return _json_response(
            {"message": "GetHelp sign-in is temporarily unavailable"},
            ResponseTypes.SYSTEM_ERROR,
        )

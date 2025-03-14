"""
This module is responsible for handling the login request.
"""
from flask import Blueprint, Response, request, current_app
from flask_cors import cross_origin
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from responses import ResponseTypes
from authentication.authenticate_user import authenticate_user
import json

login_blueprint = Blueprint("login", __name__)
@login_blueprint.route("/login", methods=["POST"])
@cross_origin()
def login():
    data = request.get_json()
    if not ("username" in data and "password" in data):
        return Response([],
            mimetype="application/json",
            status = HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]
        )
    token = authenticate_user(
        data.get("username"),
        data.get("password"),
        current_app.config["DEBUG"]
        )
    if token:
        return Response(json.dumps(
            {"access_token": token}),
            mimetype="application/json",
            status = HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]
            )
    else:
        return Response([],
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.AUTHORIZATION_ERROR]
            )

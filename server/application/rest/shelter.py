"""
This module contains the RESTful route handlers
for shelters in the server application.
"""
import json

from flask import Blueprint, Response, request
from flask_cors import cross_origin

from authentication.authenticate_user import get_user_from_token

from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING

from domains.resources import Resources
from domains.shelter.shelter import Shelter

from repository.mongo.shelter import ShelterRepo

from responses import ResponseTypes

from serializers.shelter import ShelterJsonEncoder

from use_cases.authorization.is_authorized import is_authorized
from use_cases.shelters.add_shelter_use_case import shelter_add_use_case
from use_cases.shelters.list_shelters_use_case import shelter_list_use_case


shelter_blueprint = Blueprint("shelter", __name__)

@shelter_blueprint.route("/shelter", methods=["GET", "POST"])
@cross_origin()
def shelter():
    """
    On GET: The function returns a list of all shelters in the system.
        Required permissions: READ access to Resources.SHELTER or system admin
    
    On POST: The function adds a shelter to the system.
        Required permissions: WRITE access to Resources.SHELTER or system admin
    """
    repo = ShelterRepo()

    # Authentication check
    auth_token = request.headers.get("Authorization")
    if not auth_token:
        return Response(
            json.dumps({"message": "Authentication required"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[
                ResponseTypes.UNAUTHORIZED])
    # Get the user email from the token
    user_email = get_user_from_token(auth_token)
    if not user_email:
        return Response(
            json.dumps({"message": "Invalid authentication token"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.UNAUTHORIZED]
        )

    if request.method == "GET":
        # Authorization check for viewing shelters
        if not is_authorized(repo, user_email, Resources.SHELTER):
            return Response(
                json.dumps({"message": "Unauthorized to view shelters"}),
                mimetype="application/json",
                status=HTTP_STATUS_CODES_MAPPING[
                    ResponseTypes.FORBIDDEN])
        shelters_as_dict = shelter_list_use_case(repo)
        shelters_as_json = json.dumps(
            [shelter for shelter in shelters_as_dict], cls=ShelterJsonEncoder
        )
        return Response(
            shelters_as_json,
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]
        )
    elif request.method == "POST":
        # Authorization check for adding shelters
        if not is_authorized(repo, user_email, Resources.SHELTER):
            return Response(
                json.dumps({"message": "Unauthorized to add shelters"}),
                mimetype="application/json",
                status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.FORBIDDEN]
            )
        shelter_data_dict = request.get_json()
        # shelter_add_use_case expects a Shelter object
        shelter_obj = Shelter.from_dict(shelter_data_dict)
        add_response = shelter_add_use_case(repo, shelter_obj)
        status_code = HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]
        if add_response["success"]:
            status_code = HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]
        return Response(
            json.dumps(add_response, default=str),
            mimetype="application/json",
            status=status_code
        )

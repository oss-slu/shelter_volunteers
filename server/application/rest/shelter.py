"""
This module contains the RESTful route handlers
for shelters in the server application.
"""
import json
from flask import Blueprint, Response, request
from repository.mongo.shelter import ShelterRepo
from use_cases.shelters.add_shelter_use_case import shelter_add_use_case
from use_cases.shelters.get_shelter_by_id import get_shelter_by_id
from use_cases.shelters.list_shelters_use_case import shelter_list_use_case
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from application.rest.system_admin_permission_required import system_admin_permission_required
from domains.shelter.shelter import Shelter
from serializers.shelter import ShelterJsonEncoder
from responses import ResponseTypes

shelter_blueprint = Blueprint("shelter", __name__)

repo = ShelterRepo()


@shelter_blueprint.route("/shelters", methods=["GET"])
def get_shelters():
    """
    Returns a list of all shelters in the system.
    No authentication is required to access this endpoint.
    GET requests can be made to retrieve the list of shelters.
    """
    shelters_as_dict = shelter_list_use_case(repo)
    shelters_as_json = json.dumps(
        [shelter for shelter in shelters_as_dict], cls=ShelterJsonEncoder
    )
    return Response(
        shelters_as_json,
        mimetype="application/json",
        status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]
    )


@shelter_blueprint.route("/shelters/<shelter_id>", methods=["GET"])
def get_shelter(shelter_id: str):
    """
    Returns shelter info by its id
    """
    shelter = get_shelter_by_id(shelter_id, repo)
    if not shelter:
        return Response(
            json.dumps({"error": "shelter_id is not found"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.NOT_FOUND]
        )
    return Response(
        json.dumps(shelter, cls=ShelterJsonEncoder),
        mimetype="application/json",
        status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]
    )


@shelter_blueprint.route("/shelters", methods=["POST"])
@system_admin_permission_required
def add_shelter():
    """
    Adds a shelter to the system.
    POST requests can be made by authenticated users with 
    system admin permissions to add a new shelter.
    """
    try:
        shelter_data_dict = request.get_json()
        # shelter_add_use_case expects a Shelter object
        shelter_obj = Shelter.from_dict(shelter_data_dict)
        add_response = shelter_add_use_case(repo, shelter_obj)
        status_code = HTTP_STATUS_CODES_MAPPING[
            ResponseTypes.PARAMETER_ERROR]
        if add_response["success"]:
            status_code = HTTP_STATUS_CODES_MAPPING[
                ResponseTypes.SUCCESS]
        return Response(
            json.dumps(add_response, default=str),
            mimetype="application/json",
            status=status_code
        )
    except ValueError as e:
        # for validation errors
        error_response = {
            "success": False,
            "message": str(e)
        }
        return Response(
            json.dumps(error_response),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[
                ResponseTypes.PARAMETER_ERROR]
        )

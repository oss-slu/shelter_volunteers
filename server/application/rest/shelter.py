"""
This module contains the RESTful route handlers
for shelters in the server application.
"""
import json
from flask import Blueprint, Response, request
from flask_cors import cross_origin
from repository.mongo.shelter import ShelterRepo
from use_cases.shelters.add_shelter_use_case import shelter_add_use_case
from use_cases.shelters.list_shelters_use_case import shelter_list_use_case
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from domains.shelter.shelter import Shelter
from serializers.shelter import ShelterJsonEncoder
from responses import ResponseTypes


shelter_blueprint = Blueprint("shelter", __name__)
@shelter_blueprint.route("/shelter", methods=["GET", "POST"])
@cross_origin()
def shelter():
    """
    On GET: The function returns a list of all shelters in the system.
    On POST: The function adds a shelter to the system.
    """
    repo = ShelterRepo()

    # add user authentication and authorization logic here

    if request.method == "GET":
        # process the GET request parameters
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
        shelter_data_dict = request.get_json()
        
        # Validate required top-level fields
        if not shelter_data_dict:
            return Response(
                json.dumps({"success": False, "message": "No data provided"}),
                mimetype="application/json",
                status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]
            )
        
        if 'name' not in shelter_data_dict or not shelter_data_dict['name']:
            return Response(
                json.dumps({"success": False, "message": "Missing required field: name"}),
                mimetype="application/json",
                status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]
            )
        
        try:
            # shelter_add_use_case expects a Shelter object
            shelter_obj = Shelter.from_dict(shelter_data_dict)
            add_response = shelter_add_use_case(repo, shelter_obj)
            status_code = HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS] if add_response["success"] else HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]
        except ValueError as e:
            # Handle validation errors from Shelter.from_dict
            add_response = {"success": False, "message": str(e)}
            status_code = HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]
        
        return Response(
            json.dumps(add_response, default=str),
            mimetype="application/json",
            status=status_code
        )

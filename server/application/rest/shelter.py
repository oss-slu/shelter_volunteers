import json

import requests

from flask import Blueprint, Response, request
from flask_cors import cross_origin

from repository.shelter_repo import ShelterRepo
from use_cases.list_shelters import shelter_list_use_case
from serializers.shelter import ShelterJsonEncoder

blueprint = Blueprint("shelter", __name__)

api_url = "https://api2-qa.gethelp.com/v2/facilities"

@blueprint.route("/shelters", methods=["GET"])
@cross_origin()
def list_shelters():
    new_url = api_url + "?page=0&pageSize=20&radius=50"
    latitude = request.args.get('latitude', None)
    longitude = request.args.get('longitude', None)
    radius = request.args.get('radius', None)
    if latitude is not None: new_url += "&latitude=" + latitude
    if longitude is not None: new_url += "&longitude=" + longitude
    new_url += "&radius="
    if radius is not None: new_url += radius
    else: new_url += "50"
    response = requests.get(new_url)
    shelters = response.json()["content"]
    repo = ShelterRepo(shelters)
    result = shelter_list_use_case(repo)
    return Response(
        json.dumps(result, cls=ShelterJsonEncoder),
        mimetype="application/json",
        status=200,
    ) 

from use_cases.authorization.is_authorized import is_authorized
from domains.resources import Resources
from repository.mongo.user import UserRepo  # assuming you have this
from application.rest.auth_helpers import get_user_email_from_auth_header


@shelter_blueprint.route("/shelter", methods=["GET", "POST"])
@cross_origin()
def shelter():
    repo = ShelterRepo()
    user_repo = UserRepo()  # needed for permission checks

    user_email = get_user_email_from_auth_header()
    if not user_email:
        return Response(
            json.dumps({"error": "Unauthorized"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.UNAUTHORIZED]
        )

    if not is_authorized(user_repo, user_email, Resources.SHELTER):
        return Response(
            json.dumps({"error": "Forbidden"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.UNAUTHORIZED]
        )

    if request.method == "GET":
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

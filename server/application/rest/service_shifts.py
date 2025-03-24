from use_cases.authorization.is_authorized import is_authorized
from domains.resources import Resources
from repository.mongo.user import UserRepo  # assuming you have this

@service_shift_bp.route("/service_shift", methods=["GET", "POST"])
@cross_origin()

def handle_service_shift():
    repo = ServiceShiftsMongoRepo()
    user_repo = UserRepo()

    user_email = get_user_email_from_auth_header()
    if not user_email:
        return Response(
            json.dumps({"error": "Unauthorized"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.UNAUTHORIZED]
        )

    shelter_id_str = request.args.get("shelter_id") if request.method == "GET" else None
    if request.method == "POST":
        payload = request.get_json()
        if payload and isinstance(payload, list) and "shelter_id" in payload[0]:
            shelter_id_str = str(payload[0]["shelter_id"])

    shelter_id = int(shelter_id_str) if shelter_id_str and shelter_id_str.isdigit() else None

    if not is_authorized(user_repo, user_email, Resources.SHELTER, shelter_id):
        return Response(
            json.dumps({"error": "Forbidden"}),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.UNAUTHORIZED]
        )

    if request.method == "GET":
        filter_start_after_str = request.args.get("filter_start_after")
        filter_start_after = (
            int(filter_start_after_str)
            if filter_start_after_str and filter_start_after_str.isdigit()
            else None
        )

        shifts = service_shifts_list_use_case(repo, shelter_id, filter_start_after)

        return Response(
            json.dumps(shifts, cls=ServiceShiftJsonEncoder),
            mimetype="application/json",
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS],
        )

    if request.method == "POST":
        shifts_as_dict = request.get_json()
        if not shifts_as_dict:
            return Response(
                json.dumps({"message": "Invalid JSON object"}),
                mimetype="application/json",
                status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR],
            )

        try:
            shifts_obj = [
                ServiceShift.from_dict(shift)
                for shift in shifts_as_dict
            ]
        except (KeyError, TypeError, ValueError) as err:
            return Response(
                json.dumps({"error": f"Invalid data format: {str(err)}"}),
                mimetype="application/json",
                status=400,
            )

        add_response = shift_add_use_case(repo, shifts_obj)
        status_code = (
            HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]
            if add_response.get("success")
            else HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]
        )

        return Response(
            json.dumps(add_response, default=str),
            mimetype="application/json",
            status=status_code,
        )

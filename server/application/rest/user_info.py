import json

from flask import Blueprint, Response, request

from application.rest.shelter_admin_permission_required import shelter_admin_permission_required
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from application.rest.token_required import token_required_with_request
from domains.user_info import UserInfo
from repository.mongo.user_info_repository import UserInfoRepository
from responses import ResponseTypes
from use_cases.user_info.get_user_info_by_email import get_user_info_by_email
from use_cases.user_info.save_user_info import save_user_info

bp = Blueprint('user_info', __name__)
user_info_repo = UserInfoRepository()


@bp.patch('/user_info')
@token_required_with_request
def patch_user_info(user_email: str):
    user_info = get_user_info_by_email(user_email, user_info_repo)
    if user_info is None:
        return Response(status=404)

    data = request.get_json()
    if "first_name" in data:
        user_info.set_first_name(data["first_name"])
    if "last_name" in data:
        user_info.set_last_name(data["last_name"])
    if "phone_number" in data:
        user_info.set_phone_number(data["phone_number"])

    save_user_info(user_info, user_info_repo)
    return Response(status=200)

@bp.post('/user_info')
@token_required_with_request
def post_user_info(user_email: str):
    user_info = get_user_info_by_email(user_email, user_info_repo)
    if user_info is not None:
        return Response(status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.CONFLICT])

    data = request.get_json()
    user_info = UserInfo.from_dict(data)
    save_user_info(user_info, user_info_repo)
    return Response(status=200)

@bp.get('/user_info')
@token_required_with_request
def get_user_info(user_email: str):
    user_info = get_user_info_by_email(user_email, user_info_repo)
    if user_info is None:
        return Response(status=404)

    response = json.dumps(user_info.to_dict())
    return Response(response, status=200)

@bp.get('/user_info/<email>')
@token_required_with_request
@shelter_admin_permission_required
def get_user_info(email: str):
    # Here we give user info access to all shelter admins.
    # May want to limit this to only admins of users working for them.
    user_info = get_user_info_by_email(email, user_info_repo)
    if user_info is None:
        return Response(status=404)

    response = json.dumps(user_info.to_dict())
    return Response(response, status=200)
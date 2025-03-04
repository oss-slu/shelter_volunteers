import json
from flask import Blueprint, request, Response
from use_cases.authorization.permission_manager import PermissionManager
from application.rest.work_shift import get_user_from_token
from repository.mongo.authorization import PermissionsMongoRepo
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from serializers.user_permission import UesrPermissionJsonEncoder
from responses import ResponseTypes

authorization_blueprint = Blueprint("authorization", __name__)
permissions_repo = PermissionsMongoRepo()
permission_manager = PermissionManager(permissions_repo)

@authorization_blueprint.route("/user_permission", methods=['GET', 'POST'])
def permission():
    user = get_user_from_token(request.headers)
    if user is None:
        return Response(
            json.dumps({'message': 'Unauthorized'}),
            mimetype='application/json',
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.UNAUTHORIZED]
        )
    user_id = user[0]   
    if request.method == 'GET':
        response = permission_manager.get_user_permissions(user_id)
        return Response(
            json.dumps(response.value, cls=UesrPermissionJsonEncoder),
            mimetype='application/json',
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]
        )

    if request.method == 'POST':
        data = request.get_json()
        shelter_id = data.get('shelter_id')
        user_email = data.get('user_email')
        permission_response = permission_manager.add_shelter_admin(shelter_id, user_email)
        return Response(
            json.dumps(permission_response.value),
            mimetype='application/json',
            status=HTTP_STATUS_CODES_MAPPING[permission_response.response_type]
        )

import json
from flask import Blueprint, request, Response
from use_cases.authorization.add_shelter_admin import add_shelter_admin
from use_cases.authorization.add_system_admin import add_system_admin
from use_cases.authorization.get_user_permission import get_user_permission
from use_cases.authorization.is_authorized import is_authorized
from application.rest.work_shift import get_user_from_token
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from repository.mongo.authorization import PermissionsMongoRepo
from serializers.user_permission import UserPermissionJsonEncoder
from domains.resources import Resources
from responses import ResponseTypes

authorization_blueprint = Blueprint("authorization", __name__)
repo = PermissionsMongoRepo()

@authorization_blueprint.route("/user_permission", methods=['GET', 'POST'])
def permission():
    """
    Endpoint to manage user permissions.

    GET:
    - Retrieves the permissions of the user associated with the provided token.
    - Returns a JSON response with the user's permissions and a status code 
        indicating success.

    POST:
    - Adds a new permission for a user based on the provided resource type and 
        user email.
    - If the resource type is SYSTEM, the user is added as a system admin.
    - If the resource type is SHELTER, the user is added as a shelter admin for 
        the specified resource ID.
    - Returns a JSON response with the result of the permission addition and a 
        corresponding status code.

    Returns:
            Response: A Flask Response object containing the JSON data and HTTP 
            status code.

    Raises:
            Unauthorized: If the user token is invalid, missing, or the user is not 
            authorized to make this request.
    """
    user = get_user_from_token(request.headers)
    if user is None:
        return Response(
            json.dumps({'message': 'Unauthorized'}),
            mimetype='application/json',
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.UNAUTHORIZED]
        )
    user_id = user[0]   
    if request.method == 'GET':
        user_permission = get_user_permission(repo, user_id)
        return Response(
            json.dumps(user_permission, cls=UserPermissionJsonEncoder),
            mimetype='application/json',
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]
        )

    if request.method == 'POST':
        data = request.get_json()

        resource_type = data.get('resource_type')
        if resource_type not in Resources.values():
            return Response(
                json.dumps({'message': 'Invalid resource type'}),
                mimetype='application/json',
                status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]
            )
        resource_id = data.get('resource_id')
        if resource_type == Resources.SHELTER and not resource_id:
            return Response(
                json.dumps({'message': 'Resource ID is required for shelter'}),
                mimetype='application/json',
                status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]
            )

        if not is_authorized(repo, user_id, resource_type, resource_id):
            return Response(
                json.dumps({'message': 'Unauthorized'}),
                mimetype='application/json',
                status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.AUTHORIZATION_ERROR]
            )

        user_email = data.get('user_email')
        if not user_email:
            return Response(
                json.dumps({'message': 'User email is required'}),
                mimetype='application/json',
                status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]
            )

        response = None
        if resource_type == Resources.SYSTEM:
            response = add_system_admin(repo, user_email)
        elif resource_type == Resources.SHELTER:
            response = add_shelter_admin(repo, resource_id, user_email)
        return Response(
            json.dumps(response.value),
            mimetype='application/json',
            status=HTTP_STATUS_CODES_MAPPING[response.response_type]
        )

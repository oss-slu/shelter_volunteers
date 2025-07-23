"""
API endpoints for managing user permissions.
"""
import json
from flask import Blueprint, request, Response
from use_cases.authorization.add_shelter_admin import add_shelter_admin
from use_cases.authorization.add_system_admin import add_system_admin
from use_cases.authorization.get_user_permission import get_user_permission
from use_cases.authorization.get_system_admins import get_system_admins
from use_cases.authorization.get_shelter_admins import get_shelter_admins
from use_cases.authorization.is_authorized import is_authorized
from application.token_required import token_required_with_request
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from repository.mongo.authorization import PermissionsMongoRepo
from repository.mongo.shelter import ShelterRepo
from serializers.user_permission import UserPermissionJsonEncoder
from domains.resources import Resources
from responses import ResponseTypes

authorization_blueprint = Blueprint('authorization', __name__)
repo = PermissionsMongoRepo()
shelter_repo = ShelterRepo()

@authorization_blueprint.route('/system_admin', methods=['GET'])
@token_required_with_request
def system_admin(user_id):
    """
    Endpoint to retrieve all system administrators.
    This endpoint allows users with the appropriate permissions
    to fetch a list of all system administrators.
    Returns:
        Response: A Flask Response object containing the JSON data and HTTP status code.
    """
    if not is_authorized(repo, user_id, Resources.SYSTEM):
        return Response(
            json.dumps({'message': 'Unauthorized'}),
            mimetype='application/json',
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.UNAUTHORIZED]
        )

    system_admins = get_system_admins(repo)
    return Response(
        json.dumps(system_admins, cls=UserPermissionJsonEncoder),
        mimetype='application/json',
        status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]
    )

@authorization_blueprint.route('/shelter_admin', methods=['GET'])
@token_required_with_request
def shelter_admin(user_id):
    if not is_authorized(repo, user_id, Resources.SYSTEM):
        return Response(
            json.dumps({'message': 'Unauthorized'}),
            mimetype='application/json',
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.UNAUTHORIZED]
        )

    shelter_id = request.args.get('shelter_id')
    if not shelter_id:
        return Response(
            json.dumps({'error': 'shelter_id is required'}),
            mimetype='application/json',
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]
        )
    shelter_admins = get_shelter_admins(repo, shelter_id)
    return Response(
        json.dumps(shelter_admins, cls=UserPermissionJsonEncoder),
        mimetype='application/json',
        status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]
    )

@authorization_blueprint.route('/user_permission', methods=['GET', 'POST'])
@token_required_with_request
def permission(user_id):
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
            Unauthorized: If the user token is invalid, missing,
            or the user is not authorized to make this request.
    """
    if request.method == 'GET':
        user_permission = get_user_permission(repo, user_id, shelter_repo)
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
                status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.UNAUTHORIZED]
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

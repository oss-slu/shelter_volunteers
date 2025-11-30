"""
API endpoints for managing user permissions.
"""
import json
from flask import Blueprint, request, Response
from use_cases.authorization.add_shelter_admin import add_shelter_admin
from use_cases.authorization.add_system_admin import add_system_admin
from use_cases.authorization.remove_system_admin import remove_system_admin
from use_cases.authorization.remove_shelter_admin import remove_shelter_admin
from use_cases.authorization.get_user_permission import get_user_permission
from use_cases.authorization.get_system_admins import get_system_admins
from use_cases.authorization.get_shelter_admins import get_shelter_admins
from application.rest.system_admin_permission_required import system_admin_permission_required
from application.rest.shelter_admin_permission_required import shelter_admin_permission_required
from application.rest.token_required import token_required_with_request
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from repository.mongo.authorization import PermissionsMongoRepo
from repository.mongo.shelter import ShelterRepo
from serializers.user_permission import UserPermissionJsonEncoder
from responses import ResponseTypes

authorization_blueprint = Blueprint('authorization', __name__)
repo = PermissionsMongoRepo()
shelter_repo = ShelterRepo()

@authorization_blueprint.route('/system_admin', methods=['GET'])
@system_admin_permission_required
def retrieve_system_admins():
    """
    Endpoint to retrieve all system administrators.
    This endpoint allows users with the appropriate permissions
    to fetch a list of all system administrators.
    Returns:
        Response: A Flask Response object containing the JSON data and HTTP status code.
    """
    system_admins = get_system_admins(repo)
    return Response(
        json.dumps(system_admins, cls=UserPermissionJsonEncoder),
        mimetype='application/json',
        status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]
    )

@authorization_blueprint.route('/shelters/<shelter_id>/admin', methods=['GET'])
@shelter_admin_permission_required
def retrieve_shelter_admins(shelter_id):
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

@authorization_blueprint.route('/user_permission', methods=['GET'])
@token_required_with_request
def get_permissions(user_id):
    """
    Endpoint to manage user permissions.

    GET:
    - Retrieves the permissions of the user associated with the provided token.
    - Returns a JSON response with the user's permissions and a status code 
        indicating success.

    Returns:
            Response: A Flask Response object containing the JSON data and HTTP 
            status code.

    Raises:
            Unauthorized: If the user token is invalid, missing,
            or the user is not authorized to make this request.
    """
    user_permission = get_user_permission(repo, user_id, shelter_repo)
    return Response(
        json.dumps(user_permission, cls=UserPermissionJsonEncoder),
        mimetype='application/json',
        status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]
    )

@authorization_blueprint.route('/system_admin', methods=['POST'])
@system_admin_permission_required
def post_system_admin():
    """
    Endpoint to add a system admin permission for a user.
    Expects a JSON object with 'user_email' field.
    Returns a JSON response with the result of the permission addition and a 
    corresponding status code.
    """
    data = request.get_json()
    user_email = data.get('user_email')

    if not user_email:
        return Response(
            json.dumps({'message': 'User email is required'}),
            mimetype='application/json',
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]
        )

    response = add_system_admin(repo, user_email)
    return Response(
        json.dumps(response.value),
        mimetype='application/json',
        status=HTTP_STATUS_CODES_MAPPING[response.response_type]
    )

@authorization_blueprint.route('/system_admin', methods=['DELETE'])
@system_admin_permission_required
def delete_system_admin():
    """
    Endpoint to remove system admin permission from user.
    Expects a JSON object with 'user_email' field.
    Returns a JSON response with the result of the permission removal and a
    corresponding status code.
    """
    data = request.get_json()
    user_email = data.get('user_email')

    if not user_email:
        return Response(
            json.dumps({'message': 'User email is required'}),
            mimetype='application/json',
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]
        )

    response = remove_system_admin(repo, user_email)
    return Response(
        json.dumps(response.value),
        mimetype='application/json',
        status=HTTP_STATUS_CODES_MAPPING[response.response_type]
    )

@authorization_blueprint.route('/shelters/<shelter_id>/admin', methods=['POST'])
@shelter_admin_permission_required
def post_shelter_admin(shelter_id):
    """
    Endpoint to add a shelter admin permission for a user.
    Expects a JSON object with 'user_email' field.
    Returns a JSON response with the result of the permission addition and a 
    corresponding status code.
    """
    data = request.get_json()
    user_email = data.get('user_email')

    if not user_email:
        return Response(
            json.dumps({'message': 'User email is required'}),
            mimetype='application/json',
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]
        )

    response = add_shelter_admin(repo, shelter_id, user_email)
    return Response(
        json.dumps(response.value),
        mimetype='application/json',
        status=HTTP_STATUS_CODES_MAPPING[response.response_type]
    )

@authorization_blueprint.route('/shelters/<shelter_id>/admin', methods=['DELETE'])
@shelter_admin_permission_required
def delete_shelter_admin(shelter_id):
    """
    Endpoint to remove shelter admin permission for a user.
    Expects a JSON object with 'user_email' field.
    Returns a JSON response with the result of the permission removal and a 
    corresponding status code.
    """
    data = request.get_json()
    user_email = data.get('user_email')

    if not user_email:
        return Response(
            json.dumps({'message': 'User email is required'}),
            mimetype='application/json',
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]
        )

    response = remove_shelter_admin(repo, shelter_id, user_email)
    return Response(
        json.dumps(response.value),
        mimetype='application/json',
        status=HTTP_STATUS_CODES_MAPPING[response.response_type]
    )


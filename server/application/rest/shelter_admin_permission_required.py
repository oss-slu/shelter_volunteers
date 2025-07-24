"""
Wrapper for verifying that the user has shelter admin permissions.
"""
import json
from functools import wraps
from flask import Response
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from application.rest.token_required import token_required_with_request
from use_cases.authorization.is_authorized import is_authorized
from domains.resources import Resources
from repository.mongo.authorization import PermissionsMongoRepo
from responses import ResponseTypes

repo = PermissionsMongoRepo()
def shelter_admin_permission_required(f):
    @wraps(f)
    @token_required_with_request
    def decorated(user_email, *args, **kwargs):
        shelter_id = kwargs.get("shelter_id")
        # Check if the user has admin permissions
        if not is_authorized(repo, user_email, Resources.SHELTER, shelter_id):
            return Response(
                json.dumps({'message': 'Unauthorized'}),
                mimetype='application/json',
                status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.UNAUTHORIZED]
            )
        return f(*args, **kwargs)
    return decorated

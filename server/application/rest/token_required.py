"""
Wrapper for token verification that passes the user email to the route function.
"""
import json
from functools import wraps
from flask import request, Response, current_app
from authentication.token import get_email_from_token
from application.rest.status_codes import HTTP_STATUS_CODES_MAPPING
from responses import ResponseTypes

def token_required_with_request(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            jwt_secret = current_app.config.get('JWT_SECRET')
            # Pass request.headers to verify_token
            token = request.headers.get('Authorization')
            user_email = get_email_from_token(token, jwt_secret)
            # Pass user_data to the route function
            return f(user_email, *args, **kwargs)
        except ValueError:
            return Response(
                json.dumps({'message': 'Unauthorized'}),
                mimetype='application/json',
                status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.UNAUTHORIZED]
            )
    return decorated

import os
from functools import wraps
from flask import request, jsonify, current_app
from authentication.token import get_email_from_token

def token_required_with_request(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            JWT_SECRET = current_app.config.get('JWT_SECRET')
            # Pass request.headers to verify_token
            token = request.headers.get('Authorization')
            user_email = get_email_from_token(token, JWT_SECRET)
            # Pass user_data to the route function
            return f(user_email, *args, **kwargs)
        except ValueError as e:
            return jsonify({'error': str(e)}), 401
    return decorated

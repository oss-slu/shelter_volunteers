import os
from functools import wraps
from flask import request, jsonify
from authentication.token import get_email_from_token

JWT_SECRET = os.environ.get('JWT_SECRET')
def token_required_with_request(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            # Pass request.headers to verify_token
            token = request.headers.get('Authorization')
            user_email = get_email_from_token(token, JWT_SECRET)
            # Pass user_data to the route function
            return f(user_email, *args, **kwargs)
        except ValueError as e:
            return jsonify({'error': str(e)}), 401
    return decorated

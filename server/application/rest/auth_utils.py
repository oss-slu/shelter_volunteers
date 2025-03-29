"""
Authentication utilities for the REST API.
"""
import jwt
from flask import request, abort
from authentication.authenticate_user import get_user_from_token


# You might want to load this from environment variables in a real application
JWT_SECRET = "your-secret-key-here"

def get_user_from_token(token=None):
    """
    Extracts the user email from the Authorization token in the request header.
    
    Returns:
        str: The email of the authenticated user
        
    Raises:
        401: If no token is provided or token is invalid
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        abort(401, description="Authorization token required")
    
    # For development tokens (simplified)
    if auth_header.endswith('-developer-token'):
        return "developer@example.com"
    
    try:
        # Normal JWT token handling
        token = auth_header.split(" ")[1] if " " in auth_header else auth_header
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload.get("email")
    except (jwt.InvalidTokenError, IndexError):
        abort(401, description="Invalid authorization token")
    
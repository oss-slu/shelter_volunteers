"""
Functions to generate and verify JWT tokens for user authentication.
"""
from jwt import encode, decode, ExpiredSignatureError, InvalidTokenError
import time

def create_token(user_data, jwt_secret, expiration=3600):
    """
    Create a JWT token for the user data
    Args:
        user_data (dict): User data to encode in the token
        jwt_secret (str): Secret key to sign the token
        expiration (int): Token expiration time in seconds
    Returns:
        str: Encoded JWT token
    """
    if not isinstance(user_data, dict):
        raise ValueError('User data must be a dictionary')

    # Add expiration time to payload
    payload = user_data.copy()
    payload['exp'] = int(time.time()) + expiration

    # Encode the token
    token = encode(payload, jwt_secret, algorithm='HS256')
    return token

def get_email_from_token(token, jwt_secret):
    """
    Verify JWT token from request headers
    Returns user data if valid, raises exception if invalid
    """

    try:
        # Decode the token
        data = decode(
            token,
            jwt_secret,
            algorithms=['HS256'],
            options={'verify_signature': True}
        )
        return data['email']
    except ExpiredSignatureError:
        raise ValueError('Token has expired') from ExpiredSignatureError
    except InvalidTokenError:
        raise ValueError('Invalid token') from InvalidTokenError


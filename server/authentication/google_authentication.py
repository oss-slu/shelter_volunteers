"""
Function to verify Google OAuth2 tokens.
"""
from google.auth.transport import requests
from google.oauth2 import id_token

def verify_google_token(token, google_client_id):
    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), google_client_id
        )

        # Verify the issuer
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')

        return {
            'email': idinfo['email']
        }
    except ValueError as e:
        raise ValueError(f'Invalid token: {str(e)}') from e

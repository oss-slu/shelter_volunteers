"""
Function to verify Google OAuth2 tokens.
"""
from google.auth.transport import requests
from google.oauth2 import id_token

def verify_google_token(token, google_client_id):
    try:
        # Verify the token
        # Allow small clock drift (e.g. Docker VM clocks) so freshly issued
        # tokens aren't rejected as "used too early"
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), google_client_id,
            clock_skew_in_seconds=10
        )

        # Verify the issuer
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')

        return {
            'email': idinfo['email']
        }
    except ValueError as e:
        raise ValueError(f'Invalid token: {str(e)}') from e

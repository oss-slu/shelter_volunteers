
import os
from google.auth.transport import requests
from google.oauth2 import id_token

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
def verify_google_token(token):
    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), GOOGLE_CLIENT_ID
        )
        
        # Verify the issuer
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
            
        return {
            'email': idinfo['email']
        }
    except ValueError as e:
        raise Exception(f'Invalid token: {str(e)}')
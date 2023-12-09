"""
This module contains authentication related functions.
"""
import requests
import base64
import os

from requests.exceptions import HTTPError, Timeout, RequestException

def login_user(user, password):
    """
    The login function contacts GetHelp authentication API to retrieve
    a token for the given username and password.
    We are doing this on the server because login through GetHelp
    requires the use of GetHelp API token. We don't
    want to store this token on the client side.
    """

    url = 'https://oauth-qa.gethelp.com/api/oauth/token'
    get_help_token = os.environ['REACT_APP_GETHELP_AUTH_API_TOKEN']

    # Encode the authorization token
    auth_token = base64.b64encode(get_help_token.encode()).decode('utf-8')

    # Set up the headers and data
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': f'Basic {auth_token}'
    }
    data = {
        'grant_type': 'password',
        'username': user,
        'password': password
    }

    response = requests.post(url, headers=headers, data=data, timeout=10)
    return response

def get_user(token):
    try:
        response = requests.get(
            'https://api2-qa.gethelp.com/v1/users/current',
            headers={'Authorization': f'Bearer {token}'},
            timeout=10
        )
        response.raise_for_status()
        user_info = response.json()
        print(user_info)
        return user_info['id'], None
    except HTTPError as e:
        return None, f'HTTP error: {e}'
    except Timeout:
        return None, 'Timeout error'
    except RequestException:
        return None, 'Request error'

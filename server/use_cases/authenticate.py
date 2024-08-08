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

    usernm = 'gethelp-app'
    passwd = '48404D6351655468576D5A7134743777217A25432A462D4A614E645267556A58'
    credentials = f'{usernm}:{passwd}'

    # Encode the authorization token
    auth_token = base64.b64encode(credentials.encode()).decode('utf-8')

    # Set up the headers and data
    headers = {
        'Authorization': f'Basic {auth_token}',
        'Content-Type': 'application/x-www-form-urlencoded',
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
            os.environ['GETHELP_API'] + 'v1/users/current',
            headers={'Authorization': f'Bearer {token}'},
            timeout=10
        )
        response.raise_for_status()
        user_info = response.json()
        print(user_info)
        return (user_info['email'], user_info['firstName'],
            user_info['lastName'])
    except HTTPError as e:
        return None, f'HTTP error: {e}'
    except Timeout:
        return None, 'Timeout error'
    except RequestException:
        return None, 'Request error'

"""
This module contains authentication related functions.
"""
import requests
import base64
import os

from responses import ResponseSuccess, ResponseFailure
from requests.exceptions import HTTPError, Timeout, RequestException

def login(user, password):
    """
    The login function contacts GetHelp authentication API to retrieve
    a token for the given username and password. 
    We are doing this on the server because login through GetHelp 
    requires the use of GetHelp API token. We don't
    want to store this token on the client side.
    """

    url = 'https://oauth-qa.gethelp.com/api/oauth/token'
    getHelpToken = os.environ['REACT_APP_GETHELP_AUTH_API_TOKEN']

    # Encode the authorization token
    auth_token = base64.b64encode(getHelpToken.encode()).decode('utf-8')

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

    response = requests.post(url, headers=headers, data=data)

    if not response.ok:
        return ResponseFailure(response.status_code,
            "Unable to log in")

    # Parse the JSON response
    return ResponseSuccess(response.json())

def get_user(token):
    try:
        response = requests.get(
            "https://api2-qa.gethelp.com/v1/users/current",
            headers={"Authorization": f"Bearer {token}"}
        )
        response.raise_for_status()
        return response.json(), None
    except HTTPError as e:
        return None, f"HTTP error: {e}"
    except Timeout:
        return None, "Timeout error"
    except RequestException:
        return None, "Request error"


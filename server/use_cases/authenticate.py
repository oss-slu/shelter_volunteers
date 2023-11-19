"""
This module contains authentication related functions.
"""
import requests
import base64
import os

from responses import ResponseSuccess, ResponseFailure

def login_user(user, password):
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

    print(response)
    if not response.ok:
        return ResponseFailure(response.status_code,
            "Unable to log in")

    # Parse the JSON response
    return ResponseSuccess(response.json())

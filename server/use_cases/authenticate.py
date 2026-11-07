"""Authentication helpers for the GetHelp account service."""

import base64
import os

import requests


def login_user(user, password):
    """Exchange GetHelp credentials for an access token."""
    client_id = os.environ.get("GETHELP_OAUTH_CLIENT_ID")
    client_secret = os.environ.get("GETHELP_OAUTH_CLIENT_SECRET")
    if not client_id or not client_secret:
        raise RuntimeError("GetHelp OAuth client credentials are not configured")

    url = os.environ.get(
        "GETHELP_OAUTH_URL",
        "https://oauth-qa.gethelp.com/api/oauth/token",
    )
    credentials = f"{client_id}:{client_secret}"
    auth_token = base64.b64encode(credentials.encode()).decode("utf-8")
    headers = {
        "Authorization": f"Basic {auth_token}",
        "Content-Type": "application/x-www-form-urlencoded",
    }
    data = {
        "grant_type": "password",
        "username": user,
        "password": password,
    }

    response = requests.post(url, headers=headers, data=data, timeout=10)
    response.raise_for_status()
    return response


def get_user(token):
    """Return the GetHelp profile associated with an access token."""
    api_url = os.environ.get("GETHELP_API", "https://api2-qa.gethelp.com/")
    response = requests.get(
        f'{api_url.rstrip("/")}/v1/users/current',
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    response.raise_for_status()
    return response.json()

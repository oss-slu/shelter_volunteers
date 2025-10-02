"""
This module is responsible for authenticating users.
"""
import json

# Mock user database
with open("authentication/user_list.json", "r", encoding="utf-8") as file:
    users_db = json.load(file)

def authenticate_user(username: str, password: str, debug=False):
    # check if authentication should be bypassed for development purposes
    if (debug and password and username in users_db):
        _, _, token = users_db[username]
        return token
    else:
        return None

def get_user_from_token(headers: dict):
    token = headers.get("Authorization")
    if not token:
        return (None, None, None)
    # Reverse lookup to find the user by token

    for email, user_info in users_db.items():
        if user_info[2] == token:
            return (email, user_info[0], user_info[1])
    return (None, None, None)

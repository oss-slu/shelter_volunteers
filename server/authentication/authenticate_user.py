from typing import Optional
import json

# Mock user database
with open("authentication/user_list.json", "r", encoding="utf-8") as file:
    users_db = json.load(file)

def authenticate_user(username: str, password: str, debug=False) -> Optional[dict]:
    # check if authentication should be bypassed for development purposes
    if (debug and username in users_db):
        first_name, last_name, token = users_db[username]
        return token
    else:
        return None

def get_user_from_token(token: str):
    # Reverse lookup to find the user by token
    for email, user_info in users_db.items():
        if user_info[2] == token:
            return (email, user_info[0], user_info[1])
    return (None, None, None)
    
    # Return the user corresponding to the provided token
    return mock_token_user_mapping.get(token)

# Example usage
if __name__ == "__main__":
    token = authenticate_user("nhi.tran@slu.edu", "12343", True)
    print(token)
    user = get_user_from_token(token)
    print(user)

from flask import request

def authenticate_request():
    try:
        bearer_token = request.headers.get("Authorization")
        if bearer_token and bearer_token.startswith("Bearer "):
            email = bearer_token.split(" ")[1]
            return email
    except Exception as e:
        error_message = f"Authentication error: {str(e)}"
        pass

    return None

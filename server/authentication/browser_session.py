"""Browser session cookies and CSRF protection."""

from flask import current_app, request

COOKIE_NAME = "volunteer_session"
SESSION_HEADER = "X-Volunteer-Session"
SESSION_HEADER_VALUE = "1"
SESSION_SECONDS = 3600


def is_browser_session_request():
    return request.headers.get(SESSION_HEADER) == SESSION_HEADER_VALUE


def set_session_cookie(response, token):
    response.set_cookie(
        COOKIE_NAME, token, max_age=SESSION_SECONDS, httponly=True,
        secure=current_app.config.get("BROWSER_SESSION_COOKIE_SECURE", True),
        samesite="Lax", path="/",
    )
    response.headers["Cache-Control"] = "no-store"
    return response


def clear_session_cookie(response):
    response.delete_cookie(
        COOKIE_NAME, path="/", httponly=True,
        secure=current_app.config.get("BROWSER_SESSION_COOKIE_SECURE", True),
        samesite="Lax",
    )
    response.headers["Cache-Control"] = "no-store"
    return response

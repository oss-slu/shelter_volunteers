"""Adapt Vercel's public API prefix to the existing Flask routes."""


class ApiPrefixMiddleware:
    """Strip the public /api prefix before Flask matches a route."""

    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        path = environ.get("PATH_INFO", "")
        if path == "/api" or path.startswith("/api/"):
            environ = environ.copy()
            environ["SCRIPT_NAME"] = environ.get("SCRIPT_NAME", "") + "/api"
            environ["PATH_INFO"] = path[4:] or "/"
        return self.app(environ, start_response)

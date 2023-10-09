"""
This module defines the response classes and types for the server.

- ResponseSuccess: Represents a successful response.
- ResponseFailure: Represents a failed response.
- ResponseTypes: Enumerates possible response types/errors.
"""

class ResponseSuccess:
    def __init__(self, value=None):
        self.value = value
        self.response_type = ResponseTypes.SUCCESS

class ResponseFailure:
    def __init__(self, response_type, message):
        self.response_type = response_type
        self.message = message

class ResponseTypes:
    SYSTEM_ERROR = "SystemError"
    NOT_FOUND = "NotFound"
    AUTHORIZATION_ERROR = "AuthorizationError"
    PARAMETER_ERROR = "ParameterError"
    SUCCESS = "Success"


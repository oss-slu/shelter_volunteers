class ResponseSuccess:
    def __init__(self, value=None):
        self.value = value

class ResponseFailure:
    def __init__(self, response_type, message):
        self.response_type = response_type
        self.message = message

class ResponseTypes:
    SYSTEM_ERROR = "SystemError"
    NOT_FOUND = "NotFound"
    AUTHORIZATION_ERROR = "AuthorizationError"

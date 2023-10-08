"""
This module defines custom exceptions related to authentication errors.
"""

class AuthenticationError(Exception):
    """
    Exception raised for authentication errors.

    Attributes:
        message -- explanation of the error
    """

    def __init__(self, message="Authentication failed"):
        self.message = message
        super().__init__(self.message)

"""
This module defines custom exceptions related to resource not found errors.
"""

class NotFoundError(Exception):
    """
    Exception raised for resource not found errors.

    Attributes:
        message -- explanation of the error
    """

    def __init__(self, message="Resource not found"):
        self.message = message
        super().__init__(self.message)

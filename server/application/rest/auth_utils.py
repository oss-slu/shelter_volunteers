"""
Authentication utilities for the REST API.
"""
from authentication.authenticate_user import get_user_from_token

# Export the imported function so other modules can import it from here
__all__ = ['get_user_from_token']

# You can add other authentication utility functions here if needed

    
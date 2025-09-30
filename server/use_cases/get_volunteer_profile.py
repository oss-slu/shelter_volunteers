"""
Use case for retrieving volunteer profile information.

This module handles the business logic for fetching volunteer profile data
from the repository layer.
"""
def get_volunteer_profile(repo, email: str):
    """Return {name,email,phone} for the volunteer."""
    v = repo.get_volunteer_by_email(email)
    return {
        "name": getattr(v, "name", None) or v.get("name"),
        "email": getattr(v, "email", None) or v.get("email"),
        "phone": getattr(v, "phone", None) or v.get("phone"),
    }

"""
Use case for updating volunteer profile information.

This module handles the business logic for updating volunteer profile data,
including validation of email and phone number formats.
"""
import re

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
# Simple phone validation - just check for digits and common phone characters
PHONE_RE = re.compile(r"^[\+]?[0-9\s\-\(\)]+$")

def update_volunteer_profile(repo, current_email: str, name: str, email: str, phone: str):
    if not name:
        raise ValueError("Name is required.")
    if not EMAIL_RE.match(email or ""):
        raise ValueError("Invalid email format.")
    # Validate phone number with length check to prevent ReDoS
    if phone and (len(phone) < 7 or len(phone) > 20 or not PHONE_RE.match(phone)):
        raise ValueError("Invalid phone format.")
    repo.update_volunteer_contact(current_email, name=name, email=email, phone=phone)

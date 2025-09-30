import re

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
PHONE_RE = re.compile(r"^\+?[0-9\s().-]{7,20}$")

def update_volunteer_profile(repo, current_email: str, name: str, email: str, phone: str):
    if not name:
        raise ValueError("Name is required.")
    if not EMAIL_RE.match(email or ""):
        raise ValueError("Invalid email format.")
    if phone and not PHONE_RE.match(phone):
        raise ValueError("Invalid phone format.")
    repo.update_volunteer_contact(current_email, name=name, email=email, phone=phone)

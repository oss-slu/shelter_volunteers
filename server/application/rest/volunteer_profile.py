from flask import Blueprint, request, jsonify
from config.mongodb_config import get_db
import re

volunteer_profile_bp = Blueprint("volunteer_profile", __name__, url_prefix="/volunteer")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^[0-9\-\+\(\)\s]{0,20}$")

def _current_email():
    # If your auth middleware sets request.user_email, prefer that:
    email = getattr(request, "user_email", None)
    if not email:
        # Dev fallback: allow header for local testing
        email = request.headers.get("X-User-Email")
    return (email or "").strip().lower()

@volunteer_profile_bp.get("/profile")
def get_profile():
    email = _current_email()
    if not email:
        return jsonify({"message": "Unauthorized"}), 403

    db = get_db()
    doc = db.volunteers.find_one({"email": email}) or {}
    # Normalize fields
    payload = {
        "name": doc.get("name", ""),
        "email": doc.get("email", email),
        "phone": doc.get("phone", ""),
    }
    return jsonify(payload), 200

@volunteer_profile_bp.put("/profile")
def update_profile():
    email = _current_email()
    if not email:
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    new_email = (data.get("email") or "").strip().lower()
    phone = (data.get("phone") or "").strip()

    if not name:
        return jsonify({"message": "Name is required."}), 400
    if not EMAIL_RE.match(new_email):
        return jsonify({"message": "Invalid email."}), 400
    if not PHONE_RE.match(phone):
        return jsonify({"message": "Invalid phone number."}), 400

    db = get_db()

    # Ensure new email isn't used by someone else
    if new_email != email and db.volunteers.find_one({"email": new_email}):
        return jsonify({"message": "Email already in use."}), 409

    db.volunteers.update_one(
        {"email": email},
        {"$set": {"name": name, "email": new_email, "phone": phone}},
        upsert=True,
    )

    # Return the up-to-date record
    doc = db.volunteers.find_one({"email": new_email}) or {}
    return jsonify({
        "name": doc.get("name", name),
        "email": doc.get("email", new_email),
        "phone": doc.get("phone", phone),
    }), 200

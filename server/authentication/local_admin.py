"""Local administrator credentials and authentication."""

from datetime import datetime, timedelta, timezone

from werkzeug.security import check_password_hash, generate_password_hash

from config.mongodb_config import get_db
from domains.resources import Resources
from repository.mongo.authorization import PermissionsMongoRepo


MIN_PASSWORD_LENGTH = 12
MAX_PASSWORD_LENGTH = 1024
MAX_ATTEMPTS = 5
ATTEMPT_WINDOW = timedelta(minutes=15)
_DUMMY_HASH = generate_password_hash("dummy-password-for-timing")

def _is_admin(permissions):
    return permissions is not None and (
        permissions.is_system_admin()
        or any(
            access.resource_type == Resources.SHELTER
            and bool(access.resource_ids)
            for access in permissions.full_access
        )
    )


def set_admin_password(email, password):
    """Set a local password for an existing system or shelter administrator."""
    email = email.strip()
    if not email:
        raise ValueError("An admin email is required")
    if not MIN_PASSWORD_LENGTH <= len(password) <= MAX_PASSWORD_LENGTH:
        raise ValueError(
            f"Password must be between {MIN_PASSWORD_LENGTH} "
            f"and {MAX_PASSWORD_LENGTH} characters"
        )
    permissions = PermissionsMongoRepo().get_user_permissions(email)
    if not _is_admin(permissions):
        raise ValueError("Email must already have system-admin or shelter-admin permission")

    get_db().local_admin_credentials.update_one(
        {"_id": email},
        {"$set": {"password_hash": generate_password_hash(password)},
         "$unset": {"attempts": "", "window_started": ""}},
        upsert=True,
    )


def authenticate_admin(email, password):
    """Validate a local password for a currently authorized administrator."""
    credentials = get_db().local_admin_credentials
    now = datetime.now(timezone.utc)
    credentials.update_one(
        {
            "_id": email,
            "$or": [
                {"window_started": {"$exists": False}},
                {"window_started": {"$lte": now - ATTEMPT_WINDOW}},
            ],
        },
        {"$set": {"attempts": 0, "window_started": now}},
    )
    record = credentials.find_one_and_update(
        {"_id": email, "attempts": {"$lt": MAX_ATTEMPTS}},
        {"$inc": {"attempts": 1}},
    )
    stored_hash = record["password_hash"] if record else _DUMMY_HASH
    valid_password = check_password_hash(stored_hash, password)
    if not record or not valid_password:
        return False

    permissions = PermissionsMongoRepo().get_user_permissions(email)
    if not _is_admin(permissions):
        return False

    credentials.update_one(
        {"_id": email},
        {"$unset": {"attempts": "", "window_started": ""}},
    )
    return True

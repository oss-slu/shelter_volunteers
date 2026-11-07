"""Integration checks using an explicitly configured disposable MongoDB."""
# pylint: disable=redefined-outer-name,import-outside-toplevel

import os
import time
import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import pytest
from flask import Flask
from pymongo import MongoClient

from authentication.token import create_token
from authentication import local_admin
from domains.resources import Resources
from repository.mongo.authorization import PermissionsMongoRepo
from scripts.seed_demo_volunteering import SHELTER_IDS, SHIFT_IDS, VOLUNTEER, seed
from use_cases.authorization.add_shelter_admin import add_shelter_admin
from use_cases.authorization.is_authorized import is_authorized
from use_cases.authorization.remove_shelter_admin import remove_shelter_admin


@pytest.fixture
def demo_db():
    uri = os.environ.get("DEMO_TEST_MONGO_URI")
    if not uri:
        pytest.skip("Set DEMO_TEST_MONGO_URI to a disposable MongoDB server")
    client = MongoClient(uri, serverSelectionTimeoutMS=3000)
    db = client.shelter_demo_test
    seed(db)
    yield db
    client.close()


def test_seed_rerun_preserves_existing_fixture_data(demo_db):
    shift = demo_db.service_shifts.find_one({"_id": SHIFT_IDS[0]})
    counts = seed(demo_db, datetime.now(timezone.utc) + timedelta(days=30))
    assert counts == {"shelters": 0, "service_shifts": 0, "service_commitments": 0}
    assert demo_db.service_shifts.find_one({"_id": shift["_id"]}) == shift


def test_seeded_shelters_and_volunteer_commitments_through_api(demo_db):
    with patch("config.mongodb_config.get_db", return_value=demo_db):
        from application.rest import service_commitment, shelter

        app = Flask(__name__)
        app.config["JWT_SECRET"] = "integration-test-secret-at-least-32-bytes"
        app.register_blueprint(shelter.shelter_blueprint)
        app.register_blueprint(service_commitment.service_commitment_bp)
        client = app.test_client()
        token = create_token({"email": VOLUNTEER}, app.config["JWT_SECRET"])

        open_response = client.get("/shelters/open")
        assert open_response.status_code == 200
        assert all(str(shelter_id) in open_response.get_data(as_text=True)
                   for shelter_id in SHELTER_IDS)
        response = client.get(
            "/service_commitment?include_shift_details=true",
            headers={"Authorization": token},
        )
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 3
        assert sum(item["shift_end"] < time.time() * 1000 for item in data) == 2
        assert all(item["volunteer_id"] == VOLUNTEER for item in data)
        assert all(item.get("shelter") for item in data)


def test_shelter_admin_local_password_and_permissions(demo_db):
    with patch("repository.mongo.authorization.get_db", return_value=demo_db):
        repo = PermissionsMongoRepo()
    email = f"demo-test-{uuid.uuid4().hex}@example.com"
    shelter_id = str(SHELTER_IDS[0])
    assert add_shelter_admin(repo, shelter_id, email).value["success"]
    with patch.object(local_admin, "get_db", return_value=demo_db), patch.object(
        local_admin, "PermissionsMongoRepo", return_value=repo
    ):
        local_admin.set_admin_password(email, "test-password-12345")
        assert local_admin.authenticate_admin(email, "test-password-12345")
        assert is_authorized(repo, email, Resources.SHELTER, shelter_id)
        assert not is_authorized(repo, email, Resources.SYSTEM)
        remove_shelter_admin(repo, shelter_id, email)
        assert not local_admin.authenticate_admin(email, "test-password-12345")

"""Test fixtures for pytest.

Provides fixtures that start a temporary MongoDB container for tests when
Docker is available. If Docker is not available the tests are skipped.
"""

# Tests use pytest fixture names as test parameters which intentionally shadow
# names in some scopes; disable the redefined-outer-name warning for this
# test module.
# pylint: disable=redefined-outer-name

import pytest
from testcontainers.mongodb import MongoDbContainer
from pymongo import MongoClient


@pytest.fixture(scope="session")
def mongo_container():
    """Start MongoDB container if Docker is available.

    If the container can't be created (Docker not present) the test session is
    skipped. Catching a broad Exception here is intentional because test
    containers may raise various errors when Docker is unavailable.
    """
    try:
        container = MongoDbContainer("mongo:8.0.5")
        container.start()
        yield container
        container.stop()
    except Exception as exc:  # pylint: disable=broad-exception-caught
        pytest.skip(f"MongoDB container not available: {exc}")


@pytest.fixture(scope="function")
def mongo_db(mongo_container):
    """
    Provides a clean MongoDB database for each test function.
    Clears all collections after each test.
    """
    connection_url = mongo_container.get_connection_url()
    client = MongoClient(connection_url)
    db = client.volunteers_db

    yield db

    # Clean up: drop all collections after test
    for collection_name in db.list_collection_names():
        db.drop_collection(collection_name)

    client.close()

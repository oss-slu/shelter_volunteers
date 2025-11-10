import pytest
from testcontainers.mongodb import MongoDbContainer
from pymongo import MongoClient


@pytest.fixture(scope="session")
def mongo_container():
    """Start MongoDB container if Docker is available."""
    try:
        container = MongoDbContainer("mongo:8.0.5")
        container.start()
        yield container
        container.stop()
    except Exception as e:
        pytest.skip(f"MongoDB container not available: {e}")


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

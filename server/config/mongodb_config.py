"""Configuration module for MongoDB connection."""

import os
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi


def load_env_file():
    """Load the appropriate .env file based on FLASK_ENV."""
    env = os.getenv("FLASK_ENV", "development")

    env_vars = ["MONGODB_HOST", "MONGODB_USERNAME", "MONGODB_PASSWORD"]
    if all(os.getenv(var) for var in env_vars):
        return

    env_file = f".env.{env}"
    # First try environment-specific file, fall back to default .env
    if os.path.exists(env_file):
        load_dotenv(env_file)
    else:
        load_dotenv(".env")


class MongoConfig(object):
    """Base configuration class."""

    load_env_file()
    MONGODB_HOST = os.getenv("MONGODB_HOST", "mongodb")
    MONGODB_PORT = int(os.getenv("MONGODB_PORT", "27017"))
    MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "volunteers_db")
    MONGODB_USERNAME = os.getenv("MONGODB_USERNAME")
    MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD")


class MongoDevelopmentConfig(MongoConfig):
    """Development configuration."""

    # Local Docker MongoDB connection

    MONGODB_URI = (
        f"mongodb://{MongoConfig.MONGODB_USERNAME}:"
        f"{MongoConfig.MONGODB_PASSWORD}@{MongoConfig.MONGODB_HOST}"
    )


class MongoPreProductionConfig(MongoConfig):
    """Pre-production configuration using MongoDB Atlas."""

    MONGODB_URI = (
        f"mongodb+srv://{MongoConfig.MONGODB_USERNAME}:"
        f"{MongoConfig.MONGODB_PASSWORD}@{MongoConfig.MONGODB_HOST}"
    )


class MongoProductionConfig(MongoConfig):
    """Production configuration using MongoDB Atlas."""

    MONGODB_URI = (
        f"{os.getenv("MONGODB_PROTOCOL", "mongodb+srv")}://{MongoConfig.MONGODB_USERNAME}:"
        f"{MongoConfig.MONGODB_PASSWORD}@{MongoConfig.MONGODB_HOST}"
    )


def get_config():
    """Return the appropriate configuration based on environment."""
    env = os.getenv("FLASK_ENV", "development")
    config_map = {
        "production": MongoProductionConfig,
        "development": MongoDevelopmentConfig,
        "pre-production": MongoPreProductionConfig,
    }
    return config_map.get(env, MongoDevelopmentConfig)()


_client = None  # pylint: disable=invalid-name


def get_db():
    """
    Get a database connection using the appropriate configuration.

    Returns:
        pymongo.database.Database: MongoDB database connection
    """
    global _client  # pylint: disable=invalid-name
    config = get_config()

    if _client:
        return _client[config.MONGODB_DATABASE]

    if config.MONGODB_URI.startswith("mongodb+srv://"):
        _client = MongoClient(config.MONGODB_URI, tlsCAFile=certifi.where())
    else:
        _client = MongoClient(config.MONGODB_URI, tls=False, connect=False)

    return _client[config.MONGODB_DATABASE]

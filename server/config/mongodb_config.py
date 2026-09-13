"""Configuration module for MongoDB connection."""

import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConfigurationError
import certifi


def _env(name, default=None):
    """Read an environment variable and strip accidental whitespace."""
    value = os.getenv(name, default)
    if value is None:
        return None
    return value.strip()


def load_env_file():
    """Load the appropriate .env file based on FLASK_ENV."""
    env = os.getenv('FLASK_ENV', 'development')

    env_vars = ['MONGODB_HOST', 'MONGODB_USERNAME', 'MONGODB_PASSWORD']
    if all(_env(var) for var in env_vars):
        return

    env_file = f'.env.{env}'
    # First try environment-specific file, fall back to default .env
    if os.path.exists(env_file):
        load_dotenv(env_file)
    else:
        load_dotenv('.env')

class MongoConfig(object):
    """Base configuration class."""
    load_env_file()
    MONGODB_HOST = _env('MONGODB_HOST', 'mongodb')
    MONGODB_PORT = int(_env('MONGODB_PORT', '27017'))
    MONGODB_DATABASE = _env('MONGODB_DATABASE', 'volunteers_db')
    MONGODB_USERNAME = _env('MONGODB_USERNAME')
    MONGODB_PASSWORD = _env('MONGODB_PASSWORD')

class MongoDevelopmentConfig(MongoConfig):
    """Development configuration."""
    # Local Docker MongoDB connection
    MONGODB_URI = (
        f'mongodb://{MongoConfig.MONGODB_HOST}:{MongoConfig.MONGODB_PORT}'
    )

class MongoPreProductionConfig(MongoConfig):
    """Pre-production configuration using MongoDB Atlas."""
    MONGODB_URI = (
        f'mongodb+srv://{MongoConfig.MONGODB_USERNAME}:'
        f'{MongoConfig.MONGODB_PASSWORD}@{MongoConfig.MONGODB_HOST}'
    )

def get_config():
    """Return the appropriate configuration based on environment."""
    env = os.getenv('FLASK_ENV', 'development')
    config_map = {
        'development': MongoDevelopmentConfig,
        'pre-production': MongoPreProductionConfig
    }
    return config_map.get(env, MongoDevelopmentConfig)()

def get_db():
    """
    Get a database connection using the appropriate configuration.
    
    Returns:
        pymongo.database.Database: MongoDB database connection
    """
    config = get_config()
    client_kwargs = {}
    if config.MONGODB_URI.startswith('mongodb+srv://'):
        client_kwargs['tlsCAFile'] = certifi.where()
    try:
        client = MongoClient(config.MONGODB_URI, **client_kwargs)
    except ConfigurationError as exc:
        raise ConfigurationError(
            f"Could not connect to MongoDB host {config.MONGODB_HOST!r}. "
            "For Atlas, copy the cluster hostname from Atlas → Connect "
            "(it looks like cluster0.xxxxx.mongodb.net) into "
            "MONGODB_HOST in .env.pre-production. If the cluster was "
            "deleted or renamed, create a new one. For local MongoDB, "
            "run with FLASK_ENV=development instead."
        ) from exc
    return client[config.MONGODB_DATABASE]

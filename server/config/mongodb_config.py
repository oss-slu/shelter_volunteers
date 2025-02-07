"""Configuration module for MongoDB connection."""

import os
from dotenv import load_dotenv

def load_env_file():
    """Load the appropriate .env file based on FLASK_ENV."""
    env = os.getenv('FLASK_ENV', 'development')

    env_vars = ['MONGODB_HOST', 'MONGODB_USERNAME', 'MONGODB_PASSWORD']
    if all(os.getenv(var) for var in env_vars):
        return
    
    env_file = f'.env.{env}'    
    # First try environment-specific file, fall back to default .env
    if os.path.exists(env_file):
        load_dotenv(env_file)
    else:
        load_dotenv('.env')

class MongoConfig:
    """Base configuration class."""
    def __init__(self):
        # Load the appropriate .env file
        load_env_file()
        self.mongodb_host = os.getenv('MONGODB_HOST', 'mongodb')
        self.mongodb_port = int(os.getenv('MONGODB_PORT', 27017))
        self.mongodb_database = os.getenv('MONGODB_DATABASE', 'volunteers_db')
        self.mongodb_username = os.getenv('MONGODB_USERNAME')
        self.mongodb_password = os.getenv('MONGODB_PASSWORD')

class MongoDevelopmentConfig(MongoConfig):
    """Development configuration."""
    def __init__(self):
        super().__init__()
        # Local Docker MongoDB connection
        self.MONGODB_URI = f'mongodb://{self.mongodb_host}:{self.mongodb_port}'

class MongoPreProductionConfig(MongoConfig):
    """Pre-production configuration using MongoDB Atlas."""
    def __init__(self):
        super().__init__()
        # Atlas connection string
        self.mongodb_uri = (
            f'mongodb+srv://{self.mongodb_username}:'
            f'{self.mongodb_password}@{self.mongodb_host}'
        )

def get_config():
    """Return the appropriate configuration based on environment."""
    env = os.getenv('FLASK_ENV', 'development')
    config_map = {
        'development': MongoDevelopmentConfig,
        'pre-production': MongoPreProductionConfig
    }
    return config_map.get(env, MongoDevelopmentConfig)()

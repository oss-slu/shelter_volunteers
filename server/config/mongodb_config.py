import os
from dotenv import load_dotenv

def load_env_file():
    """Load the appropriate .env file based on FLASK_ENV."""
    env = os.getenv('FLASK_ENV', 'development')
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
        
        self.MONGODB_HOST = os.getenv('MONGODB_HOST', 'mongodb')
        self.MONGODB_PORT = int(os.getenv('MONGODB_PORT', 27017))
        self.MONGODB_DATABASE = os.getenv('MONGODB_DATABASE', 'volunteers_db')
        self.MONGODB_USERNAME = os.getenv('MONGODB_USERNAME')
        self.MONGODB_PASSWORD = os.getenv('MONGODB_PASSWORD')

class MongoDevelopmentConfig(MongoConfig):
    """Development configuration."""
    def __init__(self):
        super().__init__()
        self.DEBUG = True
        # Local Docker MongoDB connection
        self.MONGODB_URI = f"mongodb://{self.MONGODB_HOST}:{self.MONGODB_PORT}"

class MongoPreProductionConfig(MongoConfig):
    """Pre-production configuration using MongoDB Atlas."""
    def __init__(self):
        super().__init__()
        self.DEBUG = False
        # Atlas connection string
        self.MONGODB_URI = f"mongodb+srv://{self.MONGODB_USERNAME}:{self.MONGODB_PASSWORD}@{self.MONGODB_HOST}"

def get_config():
    """Return the appropriate configuration based on environment."""
    env = os.getenv('FLASK_ENV', 'development')
    config_map = {
        'development': MongoDevelopmentConfig,
        'pre-production': MongoPreProductionConfig
    }
    return config_map.get(env, MongoDevelopmentConfig)()
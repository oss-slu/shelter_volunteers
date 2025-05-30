"""
Configuration settings for the application are handled in this module
"""
import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    """Base configuration"""
    JWT_SECRET=os.getenv("JWT_SECRET")


class ProductionConfig(Config):
    """Production configuration"""

class DevelopmentConfig(Config):
    """Development configuration"""
    os.environ["GETHELP_API"] = "https://api2-qa.gethelp.com/"
    DEV_USER = os.getenv("DEV_USER", "developer@slu.edu")
    FIRST_NAME = os.getenv("FIRST_NAME", "SLU")
    LAST_NAME = os.getenv("LAST_NAME", "Developer")
    DEV_TOKEN = "1234567890-developer-token"


class TestingConfig(Config):
    """Testing configuration"""
    os.environ["GETHELP_API"] = "https://api2-qa.gethelp.com/"
    TESTING = True

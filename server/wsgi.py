import os

from flask_cors import CORS
from application.app import create_app

app = create_app(os.environ["FLASK_CONFIG"])

CLIENT_URLS = ["http://localhost:3000","http://127.0.0.1:3000"] URL of the React app
cors = CORS(app, resources={r"*": {"origins": CLIENT_URL}})

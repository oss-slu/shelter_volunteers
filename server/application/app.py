from flask import Flask
#from flask_cors import CORS, cross_origin

#CLIENT_URL = "http://localhost:3000" # URL of the React app
#cors = CORS(app, resources={r"*": {"origins": CLIENT_URL}})

def create_app(config_name):
   app = Flask(__name__)
   config_module = f"application.config.{config_name.capitalize()}Config"
   app.config.from_object(config_module)
   app.register_blueprint(room.blueprint)
   return app



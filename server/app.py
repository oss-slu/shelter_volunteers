from flask import Flask
from flask import jsonify
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app, resources={r"*": {"origins": "http://localhost:3000"}})  # Replace with your React app's URL


@app.route('/shelters')
@cross_origin()
def hello():
    data = {'shelters': [{'id': 12345, 'name':'XYZ','location':'St. Louis'}]}
    return jsonify(data)

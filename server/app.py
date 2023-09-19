from flask import Flask
from flask import jsonify
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app, resources={r"*": {"origins": "http://localhost:3000"}})  # Replace with your React app's URL


@app.route('/shifts')
@cross_origin()
def hello():
    data = {'shifts': [{'id': 12345, 'date':'2023-12-15','time_start':'09:00', 'time_end':'12:00', 'shelter':'St. Patrick Center'}]}
    return jsonify(data)

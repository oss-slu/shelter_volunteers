from flask import Flask
from flask import jsonify
from flask_cors import CORS, cross_origin

CLIENT_URL = "http://localhost:3000" # URL of the React app

app = Flask(__name__)
cors = CORS(app, resources={r"*": {"origins": CLIENT_URL}})


@app.route('/shifts')
@cross_origin()
def hello():
    data = {'shifts': 
               [{'id': 12345, 'date':'2023-12-15','time_start':'09:00', 'time_end':'12:00', 'shelter':'St. Patrick Center'},
               {'id': 78910, 'date':'2023-11-29', 'time_start':'18:30', 'time_end':'21:00', 'shelter':'St. Francis Xavier Church'}]
           }
    return jsonify(data)

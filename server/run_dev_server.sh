#!/bin/bash

export FLASK_CONFIG="development"
flask run --debug -h 0.0.0.0 -p 5000

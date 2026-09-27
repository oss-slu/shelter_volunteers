#!/bin/bash
export FLASK_ENV="${FLASK_ENV:-development}"
export FLASK_CONFIG="${FLASK_CONFIG:-development}"
flask run --debug -h 0.0.0.0 -p 5001

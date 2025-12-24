#!/bin/sh
export FLASK_ENV="production"
export FLASK_CONFIG="production" 
exec gunicorn -w "$(($(nproc) * 2))" --bind "0.0.0.0:8000" "application.app:create_app()"
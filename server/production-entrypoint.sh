#!/usr/bin/env bash
export FLASK_ENV="production"
export FLASK_CONFIG="production" 
#exec gunicorn -w "$(($(nproc) * 2))" --bind "0.0.0.0:8000" "application.app:create_app()"
exec gunicorn -w 1 --bind "0.0.0.0:8000" "application.app:create_app()"
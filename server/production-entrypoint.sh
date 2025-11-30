#!/usr/bin/env bash
exec gunicorn -w "$(($(nproc) * 2))" --bind "0.0.0.0:8000" "application.app:create_app()"
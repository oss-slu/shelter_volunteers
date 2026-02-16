#!/usr/bin/env bash
if [ -f .dev-emails ]; then
    while IFS= read -r line; do
        PYTHONPATH=$(pwd) python cli/admin_cli.py system "$line"
    done < .dev-emails
fi
flask run --debug --host=0.0.0.0 --port=8000
#!/usr/bin/env sh
envsubst '${SERVER_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
exec "$@"
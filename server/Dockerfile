FROM python:3.14-alpine3.22 AS base
ENV MONGODB_HOST="" MONGODB_USERNAME="" MONGODB_PASSWORD="" GOOGLE_CLIENT_ID="502797726301-ngbeicta74g8alif8206o001b72aie3e.apps.googleusercontent.com" JWT_SECRET=""
WORKDIR /app

FROM base AS dependencies
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
ENV UV_COMPILED_BYTECODE=1 UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=0
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project --no-dev

FROM dependencies AS builder
COPY . /app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev

FROM base AS development
COPY --from=builder /app /app
ENV PATH="/app/.venv/bin:${PATH}"
EXPOSE 8000
CMD ["sh", "/app/development-entrypoint.sh"]

FROM base AS production
RUN apk add --no-cache shadow && \
    useradd --system --uid 999 --gid 999 -m nonroot
COPY --from=builder --chown=nonroot:nonroot /app /app
ENV PATH="/app/.venv/bin:${PATH}"
EXPOSE 8000
USER nonroot
CMD ["sh", "/app/production-entrypoint.sh"]
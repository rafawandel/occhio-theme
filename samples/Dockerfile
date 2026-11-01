# syntax=docker/dockerfile:1
FROM python:3.12-slim AS base

ARG UV_VERSION=0.4.20
ENV PYTHONUNBUFFERED=1 \
    TZ=UTC

WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir "uv==${UV_VERSION}" \
 && uv sync --frozen --no-dev

COPY --chown=app:app . .
EXPOSE 8000
HEALTHCHECK --interval=30s CMD curl -f http://localhost:8000/saude || exit 1
USER app
ENTRYPOINT ["gunicorn", "-c", "/app/gunicorn.conf.py", "exemplo.wsgi"]

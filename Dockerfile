# syntax=docker/dockerfile:1
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps (optional, kept minimal)
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt && pip install --no-cache-dir gunicorn==21.2.0

# Copy app code and assets
COPY app.py /app/app.py
COPY api.js /app/api.js
COPY api.md /app/api.md
COPY services_singlefile_online_flow_responsive.html /app/services_singlefile_online_flow_responsive.html
COPY img /app/img

# Ensure logs directory exists
RUN mkdir -p /app/logs

EXPOSE 5000

# Use Gunicorn to serve Flask app
CMD ["gunicorn", "--bind=0.0.0.0:5000", "--workers=2", "--threads=4", "--timeout=60", "app:app"]
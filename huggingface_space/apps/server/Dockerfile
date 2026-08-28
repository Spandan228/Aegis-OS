FROM python:3.11-slim

WORKDIR /app

# Copy shared models
COPY packages/shared /app/packages/shared

# Install dependencies
COPY apps/server/requirements.txt /app/apps/server/
RUN pip install --no-cache-dir -r apps/server/requirements.txt

# Copy server code
COPY apps/server /app/apps/server

# Ensure Python finds the packages folder for absolute imports
ENV PYTHONPATH=/app

EXPOSE 8080

CMD ["uvicorn", "apps.server.main:app", "--host", "0.0.0.0", "--port", "8080"]

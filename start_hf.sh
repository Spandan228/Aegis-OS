#!/bin/bash
set -e

echo "Starting Aegis OS inside Hugging Face Spaces..."

# Ensure Postgres directories exist with proper permissions
mkdir -p /var/run/postgresql
chown -R postgres:postgres /var/run/postgresql
chmod 2775 /var/run/postgresql

# Initialize ChromaDB data directory
mkdir -p /app/chroma_data

echo "Launching supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_VERSION=20.x

# Install base dependencies and runtime utilities
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg \
    supervisor \
    postgresql \
    postgresql-contrib \
    redis-server \
    python3.11 \
    python3.11-venv \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js v20
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION} | bash - \
    && apt-get install -y nodejs

# Set workspace directory
WORKDIR /app

# Copy entire application codebase
COPY . .

# Setup Postgres user and database
RUN service postgresql start && \
    su - postgres -c "psql -c \"CREATE USER aegis_user WITH PASSWORD 'aegis_password';\"" && \
    su - postgres -c "psql -c \"CREATE DATABASE aegis_db OWNER aegis_user;\""

# Build Web Frontend Next.js HMI
WORKDIR /app/apps/web
RUN npm install
RUN npm run build

# Setup Python Server & AI Agent Dependencies
WORKDIR /app/apps/server
RUN python3 -m pip install --upgrade pip
RUN pip3 install -r requirements.txt
RUN pip3 install chromadb langchain-groq "langchain-community"

# Setup Simulator
WORKDIR /app/apps/simulator
RUN pip3 install -r requirements.txt

WORKDIR /app

# Setup supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Setup Hugging Face Startup Script
COPY start_hf.sh /app/start_hf.sh
RUN chmod +x /app/start_hf.sh

# Expose default Hugging Face Space port
EXPOSE 7860

# Environment Configuration
ENV PORT=7860
ENV REDIS_URL="redis://localhost:6379/0"
ENV POSTGRES_URL="postgresql://aegis_user:aegis_password@localhost:5432/aegis_db"
ENV CHROMADB_URL="http://localhost:8000"
# Set to 'true' to use lightning-fast Groq LLM inference
ENV USE_GROQ="true"

CMD ["/app/start_hf.sh"]

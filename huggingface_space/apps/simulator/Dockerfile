FROM python:3.11-slim

WORKDIR /app

COPY packages/shared /app/packages/shared

COPY apps/simulator/requirements.txt /app/apps/simulator/requirements.txt
# Guarantee necessary dependencies are installed
RUN pip install --no-cache-dir redis fastapi uvicorn pydantic || true
RUN if [ -f /app/apps/simulator/requirements.txt ]; then pip install -r /app/apps/simulator/requirements.txt; fi

COPY apps/simulator /app/apps/simulator

ENV PYTHONPATH=/app

EXPOSE 8001

CMD ["uvicorn", "apps.simulator.simulator:app", "--host", "0.0.0.0", "--port", "8001"]

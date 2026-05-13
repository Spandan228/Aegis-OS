import os
import sys
import math
import random
import asyncio
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import redis.asyncio as redis

# Dynamically add the project root to sys.path so 'packages' can be imported
# directly without requiring setup.py / pip install -e .
project_root = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(project_root))

from packages.shared.schemas import SensorTelemetry, SensorType, TelemetryStatus

# ---- Configuration ----
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CHANNEL_NAME = "telemetry:raw"
LOOP_INTERVAL_SECONDS = 0.5  # 500ms

class PumpStation:
    def __init__(self, station_id: str):
        self.station_id = station_id
        self.failure_mode = False
        self.time_step = 0.0

    def get_readings(self) -> list[SensorTelemetry]:
        """Generate simulated readings for Temperature, Pressure, and Flow Rate."""
        self.time_step += 0.1
        readings = []
        
        # Determine the current state logic
        if not self.failure_mode:
            # Normal State: sine wave + randomized noise
            temp_val = 45.0 + 5 * math.sin(self.time_step) + random.uniform(-1, 1)
            pressure_val = 120.0 + 10 * math.cos(self.time_step) + random.uniform(-2, 2)
            flow_val = 300.0 + 20 * math.sin(self.time_step * 0.5) + random.uniform(-5, 5)
            status = TelemetryStatus.NOMINAL
        else:
            # Failure State (Disaster): Heat spikes, pressure skyrockets, flow drops dramatically
            temp_val = 85.0 + random.uniform(-2, 2)         # Overheating
            pressure_val = 250.0 + random.uniform(-10, 10)  # Dangerous spike
            flow_val = 50.0 + random.uniform(-5, 5)         # Pipe failure / blockage
            status = TelemetryStatus.CRITICAL

        # 1. Temperature Sensor
        readings.append(SensorTelemetry(
            sensor_id=f"{self.station_id}-TEMP",
            sensor_type=SensorType.TEMPERATURE,
            value=round(temp_val, 2),
            unit="Celsius",
            status=status,
            metadata={"station": self.station_id, "mode": "simulator"}
        ))
        
        # 2. Pressure Sensor
        readings.append(SensorTelemetry(
            sensor_id=f"{self.station_id}-PRES",
            sensor_type=SensorType.PRESSURE,
            value=round(pressure_val, 2),
            unit="PSI",
            status=status,
            metadata={"station": self.station_id, "mode": "simulator"}
        ))
        
        # 3. Flow Rate Sensor
        readings.append(SensorTelemetry(
            sensor_id=f"{self.station_id}-FLOW",
            sensor_type=SensorType.FLOW_RATE,
            value=round(flow_val, 2),
            unit="L/min",
            status=status,
            metadata={"station": self.station_id, "mode": "simulator"}
        ))
        
        return readings

# Global instances
pump_station = PumpStation("PUMP-ALPHA")
redis_client = None
simulator_task = None

async def telemetry_loop():
    """Background task that loops every 500ms and publishes telemetry to Redis."""
    global redis_client
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    print(f"[*] Starting telemetry loop. Publishing to '{CHANNEL_NAME}' at {REDIS_URL}...")
    
    try:
        while True:
            readings = pump_station.get_readings()
            for reading in readings:
                # Serialize Pydantic model to JSON string and publish
                payload = reading.model_dump_json()
                await redis_client.publish(CHANNEL_NAME, payload)
            
            # Wait 500ms
            await asyncio.sleep(LOOP_INTERVAL_SECONDS)
    except asyncio.CancelledError:
        print("[*] Telemetry loop cancelled.")
    except Exception as e:
        print(f"[!] Telemetry loop error: {e}")
    finally:
        if redis_client:
            await redis_client.aclose()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage the lifecycle of the background telemetry loop."""
    global simulator_task
    # Startup: spawn the background loop
    simulator_task = asyncio.create_task(telemetry_loop())
    yield
    # Shutdown: cleanly cancel the loop
    if simulator_task:
        simulator_task.cancel()
        try:
            await simulator_task
        except asyncio.CancelledError:
            pass

app = FastAPI(title="Aegis OS Telemetry Simulator", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/inject-failure")
async def inject_failure():
    """Endpoint to trigger the 'Disaster' state manually during a demo."""
    pump_station.failure_mode = True
    return {"status": "Failure injected! Pressure skyrocketing, flow dropping.", "station": pump_station.station_id}

@app.post("/reset")
async def reset_simulator():
    """Endpoint to restore the 'Normal' operating state."""
    pump_station.failure_mode = False
    return {"status": "Simulator reset to normal state.", "station": pump_station.station_id}

@app.get("/status")
async def get_status():
    """Get the current simulation state."""
    return {
        "station": pump_station.station_id,
        "is_failing": pump_station.failure_mode,
        "publishing_to": CHANNEL_NAME
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("simulator:app", host="0.0.0.0", port=8001, reload=True)

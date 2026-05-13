import os
import sys
import asyncio
from typing import List
from pathlib import Path
from contextlib import asynccontextmanager
from collections import deque

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import redis.asyncio as redis

# Dynamically add the project root to sys.path
project_root = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(project_root))

from packages.shared.schemas import SensorTelemetry, AIIncidentReport
from apps.server.ai_agent import aegis_ai_agent, AgentState

# ---- Configuration ----
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CHANNEL_NAME = "telemetry:raw"

# Sliding window buffer to give AI context on the failure (stores last 20 events)
telemetry_buffer = deque(maxlen=20)
# Debounce flag to prevent slamming the LLM repeatedly
is_analyzing = False
# Track global sensor statuses to prevent stale alerts
latest_statuses = {}

# ---- WebSocket Connection Manager ----
class ConnectionManager:
    """Manages active WebSocket connections to the Next.js frontend with Zombie Prevention."""
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        with open("server_debug.log", "a") as f:
            f.write(f"[*] Client connected. Total active: {len(self.active_connections)}\n")
        print(f"[*] Client connected. Total active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            with open("server_debug.log", "a") as f:
                f.write(f"[*] Client disconnected. Total active: {len(self.active_connections)}\n")
            print(f"[*] Client disconnected. Total active: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        """Aggressively broadcasts messages concurrently and cleans up zombie sockets."""
        if not self.active_connections:
            return

        async def safe_send(connection: WebSocket):
            try:
                # Add a timeout to prevent head-of-line blocking on half-open/zombie TCP sockets
                await asyncio.wait_for(connection.send_text(message), timeout=1.5)
            except asyncio.TimeoutError:
                print("[!] Broadcast timeout. Client is a zombie. Pruning.")
                self.disconnect(connection)
            except Exception as e:
                print(f"[!] Connection dropped aggressively. Reason: {e}")
                self.disconnect(connection)

        # Broadcast concurrently using asyncio.gather to avoid sequential blocking
        # We wrap in list() to avoid RuntimeError if the list mutates during iteration
        tasks = [safe_send(conn) for conn in list(self.active_connections)]
        await asyncio.gather(*tasks, return_exceptions=True)

manager = ConnectionManager()
redis_client = None
listener_task = None

# ---- AI Orchestration ----
async def run_ai_analysis():
    """Trigger the LangGraph multi-agent pipeline asynchronously."""
    global is_analyzing
    try:
        # Snapshot the current telemetry buffer to pass into the AI state
        initial_state: AgentState = {
            "telemetry_window": list(telemetry_buffer),
            "anomaly_detected": True,
            "rca_report": "",
            "ui_mutation": {}
        }
        
        with open("server_debug.log", "a") as f:
            f.write("[*] Dispatching sliding context window to Gemini for RCA...\n")
        print("\n[*] ----------------------------------------------------")
        print("[*] Dispatching sliding context window to Gemini for RCA...")
        
        # Invoke LangGraph asynchronously
        try:
            final_state = await aegis_ai_agent.ainvoke(initial_state)
        except Exception as ai_err:
            with open("server_debug.log", "a") as f:
                f.write(f"[!] LangGraph invoke failed: {ai_err}\n")
            raise ai_err
        
        ui_mutation_data = final_state.get("ui_mutation", {})
        
        # Enforce the outgoing UI API contract before broadcasting to frontend
        incident_report = AIIncidentReport(
            incident_id=ui_mutation_data.get("incident_id", "UNKNOWN"),
            severity=ui_mutation_data.get("severity", "critical"),
            title=ui_mutation_data.get("title", "AI System Alert"),
            summary=ui_mutation_data.get("summary", "Anomaly detected."),
            root_cause_analysis=ui_mutation_data.get("root_cause_analysis", ""),
            correlated_sensors=ui_mutation_data.get("correlated_sensors", []),
            recommended_actions=ui_mutation_data.get("recommended_actions", []),
            confidence_score=ui_mutation_data.get("confidence_score", 0.9)
        )
        
        # Broadcast the structured incident report down the WebSocket to the UI
        report_json = incident_report.model_dump_json()
        
        # SRE CHECK: Ensure the current system state is still critical before broadcasting stale alert
        if not any(status == "critical" for status in latest_statuses.values()):
            with open("server_debug.log", "a") as f:
                f.write("[*] LangGraph completed but system returned to NOMINAL. Suppressing stale alert broadcast.\n")
            print("[*] LangGraph completed but system returned to NOMINAL. Suppressing stale alert broadcast.")
            return

        with open("server_debug.log", "a") as f:
            f.write(f"[*] LangGraph Analysis Complete. Broadcasting Incident Report: {incident_report.title}\n")
        print(f"[*] LangGraph Analysis Complete. Broadcasting Incident Report: {incident_report.title}")
        print("[*] ----------------------------------------------------\n")
        
        await manager.broadcast(report_json)
        
    except Exception as e:
        with open("server_debug.log", "a") as f:
            f.write(f"[!] AI Agent Execution Failed: {e}\n")
        print(f"[!] AI Agent Execution Failed: {e}")
    finally:
        # Debounce: Sleep 10s before allowing another analysis trigger to avoid API limits
        await asyncio.sleep(10)
        is_analyzing = False

# ---- Redis Listener ----
async def redis_listener():
    """Background task that subscribes to Redis and broadcasts data to WebSockets with Auto-Reconnection."""
    with open("server_debug.log", "a") as f:
        f.write("[*] redis_listener started\n")
    global redis_client, is_analyzing
    
    while True:
        pubsub = None
        try:
            redis_client = redis.from_url(REDIS_URL, decode_responses=True)
            pubsub = redis_client.pubsub()
            await pubsub.subscribe(CHANNEL_NAME)
            with open("server_debug.log", "a") as f:
                f.write(f"[*] Subscribed to Redis channel '{CHANNEL_NAME}' at {REDIS_URL}\n")
            print(f"[*] Subscribed to Redis channel '{CHANNEL_NAME}' at {REDIS_URL}")
            
            async for message in pubsub.listen():
                if message["type"] == "message":
                    raw_data = message["data"]
                    try:
                        # Enforce the API Contract
                        parsed_telemetry = SensorTelemetry.model_validate_json(raw_data)
                        
                        # Track latest status
                        latest_statuses[parsed_telemetry.sensor_id] = parsed_telemetry.status
                        
                        # Store event in sliding window for the AI to process
                        telemetry_buffer.append(parsed_telemetry.model_dump(mode='json'))
                        
                        # Broadcast raw telemetry to UI immediately
                        await manager.broadcast(parsed_telemetry.model_dump_json())
                        
                        # Intercept: Wake up AI Director if CRITICAL
                        if parsed_telemetry.status == "critical" and not is_analyzing:
                            is_analyzing = True  # Synchronously lock state to block concurrent execution
                            with open("server_debug.log", "a") as f:
                                f.write(f"[*] Anomaly Intercepted: status={parsed_telemetry.status}. Triggering AI analysis.\n")
                            asyncio.create_task(run_ai_analysis())
                        
                    except Exception as e:
                        print(f"[!] Schema validation failed for telemetry packet: {e}")
                        
        except asyncio.CancelledError:
            print("[*] Redis listener cancelled.")
            break
        except Exception as e:
            print(f"[!] Redis listener encountered an error: {e}. Reconnecting in 2s...")
            with open("server_debug.log", "a") as f:
                f.write(f"[!] Redis listener error: {e}. Reconnecting in 2s...\n")
            await asyncio.sleep(2)
        finally:
            try:
                if pubsub:
                    await pubsub.unsubscribe(CHANNEL_NAME)
                    await pubsub.close()
                if redis_client:
                    await redis_client.aclose()
            except Exception:
                pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    global listener_task
    listener_task = asyncio.create_task(redis_listener())
    yield
    if listener_task:
        listener_task.cancel()
        try:
            await listener_task
        except asyncio.CancelledError:
            pass

# ---- FastAPI App Setup ----
app = FastAPI(title="Aegis OS Server Hub", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "active_clients": len(manager.active_connections)}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            _ = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"[!] WebSocket loop error: {e}")
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)

import asyncio, json, uuid, time, uvicorn, math
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

active_connections = []
is_critical = False
t = 0

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections.remove(websocket)

async def broadcast(message: str):
    for conn in list(active_connections):
        try:
            await conn.send_text(message)
        except:
            active_connections.remove(conn)

async def telemetry_loop():
    global is_critical, t
    while True:
        if not active_connections:
            await asyncio.sleep(0.5)
            continue
        t += 0.5
        status = "critical" if is_critical else "nominal"
        temp = 120.0 + (math.sin(t) * 5) if not is_critical else 120.0 + (t * 10)
        pres = 45.0 + (math.cos(t) * 2) if not is_critical else 250.0 + (math.sin(t) * 20)
        flow = 500.0 + (math.sin(t) * 10) if not is_critical else 50.0 - (math.cos(t) * 5)
        for p in [
            {"sensor_id": "PUMP-ALPHA-TEMP", "timestamp": str(time.time()), "sensor_type": "temperature", "value": temp, "unit": "C", "status": status, "metadata": {}},
            {"sensor_id": "PUMP-ALPHA-PRES", "timestamp": str(time.time()), "sensor_type": "pressure", "value": pres, "unit": "PSI", "status": status, "metadata": {}},
            {"sensor_id": "PUMP-ALPHA-FLOW", "timestamp": str(time.time()), "sensor_type": "flow", "value": flow, "unit": "L/min", "status": status, "metadata": {}}
        ]:
            await broadcast(json.dumps(p))
        await asyncio.sleep(0.5)

@app.post("/trigger")
async def trigger():
    global is_critical
    is_critical = True
    asyncio.create_task(trigger_ai_report())
    return {}

@app.post("/reset")
async def reset():
    global is_critical
    is_critical = False
    return {}

async def trigger_ai_report():
    await asyncio.sleep(3.5)
    report = {
        "incident_id": f"DEMO-FALLBACK-{str(uuid.uuid4())[:8]}",
        "severity": "critical",
        "title": "THERMAL RUNAWAY: CAVITATION DETECTED",
        "summary": "CONFIDENCE: 99% | TTF: 45 SECONDS. Critical thermal runaway detected in Pump Alpha due to severe cavitation.",
        "root_cause_analysis": "Local telemetry indicates a massive 250+ PSI pressure spike combined with a total loss of flow (50 L/min), triggering violent internal cavitation and frictional thermal generation. Seal failure is imminent.",
        "correlated_sensors": ["PUMP-ALPHA-TEMP", "PUMP-ALPHA-PRES", "PUMP-ALPHA-FLOW"],
        "recommended_actions": ["ENGAGE EMERGENCY STOP (E-STOP) IMMEDIATELY.", "Isolate upstream intake valves to halt backflow.", "Ventilate Zone 4 for thermal dissipation.", "Dispatch rapid response maintenance crew."],
        "confidence_score": 0.99
    }
    await broadcast(json.dumps(report))

@app.on_event("startup")
async def startup():
    asyncio.create_task(telemetry_loop())

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)

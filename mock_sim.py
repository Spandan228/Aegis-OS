from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import httpx

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.post("/inject-failure")
async def inject_failure():
    async with httpx.AsyncClient() as client:
        await client.post("http://localhost:8080/trigger")
    return {"status": "Failure injected"}

@app.post("/reset")
async def reset():
    async with httpx.AsyncClient() as client:
        await client.post("http://localhost:8080/reset")
    return {"status": "Reset"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)

<div align="center">
  <img src="https://via.placeholder.com/150" alt="Aegis OS Logo" width="150" height="150">

  # Aegis OS 🛡️
  
  **Mission Control & Lead Architecture: Eradicating Alarm Fatigue with AI-Assisted Operational Intelligence.**
  
  [![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)
  [![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](#)
</div>

## Table of Contents
- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## About the Project
Aegis OS is a production-grade, adaptive industrial control system (HMI) designed specifically to solve the pervasive problem of **'alarm fatigue'** in modern industrial environments. Operators are continuously overwhelmed by cascades of raw sensor alerts, which severely reduces situational awareness and delays critical response times. 

Instead of presenting raw alerts, Aegis OS intercepts, correlates, and analyzes high-velocity data streams using a sophisticated multi-agent AI system. It escalates only **actionable insights, root-cause summaries, and clear mitigation strategies**, ensuring operations engineers can make confident, split-second decisions during critical failures.

## Key Features
- ⚡ **High-Speed Telemetry Pipeline:** Sub-millisecond latency for sensor data using Redis Pub/Sub and asynchronous WebSockets.
- 🧠 **Multi-Agent AI Orchestration:** Powered by LangGraph, it autonomously analyzes sliding windows of telemetry data to determine root causes.
- 🎨 **'Dark-Glass' Tactile Dashboard:** A stunning, premium Next.js frontend with dynamic micro-animations and severe-incident UI mutations.
- 🛡️ **Resilient SRE Fallbacks:** Intelligent backend fail-safes ensure that even if the AI layer goes offline, hardcoded critical alerts still reach the operator.
- 🔄 **Interactive Resolution Flow:** Seamless, one-click physical system reset directly from the incident response sidebar.

## Tech Stack
- **Frontend**: React, Next.js (App Router), TailwindCSS, Framer Motion, Zustand
- **Backend**: Python, FastAPI, WebSockets
- **Data & Messaging**: Redis (Pub/Sub)
- **AI Engine**: LangGraph, Local Llama-3-8B (via Ollama)

## Getting Started

Follow these steps to set up Aegis OS locally.

### Prerequisites
- Node.js v18+
- Python 3.10+
- Redis Server
- *Optional: Docker (for isolated environment deployment)*

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/aegis-os.git
   cd aegis-os
   ```

### Deployment Options

**Option 1: Universal CPU & Hugging Face Spaces (Default)**
For computers without a dedicated Nvidia GPU or for deploying a live demo:
- **No local Docker required for Cloud Deploy:** You can upload this repository directly to a new Hugging Face Docker Space. Hugging Face will automatically use `Dockerfile.hf` (you may need to rename it to `Dockerfile` in the space settings) and build/run the entire environment on their servers.
- **To test locally (Optional):** If you want to verify the setup on your own PC before uploading, you can use: `docker-compose up -d --build`
- **Important Note:** Pure CPU inference is very slow. In your Hugging Face Space settings, add `USE_GROQ=true` and your `GROQ_API_KEY` as environment variables for lightning-fast external LLM inference.

**Option 2: High-Performance GPU Setup**
If you have a dedicated NVIDIA GPU (e.g., RTX 4070) with the Docker NVIDIA Toolkit installed:
- Use the dedicated GPU configuration:
  ```bash
  docker-compose -f docker-compose.gpu.yml up -d --build
  ```

2. **Start the Redis Server**
   Ensure your local Redis server is running on the default port `6379`.

3. **Install and run the Backend Hub & Simulator**
   ```bash
   # Create and activate a virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows use: .\venv\Scripts\activate
   
   # Install dependencies
   pip install -r apps/server/requirements.txt
   
   # Start the Telemetry Simulator (Port 8001)
   python apps/simulator/simulator.py &
   
   # Start the FastAPI Backend Hub (Port 8080)
   python apps/server/main.py &
   ```

4. **Install and run the Frontend HMI**
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```

## Usage

Once all services are running, navigate to `http://localhost:3000` in your browser. You will see the Aegis OS Command Center in its **SYSTEM NOMINAL** state, with real-time telemetry streaming in.

To test the AI Incident Director, inject a simulated failure into the pipeline:

```bash
# Trigger a critical failure in Pump Station Alpha
curl -X POST http://localhost:8001/inject-failure
```

Watch the dashboard dynamically shift to **SYSTEM CRITICAL**, followed by the LangGraph AI sidebar sliding in with a detailed Root Cause Analysis and mitigation steps. Click "RESOLVE & RESET SYSTEM" to clear the incident.

## Project Structure

```text
aegis-os/
├── apps/
│   ├── server/           # FastAPI backend & AI agents
│   ├── simulator/        # Python telemetry generator
│   └── web/              # Next.js frontend application
├── packages/
│   └── shared/           # Shared Pydantic schemas & types
├── redis/                # Local Redis configuration
├── README.md
└── docker-compose.yml
```

## Roadmap
- [ ] Add historical incident log viewing
- [ ] Integrate ChromaDB for RAG-assisted maintenance manuals
- [ ] Implement user authentication and RBAC for plant managers
- [ ] Expand simulator to include multi-station environments

## Contributing
Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgments
- [Next.js](https://nextjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [LangGraph](https://python.langchain.com/docs/langgraph)
- [Ollama](https://ollama.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [TailwindCSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

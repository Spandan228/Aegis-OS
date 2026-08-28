---
title: Aegis OS - AI Industrial Operational Intelligence
emoji: 🛡️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: mit
---

<div align="center">
  <h1>Aegis OS 2.0 🛡️</h1>
  <p><strong>Tactical Cyber-Industrial Mission Control & Alarm-Fatigue Eradication Engine</strong></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](#)
  [![SDK: Docker](https://img.shields.io/badge/SDK-Docker-blue.svg)](#)
  [![Port: 7860](https://img.shields.io/badge/Port-7860-emerald.svg)](#)
</div>

---

## ⚡ Quick Start on Hugging Face Spaces

### 1. Create a New Space
1. Go to [Hugging Face Spaces](https://huggingface.co/spaces) and click **Create new Space**.
2. Set the **Space SDK** to **Docker** (Blank).
3. Set your Space visibility to **Public** or **Private**.

### 2. Configure Environment Variables (Recommended for Fast AI Inference)
In your Space Settings under **Variables and Secrets**, add the following:
- **Secret**: `GROQ_API_KEY` = `your_groq_api_key_here` (Get a free key from [Groq Console](https://console.groq.com/))
- **Variable**: `USE_GROQ` = `true`

> [!NOTE]
> If no Groq API key is supplied, the system automatically falls back to deterministic SRE resilient RCA payloads with zero crashes.

### 3. Upload Code & Deploy
Clone your Space repository and copy all files from this folder directly into it:
```bash
git clone https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
cp -r /path/to/huggingface_space/* YOUR_SPACE_NAME/
cd YOUR_SPACE_NAME
git add .
git commit -m "feat: deploy Aegis OS 2.0 to Hugging Face Spaces"
git push origin main
```
Hugging Face will automatically build the `Dockerfile` and launch the live command center on port **7860**!

---

## 🛡️ Core Capabilities

- **Interactive Digital Twin Schematic**: Real-time fluid velocity particle animations, rotating pump impeller turbine, dynamic thermal gradient heatmaps, and clickable physical valves (`V-101`, `V-102 BYPASS`, `PRV-201`).
- **High-Density Telemetry Waveforms**: Real-time rolling SVG sparklines, rate-of-change ($\Delta/s$) indicators, load gauges, and min/max/avg statistical ribbons.
- **LangGraph Multi-Agent Root Cause Analysis**: Correlates high-velocity sensor streams, identifies physical failure mechanisms (e.g. *Supercritical Cavitation*, *Thermal Runaway*, *Hydraulic Water Hammer*), and calculates Time-to-Failure (TTF).
- **Procedural Web Audio Engine**: Zero-dependency synthesized tactile clicks, switches, harmonic AI chimes, and emergency klaxon sirens.
- **Simulation Toolbelt**: Instant failure injection presets (**Cavitation Burst**, **Thermal Surge**, **Hydraulic Shock**, **Restore Nominal**) and fine-grained parameter tuning sliders.
- **Executive Manager View**: Live OEE composite breakdown (Availability, Performance, Quality), financial downtime cost accumulator ($/sec), and alarm fatigue suppression ratios (98.8% filtered).

---

## 📁 Repository Structure

```
huggingface_space/
├── Dockerfile            # Hugging Face Spaces Docker build script (Port 7860)
├── README.md             # Space metadata & documentation
├── supervisord.conf      # Supervisor multi-process manager
├── start_hf.sh           # Container entrypoint bootstrapper
├── apps/
│   ├── server/           # FastAPI backend & LangGraph AI agents
│   ├── simulator/        # Python telemetry generator & fault injector
│   └── web/              # Next.js 14 cyber-industrial command center
├── packages/
│   └── shared/           # Shared Pydantic schemas & types
└── mock_server.py        # Standalone mock telemetry hub
```

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for details.

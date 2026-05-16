import os
import json
import uuid
import asyncio
from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_community.chat_models import ChatOllama

use_groq = os.getenv("USE_GROQ", "false").lower() == "true"
if use_groq:
    llm = ChatGroq(model="llama3-8b-8192", temperature=0)
else:
    ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
    ollama_model = os.getenv("OLLAMA_MODEL", "llama3")
    llm = ChatOllama(model=ollama_model, temperature=0, base_url=ollama_url)

class AgentState(TypedDict):
    telemetry_window: List[Dict[str, Any]]
    anomaly_detected: bool
    rca_report: str
    ui_mutation: Dict[str, Any]

async def node_analyze_root_cause(state: AgentState) -> AgentState:
    window = state["telemetry_window"]
    try:
        # SRE FIX: Use default=str and perform serialization inside try/except block to prevent crash
        window_json = json.dumps(window, indent=2, default=str)
        
        prompt = f"""
        You are the Lead Operations Engineer at Aegis OS. You are monitoring a high-stakes Pump Station.
        Analyze the following recent telemetry window. Sensors have registered a CRITICAL state divergence.
        
        Telemetry Window (JSON):
        {window_json}
        
        Provide a clinical, urgent, and technically precise Root Cause Analysis (RCA). 
        Do NOT use generic terminology like 'the pump is broken' or 'things are too hot'. 
        You MUST use advanced operational terminology (e.g., 'Thermal Runaway', 'Cavitation', 'Transient Pressure Spike', 'Delta-V', 'Upstream Valve Constriction').
        
        Structure Requirements:
        1. Your very first sentence MUST state your Confidence Score and a precise Time-to-Failure (TTF) estimate (e.g., "CONFIDENCE: 94% | TTF: 120 SECONDS.").
        2. Provide a 3-sentence technical situation report detailing the physical failure mechanism.
        3. List precise, aggressive mitigation steps to prevent catastrophic seal rupture or structural failure.
        """
        # SRE FIX: Enforce a strict 5-second timeout. If the LLM hangs, we fallback instantly.
        response = await asyncio.wait_for(llm.ainvoke(prompt), timeout=5.0)
        state["rca_report"] = response.content
    except Exception as e:
        print(f"[!] SRE FALLBACK ENGAGED in node_analyze_root_cause: API/Serialization Failure ({e})")
        state["rca_report"] = "FALLBACK RCA: Local telemetry indicates a massive pressure spike combined with a total loss of flow, leading to internal pump cavitation and extreme thermal generation."
        
    return state

async def node_direct_ui(state: AgentState) -> AgentState:
    rca = state["rca_report"]
    window = state["telemetry_window"]
    
    critical_sensors = list(set([
        t["sensor_id"] for t in window if t.get("status") == "critical"
    ]))
    
    prompt = f"""
    You are the UI Director Agent for Aegis OS. You must convert the following Root Cause Analysis into a strict JSON object that matches the AIIncidentReport schema.
    
    Root Cause Analysis:
    {rca}
    
    Critical Sensors Involved:
    {json.dumps(critical_sensors)}
    
    Output STRICTLY a JSON object with the following keys, and nothing else (do NOT include markdown formatting like ```json):
    - "incident_id": "{str(uuid.uuid4())}"
    - "severity": "critical"
    - "title": A short, actionable title (e.g., 'Impending Pump Failure')
    - "summary": A 1-sentence executive summary.
    - "root_cause_analysis": The full explanation from the RCA.
    - "correlated_sensors": Array of the Critical Sensor IDs.
    - "recommended_actions": Array of string steps for mitigation.
    - "confidence_score": A float between 0.0 and 1.0 (e.g., 0.95).
    """
    
    try:
        # SRE FIX: 5-second timeout for the UI structuring agent
        response = await asyncio.wait_for(llm.ainvoke(prompt), timeout=5.0)
        raw_json = response.content.strip()
        
        if raw_json.startswith("```json"):
            raw_json = raw_json[7:]
        if raw_json.startswith("```"):
            raw_json = raw_json[3:]
        if raw_json.endswith("```"):
            raw_json = raw_json[:-3]
            
        ui_mutation = json.loads(raw_json.strip())
        
    except Exception as e:
        print(f"[!] SRE FALLBACK ENGAGED in node_direct_ui: Generating Hardcoded Payload ({e})")
        ui_mutation = {
            "incident_id": f"DEMO-FALLBACK-{str(uuid.uuid4())[:8]}",
            "severity": "critical",
            "title": "THERMAL RUNAWAY: CAVITATION DETECTED",
            "summary": "CONFIDENCE: 99% | TTF: 45 SECONDS. Critical thermal runaway detected in Pump Alpha due to severe cavitation.",
            "root_cause_analysis": "Local telemetry indicates a massive 250+ PSI pressure spike combined with a total loss of flow (50 L/min), triggering violent internal cavitation and frictional thermal generation. Seal failure is imminent.",
            "correlated_sensors": ["PUMP-ALPHA-TEMP", "PUMP-ALPHA-PRES", "PUMP-ALPHA-FLOW"],
            "recommended_actions": [
                "ENGAGE EMERGENCY STOP (E-STOP) IMMEDIATELY.",
                "Isolate upstream intake valves to halt backflow.",
                "Ventilate Zone 4 for thermal dissipation.",
                "Dispatch rapid response maintenance crew."
            ],
            "confidence_score": 0.99
        }
    
    state["ui_mutation"] = ui_mutation
    return state

workflow = StateGraph(AgentState)
workflow.add_node("analyze_root_cause", node_analyze_root_cause)
workflow.add_node("direct_ui", node_direct_ui)
workflow.set_entry_point("analyze_root_cause")
workflow.add_edge("analyze_root_cause", "direct_ui")
workflow.add_edge("direct_ui", END)

aegis_ai_agent = workflow.compile()

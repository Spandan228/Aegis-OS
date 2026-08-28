"use client";

import { useAegisStore } from "@/store/useAegisStore";
import { motion } from "framer-motion";
import { 
  AlertCircle, 
  ArrowRight, 
  BrainCircuit, 
  CheckCircle2, 
  Cpu, 
  Database, 
  GitBranch, 
  Layers, 
  Network, 
  ShieldCheck, 
  Sparkles, 
  Terminal 
} from "lucide-react";

export function AgentGraphVisualizer() {
  const globalStatus = useAegisStore((state) => state.globalStatus);
  const activeIncident = useAegisStore((state) => state.activeIncident);
  const isCritical = globalStatus === "CRITICAL";

  // Visual Nodes in the LangGraph Pipeline
  const nodes = [
    {
      id: "ingest",
      title: "Telemetry Ingest",
      sub: "Redis Pub/Sub (500ms)",
      icon: Database,
      active: true,
      color: "cyan",
    },
    {
      id: "buffer",
      title: "Window Buffer",
      sub: "Sliding Window (N=20)",
      icon: Layers,
      active: true,
      color: "cyan",
    },
    {
      id: "divergence",
      title: "Anomaly Interceptor",
      sub: "Threshold Vector Watch",
      icon: AlertCircle,
      active: isCritical,
      color: isCritical ? "crimson" : "emerald",
    },
    {
      id: "rca",
      title: "Node 1: Root Cause Analysis",
      sub: "Llama-3-8B Reasoning",
      icon: BrainCircuit,
      active: isCritical,
      color: isCritical ? "crimson" : "slate",
    },
    {
      id: "ui_director",
      title: "Node 2: UI Director",
      sub: "Pydantic Schema Direct",
      icon: Sparkles,
      active: isCritical,
      color: isCritical ? "amber" : "slate",
    },
    {
      id: "tactical",
      title: "Tactical Execution",
      sub: "Operator Mitigation",
      icon: ShieldCheck,
      active: isCritical,
      color: isCritical ? "emerald" : "slate",
    },
  ];

  return (
    <div className={`reticle-box rounded-3xl border p-6 transition-all duration-700 ${
      isCritical ? "glass-panel-critical border-red-500/40" : "glass-panel border-cyan-500/20"
    }`}>
      {/* Visualizer Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${isCritical ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`}>
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-display font-bold tracking-widest text-white">
                LANGGRAPH MULTI-AGENT ORCHESTRATION PIPELINE
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                isCritical 
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' 
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
              }`}>
                {isCritical ? 'ACTIVE INFERENCE' : 'STANDBY MONITOR'}
              </span>
            </div>
            <p className="text-[11px] font-mono text-white/40 tracking-wider">
              AUTONOMOUS ROOT-CAUSE CORRELATION & COGNITIVE ARTIFACT SYNTHESIS
            </p>
          </div>
        </div>

        {activeIncident && (
          <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-xl border border-red-500/30 text-xs font-mono text-red-400">
            <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
            <span>CONFIDENCE SCORE: {(activeIncident.confidence_score * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Interactive DAG Pipeline Graph */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mb-6 relative">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          return (
            <div key={node.id} className="relative flex flex-col">
              <div className={`flex-1 p-4 rounded-2xl border transition-all duration-500 flex flex-col justify-between ${
                node.color === 'crimson'
                  ? 'bg-red-950/40 border-red-500/60 shadow-[0_0_20px_rgba(255,0,85,0.3)] animate-pulse'
                  : node.color === 'amber'
                    ? 'bg-amber-950/30 border-amber-500/50 text-amber-300'
                    : node.color === 'emerald'
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : node.color === 'cyan'
                        ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-300'
                        : 'bg-white/[0.02] border-white/10 opacity-40'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${
                    node.color === 'crimson' 
                      ? 'bg-red-500/20 text-red-400' 
                      : node.color === 'emerald' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-cyan-500/10 text-cyan-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-white/30">0{index + 1}</span>
                </div>

                <div>
                  <h4 className="text-xs font-display font-bold text-white mb-1 leading-tight">
                    {node.title}
                  </h4>
                  <p className="text-[10px] font-mono text-white/50 tracking-wider">
                    {node.sub}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Correlation Triad & Terminal Context Window */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4 border-t border-white/5">
        {/* Sensor Coupling Matrix */}
        <div className="lg:col-span-1 p-4 rounded-2xl bg-black/40 border border-white/5">
          <span className="text-[11px] font-mono font-bold text-white/60 tracking-widest block mb-3">
            SENSOR COUPLING MATRIX
          </span>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-white/70">TEMP ↔ PRES COUPLING</span>
              <span className={`font-bold ${isCritical ? 'text-red-400' : 'text-cyan-400'}`}>
                {isCritical ? '+0.94 (HIGH)' : '+0.12 (NOMINAL)'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-white/70">PRES ↔ FLOW DIVERGENCE</span>
              <span className={`font-bold ${isCritical ? 'text-red-400' : 'text-emerald-400'}`}>
                {isCritical ? '-0.88 (INVERSE SPIKE)' : '-0.05 (STABLE)'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-white/70">CAVITATION PROBABILITY</span>
              <span className={`font-bold ${isCritical ? 'text-red-400' : 'text-white/40'}`}>
                {isCritical ? '98.4%' : '0.2%'}
              </span>
            </div>
          </div>
        </div>

        {/* Live LangGraph Execution Stream */}
        <div className="lg:col-span-2 p-4 rounded-2xl bg-black/60 border border-white/5 font-mono text-[11px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 font-bold tracking-widest flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              SLIDING CONTEXT AGENT STREAM
            </span>
            <span className="text-[10px] text-cyan-400/50">POLL: 500MS</span>
          </div>

          <div className="space-y-1.5 text-white/70 overflow-hidden">
            <div className="text-cyan-400/80">
              <span className="text-white/30">[{new Date().toISOString().substring(11, 19)}]</span> [SUPERVISOR] Listening to redis://localhost:6379/0 channel=telemetry:raw
            </div>
            {isCritical ? (
              <>
                <div className="text-red-400">
                  <span className="text-white/30">[{new Date().toISOString().substring(11, 19)}]</span> [INTERCEPTOR] Critical state divergence detected in Pump Station Alpha!
                </div>
                <div className="text-purple-300">
                  <span className="text-white/30">[{new Date().toISOString().substring(11, 19)}]</span> [NODE 1: RCA] Dispatched sliding telemetry window (20 frames) to LLM.
                </div>
                <div className="text-emerald-400">
                  <span className="text-white/30">[{new Date().toISOString().substring(11, 19)}]</span> [NODE 2: UI] Parsed AIIncidentReport schema. Escalated to Operator HUD.
                </div>
              </>
            ) : (
              <div className="text-emerald-400/70">
                <span className="text-white/30">[{new Date().toISOString().substring(11, 19)}]</span> [MONITOR] Telemetry stream within calibrated nominal bounds (0 alerts suppressed).
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { WebSocketBridge } from "@/components/WebSocketBridge";
import { SensorWidget } from "@/components/SensorWidget";
import { AICopilot } from "@/components/AICopilot";
import { ManagerView } from "@/components/ManagerView";
import { MissionControlHeader } from "@/components/MissionControlHeader";
import { DigitalTwinSchematic } from "@/components/DigitalTwinSchematic";
import { AgentGraphVisualizer } from "@/components/AgentGraphVisualizer";
import { SimulationToolbelt } from "@/components/SimulationToolbelt";
import { IncidentHistoryDrawer } from "@/components/IncidentHistoryDrawer";
import { useAegisStore } from "@/store/useAegisStore";
import { 
  Activity, 
  Cpu, 
  Database, 
  Flame, 
  Gauge, 
  History, 
  LayoutDashboard, 
  Radio, 
  Settings2, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Sliders, 
  Waves 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CommandCenter() {
  const globalStatus = useAegisStore((state) => state.globalStatus);
  const activeIncident = useAegisStore((state) => state.activeIncident);
  const connectionStatus = useAegisStore((state) => state.connectionStatus);
  const userRole = useAegisStore((state) => state.userRole);
  const isEditMode = useAegisStore((state) => state.isEditMode);
  const setIsEditMode = useAegisStore((state) => state.setIsEditMode);
  const activeStation = useAegisStore((state) => state.activeStation);
  const crtEffectEnabled = useAegisStore((state) => state.crtEffectEnabled);
  const injectLocalFault = useAegisStore((state) => state.injectLocalFault);

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SCHEMATIC' | 'AGENTS'>('OVERVIEW');

  const isCritical = globalStatus === "CRITICAL";

  // God Mode Override Keyboard Shortcut: Ctrl + Shift + K
  useEffect(() => {
    const handleGodMode = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        try {
          fetch("/api/simulator/inject-failure", { method: "POST" });
        } catch {
          // Swallow error
        }
        injectLocalFault('CAVITATION');
      }
    };
    
    window.addEventListener("keydown", handleGodMode);
    return () => window.removeEventListener("keydown", handleGodMode);
  }, [injectLocalFault]);

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 overflow-x-hidden relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Cyber Grid */}
      <div className="fixed inset-0 cyber-grid opacity-40 pointer-events-none z-0" />

      {/* Ambient Pulsing Hazard Background during Critical Alarm */}
      {isCritical && (
        <div className="fixed inset-0 bg-red-950/20 mix-blend-color-dodge animate-pulse-fast pointer-events-none z-0" />
      )}

      {/* CRT SCANLINE AND FLICKER EFFECT */}
      {crtEffectEnabled && (
        <motion.div 
          className="pointer-events-none fixed inset-0 z-50 mix-blend-overlay opacity-15"
          style={{
            backgroundImage: `linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.95) 50%)`,
            backgroundSize: `100% 4px`,
          }}
          animate={{ opacity: [0.12, 0.18, 0.10, 0.15, 0.12] }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        />
      )}

      {/* Real-time WebSocket & Telemetry Stream Engine */}
      <WebSocketBridge />

      {/* AI Incident Director Slide-Out Tactical HUD */}
      <AICopilot />

      {/* Interactive Simulation Toolbelt & Fault Injector */}
      <SimulationToolbelt />

      {/* Main Content Layout Container */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="relative z-10 px-6 py-6 lg:px-10 lg:py-8 max-w-[1920px] mx-auto transition-all"
        style={{ paddingRight: activeIncident ? "570px" : undefined }}
      >
        {/* Unified Mission Control Header */}
        <MissionControlHeader />

        {userRole === 'MANAGER' ? (
          <ManagerView />
        ) : (
          <div className="space-y-8">
            {/* Operator Navigation & Sub-View Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('OVERVIEW')}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-widest transition-all flex items-center gap-2 ${
                    activeTab === 'OVERVIEW'
                      ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Gauge className="w-4 h-4" />
                  <span>FULL TELEMETRY HUD</span>
                </button>

                <button
                  onClick={() => setActiveTab('SCHEMATIC')}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-widest transition-all flex items-center gap-2 ${
                    activeTab === 'SCHEMATIC'
                      ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  <span>DIGITAL TWIN SCHEMATIC</span>
                </button>

                <button
                  onClick={() => setActiveTab('AGENTS')}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-widest transition-all flex items-center gap-2 ${
                    activeTab === 'AGENTS'
                      ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>LANGGRAPH AGENTS</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <IncidentHistoryDrawer />

                <button 
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold tracking-widest border transition-all ${
                    isEditMode 
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{isEditMode ? 'DONE EDITING' : 'CUSTOMIZE HUD'}</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: OVERVIEW (Full HUD) */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-8">
                {/* 1. Digital Twin Vector Schematic */}
                <section>
                  <DigitalTwinSchematic />
                </section>

                {/* 2. Real-Time High-Density Sensor Widgets Grid */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-display font-bold text-white/40 tracking-[0.25em]">
                      PRIMARY TELEMETRY MATRIX // {activeStation}
                    </h3>
                    <span className="text-[10px] font-mono text-cyan-400/60">
                      SAMPLING RATE: 500MS // 2.0 HZ
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SensorWidget 
                      sensor_id={`${activeStation}-TEMP`}
                      label="BEARING HOUSING TEMPERATURE"
                      iconType="temperature"
                      minRange={20}
                      maxRange={120}
                      warnThreshold={70}
                      critThreshold={80}
                    />

                    <SensorWidget 
                      sensor_id={`${activeStation}-PRES`}
                      label="DISCHARGE MANIFOLD PRESSURE"
                      iconType="pressure"
                      minRange={50}
                      maxRange={320}
                      warnThreshold={180}
                      critThreshold={220}
                    />

                    <SensorWidget 
                      sensor_id={`${activeStation}-FLOW`}
                      label="INLET VOLUMETRIC FLOW RATE"
                      iconType="flow"
                      minRange={0}
                      maxRange={400}
                      warnThreshold={150}
                      critThreshold={100}
                    />
                  </div>
                </section>

                {/* 3. LangGraph Visual Orchestrator & Correlation Triad */}
                <section>
                  <AgentGraphVisualizer />
                </section>
              </div>
            )}

            {/* TAB CONTENT: SCHEMATIC ONLY */}
            {activeTab === 'SCHEMATIC' && (
              <div className="space-y-8">
                <DigitalTwinSchematic />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SensorWidget sensor_id={`${activeStation}-TEMP`} label="BEARING TEMP" iconType="temperature" />
                  <SensorWidget sensor_id={`${activeStation}-PRES`} label="DISCHARGE PRESSURE" iconType="pressure" />
                  <SensorWidget sensor_id={`${activeStation}-FLOW`} label="INLET FLOW RATE" iconType="flow" />
                </div>
              </div>
            )}

            {/* TAB CONTENT: AGENT PIPELINE ONLY */}
            {activeTab === 'AGENTS' && (
              <div className="space-y-8">
                <AgentGraphVisualizer />
                <DigitalTwinSchematic />
              </div>
            )}
          </div>
        )}
      </motion.div>
    </main>
  );
}

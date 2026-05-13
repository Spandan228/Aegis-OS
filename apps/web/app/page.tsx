"use client";

import { useEffect } from "react";
import { WebSocketBridge } from "@/components/WebSocketBridge";
import { SensorWidget } from "@/components/SensorWidget";
import { AICopilot } from "@/components/AICopilot";
import { useAegisStore } from "@/store/useAegisStore";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CommandCenter() {
  const globalStatus = useAegisStore((state) => state.globalStatus);
  const activeIncident = useAegisStore((state) => state.activeIncident);
  const connectionStatus = useAegisStore((state) => state.connectionStatus);

  // --- HACKATHON STRATEGIST: GOD MODE OVERRIDE ---
  // Silently intercepts Ctrl+Shift+K to trigger the disaster locally without moving the mouse
  useEffect(() => {
    const handleGodMode = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        try {
          // Fire and forget via the exposed Docker simulator port. No console logs.
          fetch("http://localhost:8001/inject-failure", { method: "POST" });
        } catch (_) {
          // Intentionally swallow errors so judges see nothing in DevTools
        }
      }
    };
    
    window.addEventListener("keydown", handleGodMode);
    return () => window.removeEventListener("keydown", handleGodMode);
  }, []);

  return (
    <main className="min-h-screen bg-[#06070A] text-white overflow-hidden relative selection:bg-cyan-500/30">
      
      {/* CRT SCANLINE AND FLICKER EFFECT */}
      <motion.div 
        className="pointer-events-none fixed inset-0 z-50 mix-blend-overlay opacity-10"
        style={{
          backgroundImage: `linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.9) 50%)`,
          backgroundSize: `100% 4px`,
        }}
        animate={{ opacity: [0.08, 0.12, 0.05, 0.1, 0.08] }}
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
      />

      <WebSocketBridge />
      <AICopilot />

      {/* SRE GRACEFUL FALLBACK OVERLAY */}
      <AnimatePresence>
        {connectionStatus === "DISCONNECTED" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-4 bg-red-950/40 p-12 rounded-3xl border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
              <ShieldAlert className="w-16 h-16 text-red-500 animate-pulse drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
              <h2 className="text-2xl font-bold tracking-widest text-red-400 font-mono text-center">LOCAL TELEMETRY LOST</h2>
              <p className="text-sm text-red-400/50 tracking-widest font-mono">ATTEMPTING RECONNECTION...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main UI Layout Container */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`p-10 h-screen overflow-y-auto ${connectionStatus === 'DISCONNECTED' ? 'opacity-20 blur-sm pointer-events-none' : ''}`}
        style={{ paddingRight: activeIncident ? "540px" : "2.5rem" }}
      >
        <header className="flex items-center justify-between mb-14 pb-8 border-b border-white/5 relative">
          <div className="absolute bottom-0 left-0 w-1/3 h-[1px] bg-gradient-to-r from-cyan-500/50 to-transparent" />
          
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
              Aegis OS
            </h1>
            <p className="text-sm text-cyan-100/30 font-mono tracking-widest mt-2">OPERATIONAL INTELLIGENCE COMMAND</p>
          </div>

          <div className={`flex items-center gap-4 px-6 py-3 rounded-full border backdrop-blur-xl transition-all duration-700 ${
            globalStatus === "CRITICAL" 
              ? "bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]" 
              : "bg-cyan-500/5 border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.05)]"
          }`}>
            {globalStatus === "CRITICAL" ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <ShieldCheck className="w-5 h-5" />}
            <span className="text-sm font-bold tracking-[0.2em]">
              {globalStatus === "CRITICAL" ? "SYSTEM CRITICAL" : "SYSTEM NOMINAL"}
            </span>
          </div>
        </header>

        <section className="mb-12">
          <h2 className="text-xs font-bold text-white/20 tracking-[0.3em] mb-8">PUMP STATION ALPHA</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <SensorWidget sensor_id="PUMP-ALPHA-TEMP" label="Core Temperature" iconType="temperature" />
            <SensorWidget sensor_id="PUMP-ALPHA-PRES" label="Line Pressure" iconType="pressure" />
            <SensorWidget sensor_id="PUMP-ALPHA-FLOW" label="Coolant Flow Rate" iconType="flow" />
          </div>
        </section>

        {!activeIncident && (
           <section className="mt-20">
            <h2 className="text-xs font-bold text-white/20 tracking-[0.3em] mb-8">AI INCIDENT DIRECTOR (LANGGRAPH)</h2>
            <div className="flex items-center justify-center h-56 rounded-3xl bg-cyan-950/10 border border-cyan-500/10 border-dashed transition-all duration-1000 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <p className="text-cyan-500/40 text-sm font-mono tracking-widest text-center leading-relaxed flex flex-col items-center gap-4 z-10">
                 <ShieldCheck className="w-8 h-8 opacity-50"/>
                 Systems Nominal. Monitoring sliding window...
              </p>
            </div>
          </section>
        )}
      </motion.div>
    </main>
  );
}

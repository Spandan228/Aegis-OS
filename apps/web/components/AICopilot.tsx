"use client";

import { useAegisStore } from "@/store/useAegisStore";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, CheckSquare, Sparkles, BrainCircuit } from "lucide-react";
import { useState, useEffect } from "react";

// Micro-interaction typewriter component for the AI summary
const TypewriterText = ({ text = "" }: { text?: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  // SRE DEFENSE: Ensure text is always a string even if the AI hallucinates and omits it
  const safeText = typeof text === 'string' ? text : "Awaiting AI summary...";

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(safeText.substring(0, i + 1));
      i++;
      if (i >= safeText.length) clearInterval(intervalId);
    }, 20);
    return () => clearInterval(intervalId);
  }, [safeText]);

  return <span>{displayedText}</span>;
};

export function AICopilot() {
  const activeIncident = useAegisStore((state) => state.activeIncident);
  const setActiveIncident = useAegisStore((state) => state.setActiveIncident);

  const handleResolve = async () => {
    try {
      await fetch("/api/simulator/reset", { method: "POST" });
      setActiveIncident(null);
    } catch (err) {
      console.error("Failed to reset simulator", err);
    }
  };

  // SRE DEFENSE: Safely parse the recommended actions to prevent fatal .map crashes
  const safeMitigationSteps = Array.isArray(activeIncident?.recommended_actions)
    ? activeIncident.recommended_actions
    : typeof activeIncident?.recommended_actions === 'string'
      ? [activeIncident.recommended_actions]
      : ["Follow standard emergency protocols.", "Awaiting further instructions from E-STOP protocol."];

  return (
    <AnimatePresence>
      {activeIncident && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 25 }}
          className="fixed top-0 right-0 h-full w-[520px] bg-[#05050A]/75 backdrop-blur-3xl border-l border-white/10 p-10 shadow-[-40px_0_100px_rgba(0,0,0,0.95)] overflow-y-auto z-50 flex flex-col"
        >
          {/* Futuristic Copilot Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              <BrainCircuit className="w-7 h-7 animate-pulse" />
              <h2 className="text-xl font-bold tracking-widest font-mono">LANGGRAPH AI</h2>
            </div>
            <span className="text-xs font-mono bg-red-500/20 text-red-400 px-4 py-1.5 rounded-full border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              INCIDENT: {activeIncident.incident_id?.split("-")[0] || "CRITICAL"}
            </span>
          </div>

          <h3 className="text-3xl font-bold text-white mb-4 leading-tight tracking-tight drop-shadow-md">
            {activeIncident.title || "Critical System Anomaly"}
          </h3>
          
          {/* Auto-typing Summary */}
          <div className="text-cyan-50 text-sm mb-10 leading-relaxed italic bg-cyan-950/30 p-5 rounded-xl border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.05)]">
            <TypewriterText text={activeIncident.summary} />
          </div>

          {/* Root Cause Analysis output from Node 1 */}
          <div className="mb-12">
            <h4 className="text-xs font-bold text-purple-300/60 tracking-widest mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> ROOT CAUSE ANALYSIS
            </h4>
            <p className="text-white/80 text-sm leading-relaxed tracking-wide">
              {activeIncident.root_cause_analysis || "RCA telemetry unavailable or corrupted."}
            </p>
          </div>

          {/* Glowing Checkbox Mitigation Steps */}
          <div className="mb-auto">
            <h4 className="text-xs font-bold text-emerald-300/60 tracking-widest mb-6">RECOMMENDED ACTIONS</h4>
            <ul className="space-y-6">
              {safeMitigationSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-4 group cursor-pointer">
                  <div className="mt-0.5 relative">
                    <div className="absolute inset-0 bg-cyan-400/30 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CheckSquare className="relative w-5 h-5 text-white/20 group-hover:text-cyan-400 transition-colors duration-300" />
                  </div>
                  <span className="text-sm text-white/60 group-hover:text-white transition-colors duration-300 tracking-wide leading-relaxed">
                    {step}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Physical System Reset */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <button
              onClick={handleResolve}
              className="w-full py-5 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600/90 to-teal-500/90 hover:from-emerald-500 hover:to-teal-400 text-white font-bold tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] border border-emerald-500/30 hover:border-emerald-400/50"
            >
              <XCircle className="w-6 h-6" />
              RESOLVE & RESET SYSTEM
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

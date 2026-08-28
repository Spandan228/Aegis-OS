"use client";

import { useAegisStore } from "@/store/useAegisStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertOctagon, 
  BrainCircuit, 
  CheckCircle2, 
  CheckSquare, 
  Flame, 
  Gauge, 
  RotateCcw, 
  ShieldAlert, 
  Sliders, 
  Sparkles, 
  Square, 
  X, 
  XCircle, 
  Zap 
} from "lucide-react";
import { useState, useEffect } from "react";

// Micro-interaction typewriter component for AI summary
const TypewriterText = ({ text = "" }: { text?: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  const safeText = typeof text === 'string' ? text : "Synthesizing operational intelligence summary...";

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(safeText.substring(0, i + 1));
      i++;
      if (i >= safeText.length) clearInterval(intervalId);
    }, 15);
    return () => clearInterval(intervalId);
  }, [safeText]);

  return <span>{displayedText}</span>;
};

export function AICopilot() {
  const activeIncident = useAegisStore((state) => state.activeIncident);
  const resolveActiveIncident = useAegisStore((state) => state.resolveActiveIncident);
  const valves = useAegisStore((state) => state.valves);
  const toggleValve = useAegisStore((state) => state.toggleValve);
  
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [isResetting, setIsResetting] = useState(false);

  // Reset completed steps when new incident arrives
  useEffect(() => {
    if (activeIncident) {
      setCompletedSteps({});
    }
  }, [activeIncident?.incident_id]);

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleResolve = async () => {
    setIsResetting(true);
    try {
      await fetch("/api/simulator/reset", { method: "POST" });
    } catch {
      // Standalone client fallback
    }
    setTimeout(() => {
      resolveActiveIncident();
      setIsResetting(false);
    }, 500);
  };

  const safeMitigationSteps = Array.isArray(activeIncident?.recommended_actions)
    ? activeIncident.recommended_actions
    : typeof activeIncident?.recommended_actions === 'string'
      ? [activeIncident.recommended_actions]
      : [
          "Engage auxiliary bypass valve V-102 immediately.",
          "Throttle main intake valve V-101 to relieve vacuum tension.",
          "Vent pressure via relief valve PRV-201.",
          "Dispatch mechanical inspection team to Zone 4."
        ];

  return (
    <AnimatePresence>
      {activeIncident && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 28 }}
          className="fixed top-0 right-0 h-full w-full max-w-[540px] bg-[#030714]/90 backdrop-blur-3xl border-l border-red-500/30 p-8 shadow-[-30px_0_90px_rgba(255,0,85,0.25)] overflow-y-auto z-50 flex flex-col justify-between"
        >
          {/* Tactical Copilot Header */}
          <div>
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
              <div className="flex items-center gap-3 text-cyan-400">
                <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-display font-bold tracking-widest text-white">
                    AI INCIDENT DIRECTOR
                  </h2>
                  <span className="text-[10px] font-mono text-cyan-400 tracking-widest">
                    LANGGRAPH AUTONOMOUS REASONING
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/40 font-bold tracking-widest animate-pulse">
                  {activeIncident.incident_id?.split("-")[0] || "CRITICAL"}
                </span>
                <button 
                  onClick={resolveActiveIncident}
                  className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Incident Title */}
            <h3 className="text-xl font-display font-extrabold text-white mb-3 leading-tight tracking-tight glow-crimson">
              {activeIncident.title}
            </h3>

            {/* Executive Situation Report Typewriter */}
            <div className="mb-6 p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-cyan-200 text-xs font-mono leading-relaxed">
              <TypewriterText text={activeIncident.summary} />
            </div>

            {/* Root Cause Analysis Detailed Breakdown */}
            <div className="mb-6 p-5 rounded-2xl bg-black/40 border border-white/5">
              <h4 className="text-[11px] font-mono font-bold text-purple-300 tracking-widest mb-2.5 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                PHYSICAL ROOT CAUSE ANALYSIS (RCA)
              </h4>
              <p className="text-white/80 text-xs leading-relaxed font-sans">
                {activeIncident.root_cause_analysis}
              </p>
            </div>

            {/* Tactical Fast-Action Physical Valve Overrides */}
            <div className="mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[11px] font-mono font-bold text-white/50 tracking-widest block mb-3 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                TACTICAL PHYSICAL VALVE OVERRIDES
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => toggleValve('bypassValve')}
                  className={`p-2.5 rounded-xl border text-xs font-mono font-bold flex items-center justify-between transition-all ${
                    valves.bypassValve 
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(255,184,0,0.3)]' 
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>V-102 BYPASS</span>
                  <span>{valves.bypassValve ? 'OPEN' : 'CLOSED'}</span>
                </button>

                <button
                  onClick={() => toggleValve('reliefValve')}
                  className={`p-2.5 rounded-xl border text-xs font-mono font-bold flex items-center justify-between transition-all ${
                    valves.reliefValve 
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>PRV-201 RELIEF</span>
                  <span>{valves.reliefValve ? 'VENTING' : 'SEALED'}</span>
                </button>
              </div>
            </div>

            {/* Checkable Mitigation Protocol Steps */}
            <div className="mb-6">
              <h4 className="text-[11px] font-mono font-bold text-emerald-300/80 tracking-widest mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                MITIGATION PROTOCOL CHECKLIST
              </h4>
              <ul className="space-y-2.5">
                {safeMitigationSteps.map((step, idx) => {
                  const isDone = completedSteps[idx];
                  return (
                    <li 
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isDone 
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200' 
                          : 'bg-black/30 border-white/5 text-white/70 hover:border-cyan-500/30 hover:text-white'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isDone ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-white/30" />
                        )}
                      </div>
                      <span className={`text-xs leading-relaxed font-mono ${isDone ? 'line-through opacity-70' : ''}`}>
                        {step}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Bottom Action: Physical Reset Button */}
          <div className="pt-6 border-t border-white/10">
            <button
              onClick={handleResolve}
              disabled={isResetting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-black font-display font-extrabold tracking-widest text-sm transition-all shadow-[0_0_35px_rgba(0,255,157,0.35)] hover:shadow-[0_0_50px_rgba(0,255,157,0.6)] flex items-center justify-center gap-2 border border-emerald-400/50"
            >
              <RotateCcw className={`w-5 h-5 ${isResetting ? 'animate-spin' : ''}`} />
              {isResetting ? "RESETTING PHYSICAL PLANT..." : "RESOLVE & RESTORE NOMINAL STATE"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useAegisStore } from "@/store/useAegisStore";
import { motion } from "framer-motion";
import { 
  AlertCircle, 
  ArrowDownRight, 
  ArrowUpRight, 
  Award, 
  CheckCircle2, 
  DollarSign, 
  Factory, 
  Filter, 
  Layers, 
  PieChart, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingDown, 
  TrendingUp, 
  Zap 
} from "lucide-react";
import { useState, useEffect } from "react";

export function ManagerView() {
  const globalStatus = useAegisStore((state) => state.globalStatus);
  const incidentHistory = useAegisStore((state) => state.incidentHistory);
  const isCritical = globalStatus === "CRITICAL";

  // Financial downtime accumulator
  const [downtimeCost, setDowntimeCost] = useState(isCritical ? 14250 : 0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCritical) {
      interval = setInterval(() => {
        setDowntimeCost((prev) => prev + 125); // Adds $125 every 2 seconds during critical downtime
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isCritical]);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Executive Hero Banner */}
      <div className={`reticle-box p-8 rounded-3xl border backdrop-blur-2xl transition-all duration-700 ${
        isCritical ? 'glass-panel-critical border-red-500/50' : 'glass-panel border-cyan-500/20'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest border ${
                isCritical 
                  ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse' 
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              }`}>
                {isCritical ? 'CRITICAL DISRUPTION ACTIVE' : 'PLANT EFFICIENCY: OPTIMAL'}
              </span>
              <span className="text-xs font-mono text-white/40">ISO-55000 ASSET INTEGRITY</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-display font-extrabold text-white tracking-wide">
              EXECUTIVE OPERATIONAL DASHBOARD
            </h2>
            <p className="text-xs text-white/50 font-mono tracking-wider mt-1">
              AGGREGATED METRICS ACROSS MULTI-STATION INFRASTRUCTURE
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] font-mono text-white/40 tracking-widest block">
                ALARM FATIGUE SUPPRESSION RATIO
              </span>
              <span className="text-2xl font-mono font-black text-cyan-400 glow-cyan">
                98.8% FILTERED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Plant Uptime */}
        <div className={`reticle-box p-6 rounded-3xl border backdrop-blur-xl flex flex-col justify-between ${
          isCritical ? 'bg-red-950/20 border-red-500/30' : 'glass-panel border-cyan-500/20'
        }`}>
          <div className="flex items-center justify-between text-white/50 mb-4">
            <span className="text-xs font-mono tracking-widest">OVERALL UPTIME</span>
            <Factory className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-5xl font-mono font-extrabold text-white tracking-tight">
              {isCritical ? "98.2" : "99.98"}
            </span>
            <span className="text-xl font-mono text-white/50">%</span>
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-mono ${isCritical ? 'text-red-400' : 'text-emerald-400'}`}>
            {isCritical ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            <span>{isCritical ? "-1.78% from baseline" : "+0.15% benchmark"}</span>
          </div>
        </div>

        {/* KPI 2: Overall Equipment Effectiveness (OEE) */}
        <div className="reticle-box p-6 rounded-3xl border glass-panel border-cyan-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 mb-4">
            <span className="text-xs font-mono tracking-widest">OEE COMPOSITE</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className={`text-5xl font-mono font-extrabold tracking-tight ${isCritical ? 'text-amber-400' : 'text-white'}`}>
              {isCritical ? "64" : "89"}
            </span>
            <span className="text-xl font-mono text-white/50">/100</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pt-2 border-t border-white/5">
            <span>AVAIL: {isCritical ? "72%" : "96%"}</span>
            <span>PERF: {isCritical ? "61%" : "92%"}</span>
          </div>
        </div>

        {/* KPI 3: Financial Downtime Cost */}
        <div className={`reticle-box p-6 rounded-3xl border backdrop-blur-xl flex flex-col justify-between ${
          isCritical ? 'bg-red-950/30 border-red-500/40' : 'glass-panel border-cyan-500/20'
        }`}>
          <div className="flex items-center justify-between text-white/50 mb-4">
            <span className="text-xs font-mono tracking-widest">EST. DOWNTIME LOSS</span>
            <DollarSign className="w-5 h-5 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-mono text-white/50">$</span>
            <span className={`text-4xl font-mono font-extrabold tracking-tight ${isCritical ? 'text-red-400 glow-crimson' : 'text-white'}`}>
              {downtimeCost.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-white/40">
            <span>{isCritical ? "Accruing at $3,750 / min" : "Zero financial drift"}</span>
          </div>
        </div>

        {/* KPI 4: Mean Time to Recovery (MTTR) */}
        <div className="reticle-box p-6 rounded-3xl border glass-panel border-cyan-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 mb-4">
            <span className="text-xs font-mono tracking-widest">AI-ACCELERATED MTTR</span>
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-5xl font-mono font-extrabold text-emerald-400 tracking-tight glow-emerald">
              1.4
            </span>
            <span className="text-xl font-mono text-white/50">MIN</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400/70">
            <TrendingDown className="w-4 h-4" />
            <span>-82% vs manual diagnosis</span>
          </div>
        </div>
      </div>

      {/* Deep-Dive Operational Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: OEE Sub-Component Breakdown */}
        <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20">
          <h3 className="text-xs font-display font-bold text-white/80 tracking-widest mb-6 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-400" />
            EQUIPMENT EFFECTIVENESS BREAKDOWN
          </h3>
          
          <div className="space-y-4 font-mono text-xs">
            <div>
              <div className="flex justify-between text-white/70 mb-1.5">
                <span>AVAILABILITY FACTOR</span>
                <span className="text-cyan-400 font-bold">{isCritical ? "72.4%" : "96.8%"}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: isCritical ? "72.4%" : "96.8%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-white/70 mb-1.5">
                <span>PERFORMANCE EFFICIENCY</span>
                <span className="text-emerald-400 font-bold">{isCritical ? "61.2%" : "94.1%"}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: isCritical ? "61.2%" : "94.1%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-white/70 mb-1.5">
                <span>QUALITY & TOLERANCE</span>
                <span className="text-amber-400 font-bold">99.4%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-amber-400" style={{ width: "99.4%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right: Executive Situation & AI Mitigation Report */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-panel border border-cyan-500/20 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-display font-bold text-white/80 tracking-widest mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              INTELLIGENCE SUMMARY & ROOT CAUSE AUDIT
            </h3>
            
            {isCritical ? (
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs font-mono text-red-200 leading-relaxed mb-4">
                ⚠️ <strong className="text-white">Active Critical Incident:</strong> Pump Station Alpha hydraulic cavitation detected with thermal runaway coupling. LangGraph has isolated physical root cause to upstream intake pressure drop and recommended bypass routing.
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs font-mono text-emerald-300 leading-relaxed mb-4">
                ✓ <strong className="text-white">All Stations Nominal:</strong> Real-time telemetry is operating comfortably inside nominal safety envelopes. Total of 1,480 raw sensor micro-fluctuations analyzed and correlated without operator alert spam.
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-white/30 text-[10px] block">TOTAL ALERTS INTERCEPTED</span>
                <span className="text-white font-bold text-sm">2,419</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-white/30 text-[10px] block">ESCALATED TO OPERATOR</span>
                <span className="text-cyan-400 font-bold text-sm">1 High-Signal Report</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-white/30 text-[10px] block">INCIDENT RESPONSE SLA</span>
                <span className="text-emerald-400 font-bold text-sm">&lt; 30 SECONDS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

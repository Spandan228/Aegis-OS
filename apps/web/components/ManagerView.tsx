"use client";

import { motion } from "framer-motion";
import { useAegisStore } from "@/store/useAegisStore";
import { ArrowUpRight, CheckCircle, Factory, ShieldAlert, TrendingDown } from "lucide-react";

export function ManagerView() {
  const globalStatus = useAegisStore((state) => state.globalStatus);
  const isCritical = globalStatus === "CRITICAL";

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Overall Uptime */}
        <div className={`p-6 rounded-2xl border backdrop-blur-md flex flex-col gap-4 ${isCritical ? 'bg-red-950/20 border-red-500/30' : 'bg-cyan-950/20 border-cyan-500/20'}`}>
          <div className="flex items-center justify-between text-white/50">
            <span className="text-sm font-mono tracking-widest">PLANT UPTIME</span>
            <Factory className="w-5 h-5" />
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold tabular-nums text-white">{isCritical ? "98.4" : "99.9"}</span>
            <span className="text-xl text-white/50 mb-1">%</span>
          </div>
          <div className={`flex items-center gap-1 text-xs ${isCritical ? 'text-red-400' : 'text-emerald-400'}`}>
            {isCritical ? <TrendingDown className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
            <span>{isCritical ? "-1.5% from last hour" : "+0.1% from last month"}</span>
          </div>
        </div>

        {/* Metric 2: OEE */}
        <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-sm font-mono tracking-widest">OEE SCORE</span>
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold tabular-nums text-white">{isCritical ? "62" : "85"}</span>
            <span className="text-xl text-white/50 mb-1">/100</span>
          </div>
          <div className={`flex items-center gap-1 text-xs ${isCritical ? 'text-red-400' : 'text-white/30'}`}>
            {isCritical ? <TrendingDown className="w-4 h-4" /> : <span>Optimal range</span>}
          </div>
        </div>

        {/* Metric 3: Active Alerts */}
        <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-sm font-mono tracking-widest">ACTIVE INCIDENTS</span>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex items-end gap-3">
            <span className={`text-4xl font-bold tabular-nums ${isCritical ? 'text-red-400' : 'text-white'}`}>{isCritical ? "1" : "0"}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/30">
            <span>Requires review</span>
          </div>
        </div>
        
        {/* Metric 4: Est Cost */}
        <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-sm font-mono tracking-widest">EST. DOWNTIME COST</span>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-xl text-white/50 mb-1">$</span>
            <span className={`text-4xl font-bold tabular-nums ${isCritical ? 'text-red-400' : 'text-white'}`}>{isCritical ? "12,450" : "0"}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/30">
            <span>Accumulating...</span>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-xl">
        <h3 className="text-lg font-bold tracking-widest text-white/80 mb-6 font-mono">EXECUTIVE SUMMARY</h3>
        {isCritical ? (
          <div className="space-y-4">
            <p className="text-red-400 text-sm leading-relaxed">
              ⚠️ Critical failure detected in Pump Station Alpha. AI Incident Director has been engaged and RCA is being generated. Operator response is currently pending.
            </p>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 className="h-full bg-red-500" 
                 initial={{ width: "0%" }} 
                 animate={{ width: "100%" }} 
                 transition={{ duration: 10, ease: "linear" }}
               />
            </div>
            <p className="text-xs text-white/30 text-right">Calculating mitigation pathways...</p>
          </div>
        ) : (
          <p className="text-white/40 text-sm leading-relaxed">
            All systems nominal. Production is operating at peak efficiency. No action required.
          </p>
        )}
      </div>
    </div>
  );
}

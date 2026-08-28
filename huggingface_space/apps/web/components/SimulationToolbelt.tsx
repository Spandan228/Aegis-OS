"use client";

import { useAegisStore } from "@/store/useAegisStore";
import { 
  Activity, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  Play, 
  RefreshCw, 
  Sliders, 
  SlidersHorizontal, 
  Sparkles, 
  Wrench, 
  Zap 
} from "lucide-react";
import { useState } from "react";

export function SimulationToolbelt() {
  const injectLocalFault = useAegisStore((state) => state.injectLocalFault);
  const activeStation = useAegisStore((state) => state.activeStation);
  const updateTelemetry = useAegisStore((state) => state.updateTelemetry);
  const telemetry = useAegisStore((state) => state.telemetry);
  
  const [isOpen, setIsOpen] = useState(false);

  const currentTemp = telemetry[`${activeStation}-TEMP`]?.value ?? 45.0;
  const currentPres = telemetry[`${activeStation}-PRES`]?.value ?? 120.0;
  const currentFlow = telemetry[`${activeStation}-FLOW`]?.value ?? 300.0;

  const handleManualSlider = (type: 'temp' | 'pres' | 'flow', value: number) => {
    const now = new Date().toISOString();
    if (type === 'temp') {
      const status = value > 80 ? 'critical' : value > 65 ? 'warning' : 'nominal';
      updateTelemetry({ sensor_id: `${activeStation}-TEMP`, timestamp: now, sensor_type: 'temperature', value, unit: '°C', status });
    } else if (type === 'pres') {
      const status = value > 220 ? 'critical' : value > 170 ? 'warning' : 'nominal';
      updateTelemetry({ sensor_id: `${activeStation}-PRES`, timestamp: now, sensor_type: 'pressure', value, unit: 'PSI', status });
    } else if (type === 'flow') {
      const status = value < 80 ? 'critical' : value < 150 ? 'warning' : 'nominal';
      updateTelemetry({ sensor_id: `${activeStation}-FLOW`, timestamp: now, sensor_type: 'flow_rate', value, unit: 'L/min', status });
    }
  };

  const handleTriggerBackendFailure = async () => {
    try {
      await fetch("/api/simulator/inject-failure", { method: "POST" });
    } catch {
      // Standalone client fallback
    }
    injectLocalFault('CAVITATION');
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {isOpen ? (
        <div className="reticle-box rounded-3xl bg-[#030714]/95 border border-cyan-500/30 p-6 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] w-[360px] md:w-[420px] transition-all">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-xs font-display font-bold tracking-widest text-white">
                SIMULATION INJECTOR & TEST HARNESS
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg bg-white/5 text-white/50 hover:text-white transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Preset Fault Injection Triggers */}
          <div className="mb-5">
            <span className="text-[10px] font-mono font-bold text-white/40 tracking-widest block mb-2">
              DISASTER SCENARIO PRESETS
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleTriggerBackendFailure}
                className="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,0,85,0.2)] text-left"
              >
                <Flame className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>CAVITATION BURST</span>
              </button>

              <button
                onClick={() => injectLocalFault('OVERHEAT')}
                className="p-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-2 transition-all text-left"
              >
                <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>THERMAL SURGE</span>
              </button>

              <button
                onClick={() => injectLocalFault('SURGE')}
                className="p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold flex items-center gap-2 transition-all text-left"
              >
                <Activity className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>HYDRAULIC SHOCK</span>
              </button>

              <button
                onClick={() => injectLocalFault('NORMAL')}
                className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 transition-all text-left"
              >
                <RefreshCw className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>RESTORE NOMINAL</span>
              </button>
            </div>
          </div>

          {/* Interactive Manual Value Sliders */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold text-white/40 tracking-widest block">
              FINE-GRAINED PARAMETER TUNING
            </span>

            {/* Temp Slider */}
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex justify-between text-xs font-mono mb-1 text-white/70">
                <span>TEMPERATURE</span>
                <span className="text-orange-400 font-bold">{currentTemp.toFixed(1)} °C</span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                value={currentTemp}
                onChange={(e) => handleManualSlider('temp', parseFloat(e.target.value))}
                className="w-full accent-orange-400 cursor-pointer h-1.5 bg-white/10 rounded-lg"
              />
            </div>

            {/* Pressure Slider */}
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex justify-between text-xs font-mono mb-1 text-white/70">
                <span>PRESSURE</span>
                <span className="text-yellow-400 font-bold">{currentPres.toFixed(1)} PSI</span>
              </div>
              <input
                type="range"
                min="50"
                max="300"
                value={currentPres}
                onChange={(e) => handleManualSlider('pres', parseFloat(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer h-1.5 bg-white/10 rounded-lg"
              />
            </div>

            {/* Flow Slider */}
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex justify-between text-xs font-mono mb-1 text-white/70">
                <span>FLOW RATE</span>
                <span className="text-cyan-400 font-bold">{currentFlow.toFixed(1)} L/min</span>
              </div>
              <input
                type="range"
                min="10"
                max="400"
                value={currentFlow}
                onChange={(e) => handleManualSlider('flow', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/10 rounded-lg"
              />
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-3 rounded-2xl bg-[#0B1124]/90 border border-cyan-500/40 text-cyan-300 font-display font-bold text-xs tracking-widest shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:shadow-[0_0_35px_rgba(0,240,255,0.5)] flex items-center gap-2.5 backdrop-blur-xl transition-all"
        >
          <SlidersHorizontal className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>SIMULATION TOOLBELT</span>
        </button>
      )}
    </div>
  );
}

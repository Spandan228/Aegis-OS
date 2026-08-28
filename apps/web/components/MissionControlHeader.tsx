"use client";

import { useAegisStore } from "@/store/useAegisStore";
import { 
  Bell, 
  BellOff, 
  CheckCircle2, 
  Clock, 
  Monitor, 
  Power, 
  Radio, 
  ShieldAlert, 
  ShieldCheck, 
  Sliders, 
  Tv, 
  Volume2, 
  VolumeX 
} from "lucide-react";
import { useState, useEffect } from "react";

export function MissionControlHeader() {
  const globalStatus = useAegisStore((state) => state.globalStatus);
  const activeStation = useAegisStore((state) => state.activeStation);
  const setActiveStation = useAegisStore((state) => state.setActiveStation);
  const userRole = useAegisStore((state) => state.userRole);
  const setUserRole = useAegisStore((state) => state.setUserRole);
  const isMuted = useAegisStore((state) => state.isMuted);
  const setMuted = useAegisStore((state) => state.setMuted);
  const crtEffectEnabled = useAegisStore((state) => state.crtEffectEnabled);
  const setCrtEffectEnabled = useAegisStore((state) => state.setCrtEffectEnabled);
  const triggerEStop = useAegisStore((state) => state.triggerEStop);
  const manualEStop = useAegisStore((state) => state.manualEStop);

  const [currentTime, setCurrentTime] = useState<string>("");
  const [eStopGuardOpen, setEStopGuardOpen] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace("GMT", "UTC"));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const isCritical = globalStatus === "CRITICAL";

  const stations = [
    { id: "PUMP-ALPHA", label: "PUMP ALPHA", type: "HYDRAULIC" },
    { id: "PUMP-BETA", label: "PUMP BETA", type: "BOOSTER" },
    { id: "TURBINE-GAMMA", label: "TURBINE GAMMA", type: "GEN" },
    { id: "COOLANT-DELTA", label: "COOLANT DELTA", type: "THERMAL" },
  ];

  return (
    <header className="relative mb-8 pb-6 border-b border-white/10 z-20">
      {/* Top Ambient Laser Line */}
      <div className={`absolute bottom-0 left-0 w-full h-[1px] ${
        isCritical 
          ? 'bg-gradient-to-r from-red-500 via-rose-500 to-transparent' 
          : 'bg-gradient-to-r from-cyan-500 via-emerald-500 to-transparent'
      }`} />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Brand & Mission Status */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border backdrop-blur-xl ${
              isCritical 
                ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_25px_rgba(255,0,85,0.4)]' 
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
            }`}>
              {isCritical ? <ShieldAlert className="w-6 h-6 animate-pulse" /> : <Radio className="w-6 h-6 animate-pulse" />}
            </div>
            {/* Spinning Radar Ring */}
            <div className="absolute -inset-1 rounded-2xl border border-cyan-500/20 border-dashed animate-spin-slow pointer-events-none" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-black tracking-widest bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                AEGIS OS <span className="text-xs text-cyan-400 font-mono font-normal">v2.0 PRO</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60">
                SCADA/HMI
              </span>
            </div>
            <p className="text-xs text-white/40 font-mono tracking-widest flex items-center gap-2 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400/60" />
              {currentTime || "INITIALIZING MISSION TIME..."}
            </p>
          </div>
        </div>

        {/* Center: Station Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {stations.map((st) => (
            <button
              key={st.id}
              onClick={() => setActiveStation(st.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                activeStation === st.id
                  ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${activeStation === st.id ? 'bg-cyan-400' : 'bg-white/20'}`} />
              <span>{st.label}</span>
            </button>
          ))}
        </div>

        {/* Right Strip: Controls, Audio, Roles & E-STOP */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Audio Mute Toggle */}
          <button
            onClick={() => setMuted(!isMuted)}
            className={`p-2.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 ${
              isMuted 
                ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                : 'bg-white/5 border-white/10 text-cyan-400 hover:bg-white/10'
            }`}
            title={isMuted ? "Unmute Audio Synthesis" : "Mute Audio Synthesis"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* CRT Scanline Toggle */}
          <button
            onClick={() => setCrtEffectEnabled(!crtEffectEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 ${
              crtEffectEnabled 
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' 
                : 'bg-white/5 border-white/10 text-white/40'
            }`}
            title="Toggle CRT Scanline HUD Effect"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Role Switcher */}
          <div className="flex items-center bg-white/5 rounded-2xl p-1 border border-white/10">
            <button
              onClick={() => setUserRole('OPERATOR')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold tracking-widest transition-all ${
                userRole === 'OPERATOR' 
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' 
                  : 'text-white/40 hover:text-white'
              }`}
            >
              OPERATOR
            </button>
            <button
              onClick={() => setUserRole('MANAGER')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold tracking-widest transition-all ${
                userRole === 'MANAGER' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'text-white/40 hover:text-white'
              }`}
            >
              MANAGER
            </button>
          </div>

          {/* Guarded Emergency E-STOP Button */}
          <div className="relative">
            {eStopGuardOpen ? (
              <button
                onClick={() => {
                  triggerEStop();
                  setEStopGuardOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display font-black text-xs tracking-widest border border-red-400 shadow-[0_0_25px_rgba(255,0,0,0.6)] animate-pulse flex items-center gap-1.5"
              >
                <Power className="w-4 h-4" />
                <span>CONFIRM E-STOP!</span>
              </button>
            ) : (
              <button
                onClick={() => setEStopGuardOpen(true)}
                className={`px-4 py-2 rounded-xl text-xs font-display font-bold tracking-widest border transition-all flex items-center gap-1.5 ${
                  manualEStop 
                    ? 'bg-red-950/80 border-red-500 text-red-400' 
                    : 'bg-white/5 border-red-500/40 text-red-400 hover:bg-red-500/20'
                }`}
                title="Click to flip safety glass guard for emergency plant shutdown"
              >
                <Power className="w-4 h-4" />
                <span>{manualEStop ? 'E-STOPPED' : 'E-STOP GUARD'}</span>
              </button>
            )}
          </div>

          {/* Global Status Banner */}
          <div className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border backdrop-blur-xl transition-all duration-700 ${
            isCritical
              ? "bg-red-500/20 border-red-500/60 text-red-400 shadow-[0_0_30px_rgba(255,0,85,0.4)] animate-pulse"
              : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.1)]"
          }`}>
            {isCritical ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            <span className="text-xs font-display font-extrabold tracking-[0.2em]">
              {isCritical ? "SYSTEM CRITICAL" : "SYSTEM NOMINAL"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

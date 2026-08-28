"use client";

import { useAegisStore } from "@/store/useAegisStore";
import { motion } from "framer-motion";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Flame, 
  Gauge, 
  RotateCw, 
  Sliders, 
  Waves, 
  Zap 
} from "lucide-react";
import { useState } from "react";

export function DigitalTwinSchematic() {
  const telemetry = useAegisStore((state) => state.telemetry);
  const globalStatus = useAegisStore((state) => state.globalStatus);
  const activeStation = useAegisStore((state) => state.activeStation);
  const valves = useAegisStore((state) => state.valves);
  const toggleValve = useAegisStore((state) => state.toggleValve);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const tempSensor = telemetry[`${activeStation}-TEMP`] || { value: 45.2, status: 'nominal', unit: '°C' };
  const presSensor = telemetry[`${activeStation}-PRES`] || { value: 121.8, status: 'nominal', unit: 'PSI' };
  const flowSensor = telemetry[`${activeStation}-FLOW`] || { value: 295.0, status: 'nominal', unit: 'L/min' };

  const isCritical = globalStatus === "CRITICAL";

  // Flow animation speed calculation: Higher flow = faster animation
  const flowSpeed = Math.max(0.4, Math.min(3.0, (350 - flowSensor.value) / 100));
  
  // Impeller rotation speed
  const rotorSpeed = isCritical ? 0.3 : 1.2;

  // Temperature aura intensity (0 to 1)
  const tempRatio = Math.min(1, Math.max(0, (tempSensor.value - 30) / 70));

  return (
    <div className={`reticle-box relative rounded-3xl border overflow-hidden p-6 transition-all duration-700 ${
      isCritical ? "glass-panel-critical border-red-500/50" : "glass-panel border-cyan-500/20"
    }`}>
      {/* Schematic Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${isCritical ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`}>
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-display font-bold tracking-widest text-white">
                DIGITAL TWIN: {activeStation}
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                isCritical 
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' 
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}>
                {isCritical ? 'ANOMALY DETECTED' : 'SYNCHRONIZED'}
              </span>
            </div>
            <p className="text-[11px] font-mono text-white/40 tracking-wider">
              REAL-TIME PHYSICAL TOPOLOGY & HYDRAULIC MANIFOLD
            </p>
          </div>
        </div>

        {/* Quick Valve Status Strip */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleValve('intakeValve')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
              valves.intakeValve 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(0,255,157,0.2)]' 
                : 'bg-red-500/20 border-red-500/40 text-red-400'
            }`}
            title="Click to toggle Main Intake Valve"
          >
            <span>V-101 INLET:</span>
            <span>{valves.intakeValve ? 'OPEN' : 'SHUT'}</span>
          </button>

          <button
            onClick={() => toggleValve('bypassValve')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
              valves.bypassValve 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_10px_rgba(255,184,0,0.2)]' 
                : 'bg-white/5 border-white/10 text-white/40'
            }`}
            title="Click to toggle Bypass Manifold"
          >
            <span>V-102 BYPASS:</span>
            <span>{valves.bypassValve ? 'ACTIVE' : 'ISOLATED'}</span>
          </button>

          <button
            onClick={() => toggleValve('reliefValve')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
              valves.reliefValve 
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]' 
                : 'bg-white/5 border-white/10 text-white/40'
            }`}
            title="Click to toggle Pressure Relief Valve"
          >
            <span>PRV-201:</span>
            <span>{valves.reliefValve ? 'VENTING' : 'SEALED'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Industrial Vector SVG Diagram */}
      <div className="relative w-full h-[320px] rounded-2xl bg-[#040816]/90 border border-cyan-500/10 p-2 overflow-hidden flex items-center justify-center">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 cyber-grid-dense opacity-30 pointer-events-none" />

        <svg 
          viewBox="0 0 900 360" 
          className="w-full h-full max-h-[300px] select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Fluid Pipe Gradient Normal */}
            <linearGradient id="fluidGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#00FF9D" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.8" />
            </linearGradient>

            {/* Critical Fluid Pipe Gradient */}
            <linearGradient id="fluidGradientCrit" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF0055" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#FFB800" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FF0055" stopOpacity="0.9" />
            </linearGradient>

            {/* Thermal Glow Radial Gradient */}
            <radialGradient id="thermalAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={isCritical ? "#FF0055" : "#00F0FF"} stopOpacity={0.35 + tempRatio * 0.45} />
              <stop offset="60%" stopColor={isCritical ? "#FF0055" : "#00F0FF"} stopOpacity={0.1 + tempRatio * 0.2} />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Thermal Glow Aura behind the Pump Rotor */}
          <circle 
            cx="450" 
            cy="180" 
            r={90 + tempRatio * 35} 
            fill="url(#thermalAura)" 
            className="transition-all duration-1000"
          />

          {/* 1. INTAKE PIPE (Left to Pump) */}
          <path 
            d="M 60 180 L 370 180" 
            stroke="rgba(255,255,255,0.15)" 
            strokeWidth="28" 
            strokeLinecap="round"
            fill="none" 
          />
          {/* Animated Flow inside Intake Pipe */}
          {valves.intakeValve && (
            <path 
              d="M 60 180 L 370 180" 
              stroke={isCritical ? "url(#fluidGradientCrit)" : "url(#fluidGradient)"}
              strokeWidth="12" 
              strokeDasharray="16 12"
              fill="none" 
              style={{
                animation: `flowDash ${flowSpeed}s linear infinite`,
              }}
            />
          )}

          {/* 2. BYPASS MANIFOLD (U-Curve over the Pump) */}
          <path 
            d="M 180 180 L 180 80 L 720 80 L 720 180" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="18" 
            fill="none" 
          />
          {valves.bypassValve && (
            <path 
              d="M 180 180 L 180 80 L 720 80 L 720 180" 
              stroke="#FFB800" 
              strokeWidth="8" 
              strokeDasharray="12 8" 
              fill="none" 
              style={{
                animation: `flowDash 0.8s linear infinite`,
              }}
            />
          )}

          {/* 3. DISCHARGE / HIGH-PRESSURE LINE (Pump to Right) */}
          <path 
            d="M 530 180 L 840 180" 
            stroke="rgba(255,255,255,0.15)" 
            strokeWidth="28" 
            strokeLinecap="round"
            fill="none" 
          />
          {/* Animated Flow inside Discharge Pipe */}
          <path 
            d="M 530 180 L 840 180" 
            stroke={isCritical ? "url(#fluidGradientCrit)" : "url(#fluidGradient)"}
            strokeWidth="12" 
            strokeDasharray="16 12"
            fill="none" 
            style={{
              animation: `flowDash ${flowSpeed * 0.9}s linear infinite`,
            }}
          />

          {/* 4. EMERGENCY PRESSURE RELIEF LINE (Vertical Downwards from Discharge) */}
          <path 
            d="M 640 180 L 640 290" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="16" 
            fill="none" 
          />
          {valves.reliefValve && (
            <path 
              d="M 640 180 L 640 290" 
              stroke="#00F0FF" 
              strokeWidth="6" 
              strokeDasharray="10 6" 
              fill="none" 
              style={{
                animation: `flowDash 0.5s linear infinite`,
              }}
            />
          )}

          {/* ================= PUMP HOUSING & TURBINE ================= */}
          {/* Main Volute Pump Outer Shell */}
          <circle 
            cx="450" 
            cy="180" 
            r="80" 
            fill="#0B132B" 
            stroke={isCritical ? "#FF0055" : "#00F0FF"} 
            strokeWidth="4" 
            className="transition-colors duration-500 shadow-cyber-cyan"
          />
          <circle 
            cx="450" 
            cy="180" 
            r="65" 
            fill="#060A17" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="2" 
            strokeDasharray="6 4"
          />

          {/* Rotating Impeller Turbine Blades */}
          <g 
            transform="translate(450, 180)"
            style={{
              animation: `spin ${rotorSpeed}s linear infinite`,
              transformOrigin: "center",
            }}
          >
            {/* Blade 1 */}
            <path d="M 0 0 C 15 -25 35 -35 50 -30 C 40 -15 25 0 0 0" fill={isCritical ? "#FF0055" : "#00F0FF"} opacity="0.9" />
            {/* Blade 2 */}
            <path d="M 0 0 C 25 15 35 35 30 50 C 15 40 0 25 0 0" fill={isCritical ? "#FF0055" : "#00F0FF"} opacity="0.9" />
            {/* Blade 3 */}
            <path d="M 0 0 C -15 25 -35 35 -50 30 C -40 15 -25 0 0 0" fill={isCritical ? "#FF0055" : "#00F0FF"} opacity="0.9" />
            {/* Blade 4 */}
            <path d="M 0 0 C -25 -15 -35 -35 -30 -50 C -15 -40 0 -25 0 0" fill={isCritical ? "#FF0055" : "#00F0FF"} opacity="0.9" />
            {/* Center Shaft Hub */}
            <circle cx="0" cy="0" r="14" fill="#030712" stroke="#FFF" strokeWidth="2" />
          </g>

          {/* ================= VALVES GRAPHICS ================= */}
          {/* Valve V-101 (Intake) */}
          <g 
            transform="translate(240, 180)" 
            className="cursor-pointer"
            onClick={() => toggleValve('intakeValve')}
          >
            <circle cx="0" cy="0" r="22" fill="#0B132B" stroke={valves.intakeValve ? "#00FF9D" : "#FF0055"} strokeWidth="2.5" />
            <polygon points="-12,-10 0,0 -12,10" fill={valves.intakeValve ? "#00FF9D" : "#FF0055"} />
            <polygon points="12,-10 0,0 12,10" fill={valves.intakeValve ? "#00FF9D" : "#FF0055"} />
            <text x="0" y="-30" fill="#FFF" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle" opacity="0.8">V-101</text>
          </g>

          {/* Valve V-102 (Bypass) */}
          <g 
            transform="translate(450, 80)" 
            className="cursor-pointer"
            onClick={() => toggleValve('bypassValve')}
          >
            <circle cx="0" cy="0" r="18" fill="#0B132B" stroke={valves.bypassValve ? "#FFB800" : "rgba(255,255,255,0.3)"} strokeWidth="2" />
            <polygon points="-8,-7 0,0 -8,7" fill={valves.bypassValve ? "#FFB800" : "rgba(255,255,255,0.4)"} />
            <polygon points="8,-7 0,0 8,7" fill={valves.bypassValve ? "#FFB800" : "rgba(255,255,255,0.4)"} />
            <text x="0" y="-24" fill="#FFF" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle" opacity="0.8">BYPASS V-102</text>
          </g>

          {/* Valve PRV-201 (Pressure Relief) */}
          <g 
            transform="translate(640, 240)" 
            className="cursor-pointer"
            onClick={() => toggleValve('reliefValve')}
          >
            <circle cx="0" cy="0" r="18" fill="#0B132B" stroke={valves.reliefValve ? "#00F0FF" : "rgba(255,255,255,0.3)"} strokeWidth="2" />
            <path d="M 0 -8 L 0 8 M -8 0 L 8 0" stroke={valves.reliefValve ? "#00F0FF" : "rgba(255,255,255,0.4)"} strokeWidth="2" />
            <text x="35" y="4" fill="#FFF" fontSize="10" fontFamily="JetBrains Mono" textAnchor="start" opacity="0.8">PRV-201</text>
          </g>

          {/* ================= SENSOR TAP POINTS & BADGES ================= */}
          {/* FLOW SENSOR CALLOUT (Inlet) */}
          <g transform="translate(130, 230)">
            <rect x="-45" y="-12" width="90" height="34" rx="8" fill="#030712" stroke={flowSensor.status === 'critical' ? '#FF0055' : '#00F0FF'} strokeWidth="1.5" />
            <line x1="0" y1="-12" x2="0" y2="-50" stroke={flowSensor.status === 'critical' ? '#FF0055' : '#00F0FF'} strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="0" cy="-50" r="3" fill={flowSensor.status === 'critical' ? '#FF0055' : '#00F0FF'} />
            <text x="0" y="2" fill="#88E7FF" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">FLOW RATE</text>
            <text x="0" y="16" fill="#FFF" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">
              {flowSensor.value.toFixed(1)} {flowSensor.unit}
            </text>
          </g>

          {/* TEMP SENSOR CALLOUT (Pump Housing) */}
          <g transform="translate(450, 290)">
            <rect x="-45" y="-12" width="90" height="34" rx="8" fill="#030712" stroke={tempSensor.status === 'critical' ? '#FF0055' : '#00FF9D'} strokeWidth="1.5" />
            <line x1="0" y1="-12" x2="0" y2="-30" stroke={tempSensor.status === 'critical' ? '#FF0055' : '#00FF9D'} strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="0" cy="-30" r="3" fill={tempSensor.status === 'critical' ? '#FF0055' : '#00FF9D'} />
            <text x="0" y="2" fill="#00FF9D" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">BEARING TEMP</text>
            <text x="0" y="16" fill="#FFF" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">
              {tempSensor.value.toFixed(1)} {tempSensor.unit}
            </text>
          </g>

          {/* PRESSURE SENSOR CALLOUT (Discharge) */}
          <g transform="translate(770, 115)">
            <rect x="-45" y="-12" width="90" height="34" rx="8" fill="#030712" stroke={presSensor.status === 'critical' ? '#FF0055' : '#FFB800'} strokeWidth="1.5" />
            <line x1="0" y1="22" x2="0" y2="65" stroke={presSensor.status === 'critical' ? '#FF0055' : '#FFB800'} strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="0" cy="65" r="3" fill={presSensor.status === 'critical' ? '#FF0055' : '#FFB800'} />
            <text x="0" y="2" fill="#FFB800" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">DISCHARGE PSI</text>
            <text x="0" y="16" fill="#FFF" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">
              {presSensor.value.toFixed(1)} {presSensor.unit}
            </text>
          </g>
        </svg>

        {/* Tactical HUD Corner Reticle Overlay */}
        <div className="absolute top-3 left-3 text-[10px] font-mono text-cyan-400/60 bg-black/60 px-2 py-1 rounded border border-cyan-500/20 backdrop-blur-md">
          SECTOR: HYDRAULIC MAIN // ST-01
        </div>
        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-cyan-400/60 bg-black/60 px-2 py-1 rounded border border-cyan-500/20 backdrop-blur-md">
          ROTATIONAL VELOCITY: {isCritical ? '4,850 RPM (OVERLOAD)' : '1,780 RPM (STABLE)'}
        </div>
      </div>
    </div>
  );
}

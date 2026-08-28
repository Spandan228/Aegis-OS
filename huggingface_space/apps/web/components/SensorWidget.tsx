"use client";

import { useAegisStore, TelemetryPoint } from "@/store/useAegisStore";
import { motion } from "framer-motion";
import { 
  Activity, 
  ArrowDownRight, 
  ArrowUpRight, 
  Droplets, 
  Flame, 
  Gauge, 
  Radio, 
  Sparkles, 
  Thermometer, 
  TrendingUp, 
  Zap 
} from "lucide-react";
import { useMemo } from "react";

interface Props {
  sensor_id: string;
  label: string;
  iconType: "temperature" | "pressure" | "flow";
  minRange?: number;
  maxRange?: number;
  warnThreshold?: number;
  critThreshold?: number;
}

export function SensorWidget({ 
  sensor_id, 
  label, 
  iconType,
  minRange = 0,
  maxRange = 100,
  warnThreshold = 70,
  critThreshold = 85,
}: Props) {
  const sensorData = useAegisStore((state) => state.telemetry[sensor_id]);
  const history = useAegisStore((state) => state.telemetryHistory[sensor_id]) || [];
  const isEditMode = useAegisStore((state) => state.isEditMode);

  // Fallback defaults calibrated to physical sensor types
  const calibration = useMemo(() => {
    if (iconType === "temperature") {
      return { min: 20, max: 120, warn: 70, crit: 80, defaultVal: 45.0, unit: "°C" };
    }
    if (iconType === "pressure") {
      return { min: 50, max: 320, warn: 180, crit: 220, defaultVal: 120.0, unit: "PSI" };
    }
    return { min: 0, max: 400, warn: 150, crit: 100, defaultVal: 300.0, unit: "L/min" };
  }, [iconType]);

  const currentVal = sensorData?.value ?? calibration.defaultVal;
  const currentStatus = sensorData?.status ?? "nominal";
  const currentUnit = sensorData?.unit ?? calibration.unit;
  const isCritical = currentStatus === "critical";
  const isWarning = currentStatus === "warning";

  // Calculate Rate of Change (Delta) between last 2 points
  const delta = useMemo(() => {
    if (history.length < 2) return 0;
    const last = history[history.length - 1]?.value ?? currentVal;
    const prev = history[history.length - 2]?.value ?? currentVal;
    return Number((last - prev).toFixed(2));
  }, [history, currentVal]);

  // Calculate Min, Max, Average of current historical buffer
  const stats = useMemo(() => {
    if (!history.length) return { min: currentVal, max: currentVal, avg: currentVal };
    const values = history.map((h) => h.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return {
      min: min.toFixed(1),
      max: max.toFixed(1),
      avg: avg.toFixed(1),
    };
  }, [history, currentVal]);

  // Construct SVG Sparkline Waveform Path
  const sparklineSvg = useMemo(() => {
    const width = 280;
    const height = 64;
    const padding = 6;
    const dataPoints = history.length > 0 ? history : [{ value: currentVal }, { value: currentVal }];
    
    const min = Math.min(calibration.min, ...dataPoints.map((d) => d.value));
    const max = Math.max(calibration.max, ...dataPoints.map((d) => d.value));
    const range = max - min || 1;

    const points = dataPoints.map((d, index) => {
      const x = padding + (index / (Math.max(1, dataPoints.length - 1))) * (width - 2 * padding);
      const y = height - padding - ((d.value - min) / range) * (height - 2 * padding);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const linePath = `M ${points.join(" L ")}`;
    const areaPath = `${linePath} L ${width - padding},${height} L ${padding},${height} Z`;

    return { linePath, areaPath, width, height };
  }, [history, currentVal, calibration]);

  const renderIcon = () => {
    switch (iconType) {
      case "temperature": return <Thermometer className={`w-5 h-5 ${isCritical ? 'text-rose-400' : 'text-amber-400'}`} />;
      case "pressure": return <Zap className={`w-5 h-5 ${isCritical ? 'text-rose-400' : 'text-cyan-400'}`} />;
      case "flow": return <Droplets className={`w-5 h-5 ${isCritical ? 'text-rose-400' : 'text-emerald-400'}`} />;
      default: return <Activity className="w-5 h-5 text-cyan-400" />;
    }
  };

  // Advanced Framer Motion Glitch and Pulse Variants
  const widgetVariants = {
    nominal: {
      x: 0,
      y: 0,
      filter: "brightness(1)",
      transition: { duration: 0.4 },
    },
    critical: {
      x: [0, -4, 4, -6, 6, -2, 2, 0],
      y: [0, 2, -2, 4, -4, 0],
      filter: [
        "brightness(1)",
        "brightness(1.8) hue-rotate(45deg)",
        "brightness(0.6) hue-rotate(-45deg)",
        "brightness(1.5)",
        "brightness(1)",
      ],
      transition: {
        duration: 0.35,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      variants={widgetVariants}
      animate={isCritical ? "critical" : "nominal"}
      className={`reticle-box relative flex flex-col justify-between p-6 rounded-3xl border backdrop-blur-2xl transition-all duration-500 overflow-hidden ${
        isCritical 
          ? "glass-panel-critical reticle-critical" 
          : isWarning 
            ? "bg-[#101328]/80 border-amber-500/40" 
            : "glass-panel border-cyan-500/20"
      } ${isEditMode ? 'border-dashed cursor-move hover:bg-cyan-950/20' : ''}`}
    >
      {/* Top Strip: Icon, Title, Status Tag */}
      <div className="flex items-center justify-between gap-2 mb-4 z-10">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${
            isCritical 
              ? 'bg-red-500/20 border-red-500/40' 
              : 'bg-white/5 border-white/10'
          }`}>
            {renderIcon()}
          </div>
          <div>
            <span className="text-xs font-display font-bold text-white/90 tracking-wider block">
              {label}
            </span>
            <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase">
              {sensor_id}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Delta Rate of Change Badge */}
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-0.5 border ${
            delta > 0 
              ? 'bg-red-500/10 border-red-500/30 text-red-400' 
              : delta < 0 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                : 'bg-white/5 border-white/10 text-white/40'
          }`}>
            {delta > 0 ? <ArrowUpRight className="w-3 h-3" /> : delta < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
            {delta > 0 ? `+${delta}` : delta} Δ
          </span>

          {/* Status Badge */}
          <span className={`text-[10px] font-mono px-2.5 py-1 font-bold tracking-widest rounded-full border ${
            isCritical 
              ? "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(255,0,85,0.4)] animate-pulse" 
              : isWarning
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          }`}>
            {currentStatus.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Main Digital Value Readout */}
      <div className="flex items-baseline justify-between mb-4 z-10">
        <div className="flex items-baseline gap-2">
          <span className={`text-5xl font-mono font-extrabold tracking-tighter tabular-nums ${
            isCritical ? 'text-red-400 glow-crimson' : isWarning ? 'text-amber-400' : 'text-white glow-cyan'
          }`}>
            {currentVal.toFixed(1)}
          </span>
          <span className="text-sm font-mono text-white/50 tracking-wider font-semibold">
            {currentUnit}
          </span>
        </div>

        {/* Load Percentage Indicator */}
        <div className="text-right">
          <span className="text-[10px] font-mono text-white/30 block tracking-widest">LOAD</span>
          <span className="text-xs font-mono font-bold text-white/70">
            {Math.min(100, Math.max(0, Math.round(((currentVal - calibration.min) / (calibration.max - calibration.min)) * 100)))}%
          </span>
        </div>
      </div>

      {/* Real-time Rolling SVG Waveform Sparkline */}
      <div className="relative w-full h-16 mb-4 rounded-xl bg-black/40 border border-white/5 overflow-hidden p-1">
        <svg 
          viewBox={`0 0 ${sparklineSvg.width} ${sparklineSvg.height}`} 
          className="w-full h-full preserve-3d"
        >
          <defs>
            <linearGradient id={`grad-${sensor_id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isCritical ? "#FF0055" : isWarning ? "#FFB800" : "#00F0FF"} stopOpacity="0.45" />
              <stop offset="100%" stopColor={isCritical ? "#FF0055" : isWarning ? "#FFB800" : "#00F0FF"} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Critical Threshold Line */}
          <line 
            x1="0" 
            y1={sparklineSvg.height * 0.25} 
            x2={sparklineSvg.width} 
            y2={sparklineSvg.height * 0.25} 
            stroke="rgba(255, 0, 85, 0.3)" 
            strokeDasharray="4 4" 
            strokeWidth="1" 
          />

          {/* Area Fill */}
          <path d={sparklineSvg.areaPath} fill={`url(#grad-${sensor_id})`} />

          {/* Sparkline Stroke */}
          <path 
            d={sparklineSvg.linePath} 
            fill="none" 
            stroke={isCritical ? "#FF0055" : isWarning ? "#FFB800" : "#00F0FF"} 
            strokeWidth="2" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Historical Statistics Ribbon (Min / Avg / Max) */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center font-mono text-[10px] z-10">
        <div className="bg-white/[0.02] p-1.5 rounded-lg border border-white/5">
          <span className="text-white/30 block text-[9px] tracking-wider">MIN</span>
          <span className="text-white/80 font-bold">{stats.min}</span>
        </div>
        <div className="bg-white/[0.02] p-1.5 rounded-lg border border-white/5">
          <span className="text-white/30 block text-[9px] tracking-wider">AVG</span>
          <span className="text-white/80 font-bold">{stats.avg}</span>
        </div>
        <div className="bg-white/[0.02] p-1.5 rounded-lg border border-white/5">
          <span className="text-white/30 block text-[9px] tracking-wider">MAX</span>
          <span className="text-white/80 font-bold">{stats.max}</span>
        </div>
      </div>

      {/* Dynamic Ambient Background Aura */}
      <div className={`absolute -bottom-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700 ${
        isCritical ? "bg-red-600 animate-pulse scale-150" : "bg-cyan-500 scale-100"
      }`} />
    </motion.div>
  );
}

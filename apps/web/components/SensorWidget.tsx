"use client";

import { useAegisStore } from "@/store/useAegisStore";
import { motion } from "framer-motion";
import { Activity, Droplets, Thermometer, Zap } from "lucide-react";

interface Props {
  sensor_id: string;
  label: string;
  iconType: "temperature" | "pressure" | "flow";
}

export function SensorWidget({ sensor_id, label, iconType }: Props) {
  const sensorData = useAegisStore((state) => state.telemetry[sensor_id]);

  const isEditMode = useAegisStore((state) => state.isEditMode);

  if (!sensorData) {
    return (
      <div className={`flex h-40 items-center justify-center rounded-2xl bg-white/[0.01] backdrop-blur-xl border ${isEditMode ? 'border-dashed border-cyan-500/50' : 'border-white/5'}`}>
        <p className="text-white/20 text-sm animate-pulse font-mono tracking-widest">AWAITING {label.toUpperCase()}</p>
      </div>
    );
  }

  const isCritical = sensorData.status === "critical";

  const renderIcon = () => {
    switch (iconType) {
      case "temperature": return <Thermometer className="w-6 h-6 text-orange-400" />;
      case "pressure": return <Zap className="w-6 h-6 text-yellow-400" />;
      case "flow": return <Droplets className="w-6 h-6 text-cyan-400" />;
      default: return <Activity className="w-6 h-6 text-emerald-400" />;
    }
  };

  // Advanced Framer Motion Glitch and Pulse Variants
  const widgetVariants = {
    nominal: {
      x: 0,
      y: 0,
      filter: "brightness(1) hue-rotate(0deg)",
      boxShadow: "0px 0px 0px rgba(34,211,238,0)",
      borderColor: isEditMode ? "rgba(34, 211, 238, 0.5)" : "rgba(255,255,255,0.05)",
      transition: { duration: 0.5 }
    },
    critical: {
      // Violent glitch position shifts
      x: [0, -6, 6, -10, 10, -4, 4, 0],
      y: [0, 3, -3, 5, -5, 0],
      // Screen-tearing color glitching
      filter: [
        "brightness(1) hue-rotate(0deg)", 
        "brightness(2) hue-rotate(90deg) blur(1px)", 
        "brightness(0.5) hue-rotate(-90deg) blur(2px)", 
        "brightness(1.8) hue-rotate(45deg)", 
        "brightness(1) hue-rotate(0deg)"
      ],
      // Settle into pulsing deep red state
      boxShadow: [
        "0px 0px 0px rgba(239,68,68,0)", 
        "0px 0px 40px rgba(239,68,68,0.7)", 
        "0px 0px 15px rgba(239,68,68,0.3)"
      ],
      borderColor: [
        "rgba(239,68,68,0.8)", 
        "rgba(239,68,68,0.3)"
      ],
      transition: {
        // Glitch phase duration
        x: { duration: 0.4, ease: "easeInOut" },
        y: { duration: 0.4, ease: "easeInOut" },
        filter: { duration: 0.4, ease: "easeInOut" },
        // Post-glitch infinite pulse loop
        boxShadow: { delay: 0.4, duration: 1.5, repeat: Infinity, repeatType: "reverse" as const },
        borderColor: { delay: 0.4, duration: 1.5, repeat: Infinity, repeatType: "reverse" as const }
      }
    }
  };

  return (
    <motion.div
      variants={widgetVariants}
      animate={isCritical && !isEditMode ? "critical" : "nominal"}
      className={`relative flex flex-col justify-between p-8 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-2xl border overflow-hidden ${
        isCritical && !isEditMode ? "bg-red-950/20" : ""
      } ${isEditMode ? 'border-dashed cursor-move hover:bg-cyan-950/20 transition-colors' : 'border-white/5'}`}
    >
      <div className="flex items-center justify-between mb-8 z-10">
        <div className="flex items-center gap-3">
          {renderIcon()}
          <span className="text-sm font-semibold text-white/70 tracking-wide">{label}</span>
        </div>
        {isEditMode ? (
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-white/5 text-white/40 hover:text-white/80 cursor-pointer transition-colors"><Activity className="w-4 h-4" /></div>
          </div>
        ) : (
          <span className={`text-xs px-3 py-1 font-mono tracking-widest rounded-full border ${
            isCritical 
              ? "bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.4)]" 
              : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
          }`}>
            {sensorData.status.toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex items-end gap-3 z-10">
        <span className="text-6xl font-bold tracking-tighter text-white tabular-nums drop-shadow-lg">
          {sensorData.value.toFixed(1)}
        </span>
        <span className="text-sm text-white/30 font-medium tracking-widest mb-2">{sensorData.unit}</span>
      </div>
      
      {/* Dynamic Ambient Background Glow */}
      <div className={`absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 transition-all duration-700 ${
        isCritical ? "bg-red-600 animate-pulse scale-150" : "bg-cyan-600 scale-100"
      }`} />
    </motion.div>
  );
}

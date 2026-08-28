"use client";

import { useAegisStore, AIIncidentReport } from "@/store/useAegisStore";
import { 
  CheckCircle2, 
  Clock, 
  Download, 
  FileText, 
  History, 
  ShieldAlert, 
  Sparkles, 
  X 
} from "lucide-react";
import { useState } from "react";

export function IncidentHistoryDrawer() {
  const incidentHistory = useAegisStore((state) => state.incidentHistory);
  const [isOpen, setIsOpen] = useState(false);

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(incidentHistory, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `aegis-incident-audit-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-mono text-xs font-bold tracking-wider flex items-center gap-2 transition-all"
        title="View incident audit timeline and blackbox recorder"
      >
        <History className="w-4 h-4 text-cyan-400" />
        <span>AUDIT LOG ({incidentHistory.length})</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="reticle-box rounded-3xl bg-[#050816] border border-cyan-500/30 p-8 w-full max-w-2xl max-h-[85vh] flex flex-col justify-between shadow-[0_0_60px_rgba(0,0,0,0.9)]">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-display font-bold tracking-widest text-white">
                      BLACKBOX INCIDENT AUDIT TRAIL
                    </h3>
                    <p className="text-[11px] font-mono text-white/40 tracking-wider">
                      CHRONOLOGICAL EVENT RECORDER & MITIGATION LOGS
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportJSON}
                    disabled={incidentHistory.length === 0}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all disabled:opacity-30"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>EXPORT AUDIT</span>
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Event Timeline List */}
              <div className="overflow-y-auto max-h-[50vh] space-y-3 pr-2">
                {incidentHistory.length === 0 ? (
                  <div className="py-14 text-center border border-dashed border-white/10 rounded-2xl">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400/50 mx-auto mb-2" />
                    <p className="text-white/40 font-mono text-xs tracking-widest">
                      NO CRITICAL INCIDENTS RECORDED IN CURRENT RUNTIME
                    </p>
                  </div>
                ) : (
                  incidentHistory.map((inc, idx) => (
                    <div 
                      key={inc.incident_id || idx}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all font-mono"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-red-400 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4" />
                          {inc.title}
                        </span>
                        <span className="text-[10px] text-white/40">
                          {inc.timestamp?.substring(11, 19) || "RECENT"}
                        </span>
                      </div>

                      <p className="text-xs text-white/70 font-sans mb-3 leading-relaxed">
                        {inc.summary}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-white/40 pt-2 border-t border-white/5">
                        <span>CORRELATED: {inc.correlated_sensors?.join(', ') || 'N/A'}</span>
                        <span className="text-cyan-400">CONFIDENCE: {Math.round(inc.confidence_score * 100)}%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-white/40">
              <span>STANDARDS COMPLIANT: ISO-11064 / OSHA-1910</span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

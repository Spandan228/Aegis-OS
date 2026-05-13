import { create } from 'zustand';

export interface SensorTelemetry {
  sensor_id: string;
  timestamp: string;
  sensor_type: string;
  value: number;
  unit: string;
  status: 'nominal' | 'warning' | 'critical';
  metadata: any;
}

export interface AIIncidentReport {
  incident_id: string;
  severity: string;
  title: string;
  summary: string;
  root_cause_analysis: string;
  correlated_sensors: string[];
  recommended_actions: string[];
  confidence_score: number;
}

interface AegisState {
  telemetry: Record<string, SensorTelemetry>;
  globalStatus: 'NOMINAL' | 'CRITICAL';
  activeIncident: AIIncidentReport | null;
  connectionStatus: 'CONNECTED' | 'DISCONNECTED';
  updateTelemetry: (data: SensorTelemetry) => void;
  setActiveIncident: (incident: AIIncidentReport | null) => void;
  setConnectionStatus: (status: 'CONNECTED' | 'DISCONNECTED') => void;
}

export const useAegisStore = create<AegisState>((set) => ({
  telemetry: {},
  globalStatus: 'NOMINAL',
  activeIncident: null,
  connectionStatus: 'DISCONNECTED', // Initialize as disconnected until WS opens
  updateTelemetry: (data) => set((state) => {
    const updatedTelemetry = { ...state.telemetry, [data.sensor_id]: data };
    const isCritical = Object.values(updatedTelemetry).some(
      (sensor) => sensor.status === 'critical'
    );
    return {
      telemetry: updatedTelemetry,
      globalStatus: isCritical ? 'CRITICAL' : 'NOMINAL',
    };
  }),
  setActiveIncident: (incident) => set({ activeIncident: incident }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
}));

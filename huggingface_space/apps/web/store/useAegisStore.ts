import { create } from 'zustand';
import { audioEngine } from '@/lib/audioEngine';

export interface SensorTelemetry {
  sensor_id: string;
  timestamp: string;
  sensor_type: string;
  value: number;
  unit: string;
  status: 'nominal' | 'warning' | 'critical';
  metadata?: Record<string, any>;
}

export interface TelemetryPoint {
  timestamp: number;
  value: number;
  status: 'nominal' | 'warning' | 'critical';
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
  timestamp?: string;
  resolvedAt?: string;
}

export interface AegisState {
  telemetry: Record<string, SensorTelemetry>;
  telemetryHistory: Record<string, TelemetryPoint[]>;
  globalStatus: 'NOMINAL' | 'CRITICAL';
  activeIncident: AIIncidentReport | null;
  connectionStatus: 'CONNECTED' | 'DISCONNECTED';
  userRole: 'OPERATOR' | 'MANAGER';
  isEditMode: boolean;
  activeStation: string;
  isMuted: boolean;
  soundVolume: number;
  crtEffectEnabled: boolean;
  incidentHistory: AIIncidentReport[];
  valves: {
    intakeValve: boolean;
    bypassValve: boolean;
    reliefValve: boolean;
    auxCooler: boolean;
  };
  manualEStop: boolean;
  
  // Actions
  updateTelemetry: (data: SensorTelemetry) => void;
  setActiveIncident: (incident: AIIncidentReport | null) => void;
  setConnectionStatus: (status: 'CONNECTED' | 'DISCONNECTED') => void;
  setUserRole: (role: 'OPERATOR' | 'MANAGER') => void;
  setIsEditMode: (isEdit: boolean) => void;
  setActiveStation: (station: string) => void;
  setMuted: (muted: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setCrtEffectEnabled: (enabled: boolean) => void;
  toggleValve: (valveKey: keyof AegisState['valves']) => void;
  triggerEStop: () => void;
  resolveActiveIncident: () => void;
  injectLocalFault: (faultType: 'CAVITATION' | 'OVERHEAT' | 'SURGE' | 'NORMAL') => void;
}

export const useAegisStore = create<AegisState>((set, get) => ({
  telemetry: {},
  telemetryHistory: {},
  globalStatus: 'NOMINAL',
  activeIncident: null,
  connectionStatus: 'DISCONNECTED',
  userRole: 'OPERATOR',
  isEditMode: false,
  activeStation: 'PUMP-ALPHA',
  isMuted: false,
  soundVolume: 0.6,
  crtEffectEnabled: true,
  incidentHistory: [],
  manualEStop: false,
  valves: {
    intakeValve: true,
    bypassValve: false,
    reliefValve: false,
    auxCooler: true,
  },

  updateTelemetry: (data) => set((state) => {
    const prevHistory = state.telemetryHistory[data.sensor_id] || [];
    const newPoint: TelemetryPoint = {
      timestamp: Date.now(),
      value: data.value,
      status: data.status,
    };
    
    // Keep sliding window of last 40 telemetry data points
    const updatedHistory = [...prevHistory.slice(-39), newPoint];

    const updatedTelemetry = {
      ...state.telemetry,
      [data.sensor_id]: data,
    };

    const isCritical = Object.values(updatedTelemetry).some(
      (s) => s.status === 'critical'
    );

    const prevStatus = state.globalStatus;
    const newStatus = isCritical ? 'CRITICAL' : 'NOMINAL';

    if (newStatus === 'CRITICAL' && prevStatus === 'NOMINAL') {
      audioEngine.startAlarm();
    } else if (newStatus === 'NOMINAL' && prevStatus === 'CRITICAL') {
      audioEngine.stopAlarm();
    }

    return {
      telemetry: updatedTelemetry,
      telemetryHistory: {
        ...state.telemetryHistory,
        [data.sensor_id]: updatedHistory,
      },
      globalStatus: newStatus,
    };
  }),

  setActiveIncident: (incident) => set((state) => {
    if (incident) {
      audioEngine.playAIChime();
      audioEngine.startAlarm();
      const existing = state.incidentHistory.find((i) => i.incident_id === incident.incident_id);
      const updatedHistory = existing 
        ? state.incidentHistory 
        : [incident, ...state.incidentHistory].slice(0, 20);
      return { activeIncident: incident, incidentHistory: updatedHistory, globalStatus: 'CRITICAL' };
    } else {
      audioEngine.stopAlarm();
      return { activeIncident: null };
    }
  }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setUserRole: (role) => {
    audioEngine.playSwitch();
    set({ userRole: role });
  },
  setIsEditMode: (isEdit) => {
    audioEngine.playClick();
    set({ isEditMode: isEdit });
  },
  setActiveStation: (station) => {
    audioEngine.playSwitch();
    set({ activeStation: station });
  },
  setMuted: (muted) => {
    audioEngine.setMuted(muted);
    set({ isMuted: muted });
  },
  setSoundVolume: (volume) => {
    audioEngine.setVolume(volume);
    set({ soundVolume: volume });
  },
  setCrtEffectEnabled: (enabled) => {
    audioEngine.playClick();
    set({ crtEffectEnabled: enabled });
  },

  toggleValve: (valveKey) => {
    audioEngine.playSwitch();
    set((state) => ({
      valves: {
        ...state.valves,
        [valveKey]: !state.valves[valveKey],
      },
    }));
  },

  triggerEStop: () => {
    audioEngine.startAlarm();
    set((state) => ({
      manualEStop: true,
      valves: {
        intakeValve: false,
        bypassValve: true,
        reliefValve: true,
        auxCooler: true,
      },
    }));
  },

  resolveActiveIncident: () => {
    audioEngine.stopAlarm();
    audioEngine.playSuccess();
    set((state) => {
      const now = new Date().toISOString();
      const updatedHistory = state.incidentHistory.map((inc) => 
        inc.incident_id === state.activeIncident?.incident_id 
          ? { ...inc, resolvedAt: now }
          : inc
      );
      return {
        activeIncident: null,
        incidentHistory: updatedHistory,
        manualEStop: false,
        globalStatus: 'NOMINAL',
      };
    });
  },

  injectLocalFault: (faultType) => {
    audioEngine.playClick();
    const station = get().activeStation;
    const now = new Date().toISOString();
    
    if (faultType === 'NORMAL') {
      get().updateTelemetry({ sensor_id: `${station}-TEMP`, timestamp: now, sensor_type: 'temperature', value: 46.2, unit: 'Celsius', status: 'nominal' });
      get().updateTelemetry({ sensor_id: `${station}-PRES`, timestamp: now, sensor_type: 'pressure', value: 122.4, unit: 'PSI', status: 'nominal' });
      get().updateTelemetry({ sensor_id: `${station}-FLOW`, timestamp: now, sensor_type: 'flow_rate', value: 298.5, unit: 'L/min', status: 'nominal' });
      get().resolveActiveIncident();
    } else if (faultType === 'CAVITATION') {
      get().updateTelemetry({ sensor_id: `${station}-TEMP`, timestamp: now, sensor_type: 'temperature', value: 89.4, unit: 'Celsius', status: 'critical' });
      get().updateTelemetry({ sensor_id: `${station}-PRES`, timestamp: now, sensor_type: 'pressure', value: 264.1, unit: 'PSI', status: 'critical' });
      get().updateTelemetry({ sensor_id: `${station}-FLOW`, timestamp: now, sensor_type: 'flow_rate', value: 42.0, unit: 'L/min', status: 'critical' });
      get().setActiveIncident({
        incident_id: `INC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        severity: 'critical',
        title: 'THERMAL RUNAWAY: SEVERE CAVITATION & FLOW COLLAPSE',
        summary: 'CONFIDENCE: 98.4% | TTF: 35 SECONDS. Upstream impeller vacuum collapsing with violent vapor bubble implosions.',
        root_cause_analysis: 'High localized frictional heating (>89°C) combined with a 264 PSI backpressure surge and severe intake fluid starvation (42 L/min) has induced supercritical cavitation. Mechanical seal integrity failing.',
        correlated_sensors: [`${station}-TEMP`, `${station}-PRES`, `${station}-FLOW`],
        recommended_actions: [
          'ENGAGE AUXILIARY BYPASS VALVE IMMEDIATELY.',
          'Isolate primary intake line to prevent pump dry-run.',
          'Increase auxiliary coolant loop flow rate to 100%.',
          'Execute manual system reset once pressure normalizes below 140 PSI.',
        ],
        confidence_score: 0.984,
        timestamp: now,
      });
    } else if (faultType === 'OVERHEAT') {
      get().updateTelemetry({ sensor_id: `${station}-TEMP`, timestamp: now, sensor_type: 'temperature', value: 96.8, unit: 'Celsius', status: 'critical' });
      get().updateTelemetry({ sensor_id: `${station}-PRES`, timestamp: now, sensor_type: 'pressure', value: 145.0, unit: 'PSI', status: 'warning' });
      get().updateTelemetry({ sensor_id: `${station}-FLOW`, timestamp: now, sensor_type: 'flow_rate', value: 180.0, unit: 'L/min', status: 'nominal' });
      get().setActiveIncident({
        incident_id: `INC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        severity: 'critical',
        title: 'STATOR THERMAL OVERLOAD DETECTED',
        summary: 'CONFIDENCE: 94.2% | TTF: 80 SECONDS. Bearing frictional thermal rise exceeding safe threshold (96.8°C).',
        root_cause_analysis: 'Bearing lubrication failure detected on primary drive shaft. Heat generation is outpacing passive dissipation by 340%.',
        correlated_sensors: [`${station}-TEMP`],
        recommended_actions: [
          'Enable Auxiliary Cooling Loop.',
          'Throttle pump motor load to 40%.',
          'Dispatch lubrication maintenance crew to Zone 2.',
        ],
        confidence_score: 0.942,
        timestamp: now,
      });
    } else if (faultType === 'SURGE') {
      get().updateTelemetry({ sensor_id: `${station}-TEMP`, timestamp: now, sensor_type: 'temperature', value: 52.0, unit: 'Celsius', status: 'nominal' });
      get().updateTelemetry({ sensor_id: `${station}-PRES`, timestamp: now, sensor_type: 'pressure', value: 295.6, unit: 'PSI', status: 'critical' });
      get().updateTelemetry({ sensor_id: `${station}-FLOW`, timestamp: now, sensor_type: 'flow_rate', value: 85.0, unit: 'L/min', status: 'warning' });
      get().setActiveIncident({
        incident_id: `INC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        severity: 'critical',
        title: 'HYDRAULIC WATER HAMMER / PRESSURE SURGE',
        summary: 'CONFIDENCE: 96.7% | TTF: 20 SECONDS. Downstream manifold valve blockage causing extreme transient shockwave.',
        root_cause_analysis: 'Sudden closure or obstruction downstream has generated a 295.6 PSI hydraulic shockwave. Flange seal rupture imminent without relief.',
        correlated_sensors: [`${station}-PRES`, `${station}-FLOW`],
        recommended_actions: [
          'TRIGGER EMERGENCY PRESSURE RELIEF VALVE IMMEDIATELY.',
          'Open bypass manifold to dissipate kinetic shockwave.',
          'Inspect downstream gate valve V-104.',
        ],
        confidence_score: 0.967,
        timestamp: now,
      });
    }
  },
}));

"use client";

import { useEffect, useRef } from "react";
import { useAegisStore } from "@/store/useAegisStore";

export function WebSocketBridge() {
  const updateTelemetry = useAegisStore((state) => state.updateTelemetry);
  const setActiveIncident = useAegisStore((state) => state.setActiveIncident);
  const setConnectionStatus = useAegisStore((state) => state.setConnectionStatus);
  const activeStation = useAegisStore((state) => state.activeStation);
  const globalStatus = useAegisStore((state) => state.globalStatus);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const fallbackInterval = useRef<NodeJS.Timeout | null>(null);
  const timeStep = useRef(0);
  const receivedWsPackets = useRef(false);

  useEffect(() => {
    let wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (typeof window !== "undefined") {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      if (window.location.hostname !== "localhost" && !process.env.NEXT_PUBLIC_WS_URL) {
        wsUrl = `${protocol}//${window.location.host}/ws`;
      } else if (!wsUrl) {
        wsUrl = "ws://localhost:8080/ws";
      }
    } else {
      wsUrl = wsUrl || "ws://localhost:8080/ws";
    }
    
    const connect = () => {
      try {
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
          console.log("[*] Connected to Aegis Telemetry Hub via WebSocket");
          setConnectionStatus("CONNECTED");
        };

        ws.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            receivedWsPackets.current = true;
            
            if (data.incident_id) {
              console.log("[!] AI Incident Report Received:", data.title);
              setActiveIncident(data);
            } else if (data.sensor_id) {
              updateTelemetry(data);
            }
          } catch (err) {
            console.error("[!] Failed to parse incoming telemetry:", err);
          }
        };

        ws.current.onclose = () => {
          console.log("[!] Disconnected from Hub. Attempting reconnection in 2s...");
          setConnectionStatus("DISCONNECTED");
          reconnectTimeout.current = setTimeout(connect, 2000);
        };

        ws.current.onerror = () => {
          // Handled by onclose
        };
      } catch {
        setConnectionStatus("DISCONNECTED");
        reconnectTimeout.current = setTimeout(connect, 2000);
      }
    };

    connect();

    // Fallback Client Simulation Tick: Generates realistic continuous telemetry
    // if WebSocket has not yet received remote backend packets
    fallbackInterval.current = setInterval(() => {
      if (!receivedWsPackets.current && globalStatus === "NOMINAL") {
        timeStep.current += 0.1;
        const now = new Date().toISOString();
        const t = timeStep.current;

        const temp = 45.0 + 3 * Math.sin(t) + (Math.random() - 0.5);
        const pres = 120.0 + 8 * Math.cos(t) + (Math.random() - 0.5) * 2;
        const flow = 295.0 + 15 * Math.sin(t * 0.5) + (Math.random() - 0.5) * 4;

        updateTelemetry({
          sensor_id: `${activeStation}-TEMP`,
          timestamp: now,
          sensor_type: "temperature",
          value: parseFloat(temp.toFixed(1)),
          unit: "°C",
          status: "nominal",
        });

        updateTelemetry({
          sensor_id: `${activeStation}-PRES`,
          timestamp: now,
          sensor_type: "pressure",
          value: parseFloat(pres.toFixed(1)),
          unit: "PSI",
          status: "nominal",
        });

        updateTelemetry({
          sensor_id: `${activeStation}-FLOW`,
          timestamp: now,
          sensor_type: "flow_rate",
          value: parseFloat(flow.toFixed(1)),
          unit: "L/min",
          status: "nominal",
        });
      }
    }, 500);

    return () => {
      if (ws.current) {
        ws.current.onclose = null; 
        ws.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (fallbackInterval.current) {
        clearInterval(fallbackInterval.current);
      }
    };
  }, [updateTelemetry, setActiveIncident, setConnectionStatus, activeStation, globalStatus]);

  return null;
}

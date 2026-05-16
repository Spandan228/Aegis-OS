"use client";

import { useEffect, useRef } from "react";
import { useAegisStore } from "@/store/useAegisStore";

export function WebSocketBridge() {
  const updateTelemetry = useAegisStore((state) => state.updateTelemetry);
  const setActiveIncident = useAegisStore((state) => state.setActiveIncident);
  const setConnectionStatus = useAegisStore((state) => state.setConnectionStatus);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

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
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("[*] Connected to Aegis Telemetry Hub via WebSocket");
        setConnectionStatus("CONNECTED");
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
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
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.onclose = null; 
        ws.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [updateTelemetry, setActiveIncident, setConnectionStatus]);

  return null;
}

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../services/firebase';

export interface LiveNode {
  id: string;
  region: string;
  lat: number;
  lng: number;
  battery: number;
  connectivity: 'Strong' | 'Weak' | 'Offline';
  status: 'Healthy' | 'Warning' | 'Critical' | 'Offline';
  lastUpdate: string;
  isLive: boolean;
  type: 'earthquake' | 'flood' | 'landslide';
  timestamp: number;
  sensors: {
    accel: number;
    waterLevel: number;
    rainfall: number;
    soilMoisture: number;
    temp: number;
    vibration?: number;
    humidity?: number;
    temperature?: number;
    tiltDeg?: number;
  };
  risks: {
    earthquake: number;
    tsunami: number;
    landslide: number;
    flood: number;
  };
  meshLinks: string[];
  svgX: number;
  svgY: number;
}

interface LiveNodesContextType {
  liveNodes: LiveNode[];
}

const LiveNodesContext = createContext<LiveNodesContextType | undefined>(undefined);

export const useLiveNodes = () => {
  const context = useContext(LiveNodesContext);
  if (!context) {
    throw new Error('useLiveNodes must be used within a LiveNodesProvider');
  }
  return context;
};

// Fixed Geolocations (separated, near mock cluster)
const FIXED_LOCATIONS = {
  node1: { lat: 13.1500, lng: 80.2000, svgX: 180, svgY: 340, region: 'Coastal Sector 1 (Live)' },
  node2: { lat: 13.1500, lng: 80.2500, svgX: 380, svgY: 340, region: 'Metropolitan East (Live)' },
  node3: { lat: 13.1500, lng: 80.3000, svgX: 580, svgY: 340, region: 'Northern Hills (Live)' },
};

export const LiveNodesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rawDbData, setRawDbData] = useState<Record<string, any>>({});
  const [liveNodes, setLiveNodes] = useState<LiveNode[]>([]);
  const lastTimestampsRef = useRef<Record<string, number>>({});
  const lastUpdateLocalTimesRef = useRef<Record<string, number>>({});

  // 1. Database Listener pointing to /liveNodes
  useEffect(() => {
    if (!db) {
      console.warn('LiveNodesContext: Firebase db not initialized, skipping listener.');
      return;
    }
    const liveNodesRef = ref(db, 'liveNodes');
    const unsubscribe = onValue(liveNodesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRawDbData(data);
      }
    }, (error) => {
      console.error("Firebase RTDB listener subscription error:", error);
    });

    return () => unsubscribe();
  }, []);

  // 2. Map and stale checks (Interval to trigger status switch on stale > 15s)
  useEffect(() => {
    const updateNodes = () => {
      const now = Date.now();
      const mapped: LiveNode[] = [];

      ['node1', 'node2', 'node3'].forEach((nodeId) => {
        const dbNode = rawDbData[nodeId];
        const dbTimestamp = dbNode?.timestamp ?? 0;
        const type = nodeId === 'node1' ? 'earthquake' : nodeId === 'node2' ? 'flood' : 'landslide';
        
        // Initialize or update tracking
        if (lastTimestampsRef.current[nodeId] === undefined) {
          lastTimestampsRef.current[nodeId] = dbTimestamp;
          lastUpdateLocalTimesRef.current[nodeId] = now;
        } else if (dbTimestamp !== lastTimestampsRef.current[nodeId]) {
          lastTimestampsRef.current[nodeId] = dbTimestamp;
          lastUpdateLocalTimesRef.current[nodeId] = now;
        }

        const elapsed = now - (lastUpdateLocalTimesRef.current[nodeId] ?? now);
        
        // 15 seconds stale check
        const isStale = !dbNode || elapsed > 15000;
        
        const status = isStale 
          ? 'Offline' 
          : (dbNode?.status === 'red' ? 'Critical' : 'Healthy');
        const connectivity = isStale ? 'Offline' : 'Strong';
        
        // Sensor values
        const vibration = dbNode?.vibration ?? 0.0;
        const humidity = dbNode?.humidity ?? 0.0;
        const temperature = dbNode?.temperature ?? 0.0;
        const tiltDeg = dbNode?.tiltDeg ?? 0.0;

        const sensors = {
          accel: type === 'earthquake' ? vibration : (type === 'landslide' ? tiltDeg : 0),
          waterLevel: type === 'flood' ? (dbNode?.status === 'red' ? 120.0 : 15.0) : 0,
          rainfall: type === 'flood' ? (dbNode?.status === 'red' ? 45.0 : 2.0) : 0,
          soilMoisture: type === 'flood' ? humidity : 0,
          temp: type === 'flood' ? temperature : 27.5,
          vibration,
          humidity,
          temperature,
          tiltDeg,
        };

        const risks = {
          earthquake: (type === 'earthquake' && status === 'Critical') ? 95 : 5,
          tsunami: (type === 'flood' && status === 'Critical') ? 85 : 5,
          landslide: (type === 'landslide' && status === 'Critical') ? 90 : 5,
          flood: (type === 'flood' && status === 'Critical') ? 92 : 5,
        };

        const loc = FIXED_LOCATIONS[nodeId as keyof typeof FIXED_LOCATIONS];

        mapped.push({
          id: nodeId === 'node1' ? 'SN-L01' : nodeId === 'node2' ? 'SN-L02' : 'SN-L03',
          region: loc.region,
          lat: loc.lat,
          lng: loc.lng,
          battery: isStale ? 0 : 92, // Mock high battery for active live nodes
          connectivity,
          status,
          lastUpdate: isStale ? 'Stale (>15s ago)' : 'Just now',
          isLive: true,
          type,
          timestamp: lastUpdateLocalTimesRef.current[nodeId] ?? now,
          sensors,
          risks,
          meshLinks: [], // Independent live nodes
          svgX: loc.svgX,
          svgY: loc.svgY,
        });
      });

      setLiveNodes(mapped);
    };

    updateNodes();
    const interval = setInterval(updateNodes, 1000);
    return () => clearInterval(interval);
  }, [rawDbData]);

  return (
    <LiveNodesContext.Provider value={{ liveNodes }}>
      {children}
    </LiveNodesContext.Provider>
  );
};

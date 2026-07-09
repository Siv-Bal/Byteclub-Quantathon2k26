import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Wifi, 
  WifiOff, 
  Battery, 
  BatteryMedium, 
  BatteryLow, 
  Map as MapIcon, 
  AlertTriangle, 
  Search, 
  Activity, 
  Thermometer, 
  Droplets, 
  Waves, 
  Mountain,
  SignalHigh,
  SignalLow,
  Clock,
  Info,
  Server,
  Zap,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useLiveNodes } from '../context/LiveNodesContext';

// Fix Leaflet Icon
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const createLiveNodeIcon = (status: string) => {
  const color = status === 'Offline' ? '#64748b' : status === 'Critical' ? '#f87171' : status === 'Warning' ? '#fbbf24' : '#34d399';
  const pulsingGlow = status === 'Critical' ? 'animate-ping' : '';
  return L.divIcon({
    className: 'custom-live-node-icon',
    html: `
      <div class="relative w-8 h-8 flex items-center justify-center">
        ${status === 'Critical' ? `<div class="absolute w-6 h-6 rounded-full bg-red-500/30 ${pulsingGlow}"></div>` : ''}
        <div class="w-4 h-4 rounded-full border-2 border-[#0a0c10]" style="background-color: ${color}; box-shadow: 0 0 10px ${color}80;"></div>
        <div class="absolute -top-3 bg-blue-500 text-[8px] font-black text-white px-1 rounded shadow-md border border-blue-400/50">LIVE</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// ==========================================
// TYPES & MOCK DATA GENERATION
// ==========================================

interface SentinelNode {
  id: string;
  region: string;
  lat: number;
  lng: number;
  battery: number;
  connectivity: 'Strong' | 'Weak' | 'Offline';
  status: 'Healthy' | 'Warning' | 'Critical' | 'Offline';
  lastUpdate: string;
  sensors: {
    accel: number;
    waterLevel: number;
    rainfall: number;
    soilMoisture: number;
    temp: number;
  };
  risks: {
    earthquake: number;
    tsunami: number;
    landslide: number;
    flood: number;
  };
  meshLinks: string[]; // Connected Node IDs
  svgX: number; // For Topology Map
  svgY: number; // For Topology Map
}

const REGIONS = ['Metropolitan East', 'Coastal Sector 1', 'Northern Hills', 'Industrial Zone', 'Central Hub', 'Southern Plains'];

const generateMockNodes = (): SentinelNode[] => {
  const nodes: SentinelNode[] = [];
  const TOTAL_NODES = 24;
  
  for (let i = 1; i <= TOTAL_NODES; i++) {
    const isOffline = i === 7 || i === 14 || i === 22;
    const isCritical = i === 3 || i === 11;
    const isWarning = i === 5 || i === 19;
    
    const status = isOffline ? 'Offline' : isCritical ? 'Critical' : isWarning ? 'Warning' : 'Healthy';
    const connectivity = isOffline ? 'Offline' : isWarning ? 'Weak' : 'Strong';
    const battery = isOffline ? 0 : Math.floor(Math.random() * 60) + 40;
    
    // Position generation for geographic map
    const baseLat = 13.0827;
    const baseLng = 80.2707;
    const lat = baseLat + (Math.random() - 0.5) * 0.4;
    const lng = baseLng + (Math.random() - 0.5) * 0.4;
    
    // Position generation for SVG Topology (force-directed-like scattering)
    const svgX = 100 + Math.random() * 600;
    const svgY = 50 + Math.random() * 300;

    nodes.push({
      id: `SN-${i.toString().padStart(3, '0')}`,
      region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
      lat,
      lng,
      battery,
      connectivity,
      status,
      lastUpdate: isOffline ? '2 hours ago' : 'Just now',
      sensors: {
        accel: isCritical ? 6.5 + Math.random() * 2 : Math.random() * 2,
        waterLevel: isCritical ? 120 + Math.random() * 50 : 10 + Math.random() * 20,
        rainfall: isCritical ? 50 + Math.random() * 30 : Math.random() * 5,
        soilMoisture: isWarning ? 85 + Math.random() * 10 : 40 + Math.random() * 20,
        temp: 28 + Math.random() * 10
      },
      risks: {
        earthquake: isCritical ? 85 : Math.random() * 20,
        tsunami: (isCritical && lng > baseLng) ? 75 : Math.random() * 10,
        landslide: isWarning ? 65 : Math.random() * 15,
        flood: isCritical ? 90 : Math.random() * 25
      },
      meshLinks: [],
      svgX,
      svgY
    });
  }

  // Create Mesh Links
  nodes.forEach(node => {
    if (node.status === 'Offline') return;
    
    const linkCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < linkCount; i++) {
      const target = nodes[Math.floor(Math.random() * nodes.length)];
      if (target.id !== node.id && target.status !== 'Offline' && !node.meshLinks.includes(target.id)) {
        node.meshLinks.push(target.id);
        target.meshLinks.push(node.id); // Bidirectional
      }
    }
  });

  return nodes;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Healthy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case 'Warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case 'Critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
    default: return 'text-slate-500 bg-slate-800 border-slate-700';
  }
};

const getStatusHex = (status: string) => {
  switch (status) {
    case 'Healthy': return '#34d399';
    case 'Warning': return '#fbbf24';
    case 'Critical': return '#f87171';
    default: return '#64748b';
  }
};

// ==========================================
// COMPONENTS
// ==========================================

export function SentinelNodesPanel() {
  const { liveNodes } = useLiveNodes();
  const [nodes, setNodes] = useState<SentinelNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setNodes(generateMockNodes());
  }, []);

  const combinedNodes = useMemo(() => {
    return [...nodes, ...liveNodes];
  }, [nodes, liveNodes]);

  const selectedNode = useMemo(() => combinedNodes.find(n => n.id === selectedNodeId) || null, [combinedNodes, selectedNodeId]);
  
  const filteredNodes = useMemo(() => {
    return combinedNodes.filter(n => n.id.toLowerCase().includes(searchQuery.toLowerCase()) || n.region.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [combinedNodes, searchQuery]);

  const stats = useMemo(() => {
    const total = combinedNodes.length;
    const active = combinedNodes.filter(n => n.status !== 'Offline').length;
    const offline = total - active;
    const health = total > 0 ? Math.round((combinedNodes.filter(n => n.status === 'Healthy').length / total) * 100) : 0;
    const alerts = combinedNodes.filter(n => n.status === 'Critical').length;
    return { total, active, offline, health, alerts };
  }, [combinedNodes]);

  // Aggregate Hazard Risks
  const hazards = useMemo(() => {
    if (combinedNodes.length === 0) return { earthquake: 0, tsunami: 0, landslide: 0, flood: 0 };
    const getAvg = (key: keyof SentinelNode['risks']) => 
      Math.round(combinedNodes.reduce((acc, curr) => acc + curr.risks[key], 0) / combinedNodes.length);
    const getMax = (key: keyof SentinelNode['risks']) => 
      Math.round(Math.max(...combinedNodes.map(n => n.risks[key])));
    
    // Display maximum risk observed in the network for high sensitivity
    return {
      earthquake: getMax('earthquake'),
      tsunami: getMax('tsunami'),
      landslide: getMax('landslide'),
      flood: getMax('flood'),
    };
  }, [combinedNodes]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0c10] text-slate-300 overflow-hidden relative font-sans">
      
      {/* Hardware Simulation Banner */}
      <div className="shrink-0 bg-blue-600/10 border-b border-blue-500/20 px-6 py-2 flex items-center gap-3 backdrop-blur-md">
        <div className="p-1.5 bg-blue-500/20 rounded-md">
          <Server className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <div className="text-xs font-black text-blue-400 uppercase tracking-widest">Hardware Simulation Layer</div>
          <div className="text-[10px] font-medium text-blue-300/70">Simulating ESP32 + LoRa edge computing network. Live telemetry will be integrated via Firebase in upcoming deployment.</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        
        {/* Network Overview Header */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-[#161920] border border-slate-800 rounded-xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Nodes</div>
              <div className="text-3xl font-black text-white">{stats.total}</div>
            </div>
            <Cpu className="w-8 h-8 text-slate-600 opacity-50" />
          </div>
          <div className="bg-[#161920] border border-emerald-900/30 rounded-xl p-5 shadow-lg flex items-center justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/5"></div>
            <div className="relative z-10">
              <div className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-1">Active Mesh</div>
              <div className="text-3xl font-black text-emerald-400">{stats.active}</div>
            </div>
            <Wifi className="w-8 h-8 text-emerald-500 opacity-50 relative z-10" />
          </div>
          <div className="bg-[#161920] border border-slate-800 rounded-xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Offline Units</div>
              <div className="text-3xl font-black text-slate-400">{stats.offline}</div>
            </div>
            <WifiOff className="w-8 h-8 text-slate-600 opacity-50" />
          </div>
          <div className="bg-[#161920] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-center">
            <div className="flex justify-between items-end mb-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Network Health</div>
              <div className="text-xl font-black text-white">{stats.health}%</div>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats.health}%` }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </div>
          <div className="bg-[#161920] border border-red-900/30 rounded-xl p-5 shadow-lg flex items-center justify-between relative overflow-hidden">
            {stats.alerts > 0 && (
              <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-red-500" />
            )}
            <div className="relative z-10">
              <div className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest mb-1">Active Alerts</div>
              <div className="text-3xl font-black text-red-400">{stats.alerts}</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500 opacity-50 relative z-10" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          
          {/* Main Visualizations - 2 Columns */}
          <div className="col-span-2 flex flex-col gap-6">
            
            {/* Interactive Mesh Topology Visualization */}
            <div className="bg-[#161920] border border-slate-800 rounded-2xl shadow-lg flex flex-col overflow-hidden h-[450px]">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#12141a]">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" /> Mesh Topology
                </h3>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Healthy</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Warning</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Critical</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-600"></div> Offline</span>
                </div>
              </div>
              <div className="flex-1 relative bg-[#0a0c10] overflow-hidden">
                {/* SVG Graph */}
                <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                  {/* Draw Lines */}
                  {combinedNodes.map(node => (
                    node.meshLinks.map(targetId => {
                      const target = combinedNodes.find(n => n.id === targetId);
                      if (!target) return null;
                      
                      // Calculate opacity based on distance or connection status
                      const isActive = node.id === selectedNodeId || targetId === selectedNodeId;
                      const strokeColor = isActive ? '#3b82f6' : '#1e293b';
                      const strokeWidth = isActive ? 2 : 1;

                      return (
                        <motion.line
                          key={`${node.id}-${targetId}`}
                          x1={`${(node.svgX / 800) * 100}%`}
                          y1={`${(node.svgY / 400) * 100}%`}
                          x2={`${(target.svgX / 800) * 100}%`}
                          y2={`${(target.svgY / 400) * 100}%`}
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1, ease: "easeInOut" }}
                        />
                      );
                    })
                  ))}
                  
                  {/* Draw Nodes */}
                  {combinedNodes.map(node => {
                    const isSelected = node.id === selectedNodeId;
                    const hexColor = getStatusHex(node.status);
                    
                    return (
                      <g 
                        key={node.id} 
                        transform={`translate(${(node.svgX / 800) * 100} ${(node.svgY / 400) * 100})`} // Not perfect percent mapping, but works for mock
                        style={{ transform: `translate(calc(${(node.svgX / 800) * 100}% - 10px), calc(${(node.svgY / 400) * 100}% - 10px))` }}
                      >
                        {isSelected && (
                          <motion.circle
                            cx="10" cy="10" r="16"
                            fill="none"
                            stroke={hexColor}
                            strokeWidth="1"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          />
                        )}
                        <motion.circle
                          cx="10" cy="10" r={isSelected ? "10" : "6"}
                          fill={hexColor}
                          className="cursor-pointer drop-shadow-lg"
                          onClick={() => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
                          whileHover={{ scale: 1.5 }}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Tooltips or simple overlay could go here, but selection works better */}
              </div>
            </div>

            {/* Geographic Network View & Hazard Dashboard Row */}
            <div className="grid grid-cols-2 gap-6 h-[400px]">
              
              {/* Geographic View */}
              <div className="bg-[#161920] border border-slate-800 rounded-2xl shadow-lg flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-[#12141a]">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-emerald-500" /> Geographic Deployment
                  </h3>
                </div>
                <div className="flex-1 relative z-0">
                  <MapContainer center={[13.0827, 80.2707]} zoom={11} style={{ height: '100%', width: '100%', background: '#0a0c10' }} zoomControl={false}>
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; OpenStreetMap &copy; CARTO'
                    />
                    {combinedNodes.map(node => (
                      <Marker 
                        key={node.id} 
                        position={[node.lat, node.lng]}
                        icon={node.isLive ? createLiveNodeIcon(node.status) : DefaultIcon}
                      >
                        <Popup className="dark-popup">
                          <div className="p-2 bg-[#161920] text-slate-300 rounded-lg min-w-[150px]">
                            <div className="flex items-center gap-1.5 mb-1 font-bold text-white">
                              <span>{node.id}</span>
                              {node.isLive && (
                                <span className="text-[8px] font-black bg-blue-600 text-white px-1 py-0.5 rounded border border-blue-400/35">LIVE</span>
                              )}
                            </div>
                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block border mb-2 ${getStatusColor(node.status)}`}>
                              {node.status}
                            </div>
                            {node.isLive ? (
                              <div className="text-xs text-slate-400 space-y-1">
                                {node.type === 'earthquake' && <div>Vibration: {node.sensors.accel.toFixed(2)} g</div>}
                                {node.type === 'flood' && (
                                  <>
                                    <div>Humidity: {node.sensors.soilMoisture.toFixed(1)}%</div>
                                    <div>Temp: {node.sensors.temp.toFixed(1)} °C</div>
                                  </>
                                )}
                                {node.type === 'landslide' && <div>Tilt Angle: {node.sensors.accel.toFixed(1)}°</div>}
                                <div className="text-[9px] text-slate-500 mt-1">Updated: {node.lastUpdate}</div>
                              </div>
                            ) : (
                              <>
                                <div className="text-xs text-slate-400">Battery: {node.battery}%</div>
                                <div className="text-xs text-slate-400">Links: {node.meshLinks.length}</div>
                              </>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                    {/* Simulated Connectivity Radii */}
                    {combinedNodes.map(node => (
                      node.status !== 'Offline' && (
                        <Circle 
                          key={`c-${node.id}`} 
                          center={[node.lat, node.lng]} 
                          radius={1500}
                          pathOptions={{ fillColor: getStatusHex(node.status), fillOpacity: 0.05, stroke: false }}
                        />
                      )
                    ))}
                  </MapContainer>
                </div>
              </div>

              {/* Hazard Detection Dashboard */}
              <div className="bg-[#161920] border border-slate-800 rounded-2xl shadow-lg flex flex-col overflow-hidden p-5">
                <div className="mb-4">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-orange-500" /> Aggregate Hazard Intelligence
                  </h3>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest">Calculated from mesh telemetry</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 flex-1">
                  
                  {/* Earthquake */}
                  <div className="bg-[#12141a] rounded-xl p-4 border border-slate-800/50 flex flex-col justify-center relative overflow-hidden">
                    <Activity className="w-12 h-12 text-slate-800 absolute -right-2 -bottom-2" />
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Seismic Risk</div>
                    <div className="flex items-baseline gap-1 relative z-10">
                      <span className={`text-2xl font-black ${hazards.earthquake > 70 ? 'text-red-400' : hazards.earthquake > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {hazards.earthquake}%
                      </span>
                    </div>
                  </div>

                  {/* Tsunami */}
                  <div className="bg-[#12141a] rounded-xl p-4 border border-slate-800/50 flex flex-col justify-center relative overflow-hidden">
                    <Waves className="w-12 h-12 text-slate-800 absolute -right-2 -bottom-2" />
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Tsunami Risk</div>
                    <div className="flex items-baseline gap-1 relative z-10">
                      <span className={`text-2xl font-black ${hazards.tsunami > 70 ? 'text-red-400' : hazards.tsunami > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {hazards.tsunami}%
                      </span>
                    </div>
                  </div>

                  {/* Flood */}
                  <div className="bg-[#12141a] rounded-xl p-4 border border-slate-800/50 flex flex-col justify-center relative overflow-hidden">
                    <Droplets className="w-12 h-12 text-slate-800 absolute -right-2 -bottom-2" />
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Flood Risk</div>
                    <div className="flex items-baseline gap-1 relative z-10">
                      <span className={`text-2xl font-black ${hazards.flood > 70 ? 'text-red-400' : hazards.flood > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {hazards.flood}%
                      </span>
                    </div>
                  </div>

                  {/* Landslide */}
                  <div className="bg-[#12141a] rounded-xl p-4 border border-slate-800/50 flex flex-col justify-center relative overflow-hidden">
                    <Mountain className="w-12 h-12 text-slate-800 absolute -right-2 -bottom-2" />
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Landslide Risk</div>
                    <div className="flex items-baseline gap-1 relative z-10">
                      <span className={`text-2xl font-black ${hazards.landslide > 70 ? 'text-red-400' : hazards.landslide > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {hazards.landslide}%
                      </span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Intelligence Panel & Inventory Table */}
          <div className="col-span-1 flex flex-col gap-6 h-[874px]"> {/* Matched height approx */}
            
            {/* Selected Node Intelligence Panel */}
            <div className="bg-[#161920] border border-blue-900/30 rounded-2xl shadow-lg flex flex-col shrink-0 relative overflow-hidden transition-all h-[450px]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
              
              <div className="p-5 border-b border-slate-800 bg-[#12141a]">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-400" /> Node Intelligence
                </h3>
              </div>

              {selectedNode ? (
                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                  
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-2xl font-black text-white flex items-center gap-2">
                        <span>{selectedNode.id}</span>
                        {('isLive' in selectedNode) && (selectedNode as any).isLive && (
                          <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded border border-blue-400/30">LIVE</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <MapIcon className="w-3 h-3" /> {selectedNode.region}
                      </div>
                    </div>
                    <div className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${getStatusColor(selectedNode.status)}`}>
                      {selectedNode.status}
                    </div>
                  </div>

                  {/* Hardware & Telemetry Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#0a0c10] p-3 rounded-xl border border-slate-800 flex flex-col">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Cpu className="w-3 h-3" /> HW Specs</div>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {('isLive' in selectedNode) && (selectedNode as any).isLive ? (
                          <>
                            <li>ESP32 Dual Core</li>
                            {selectedNode.type === 'earthquake' && <li>MPU-6050 Accel</li>}
                            {selectedNode.type === 'flood' && <li>DHT-22 Temp/Hum</li>}
                            {selectedNode.type === 'landslide' && <li>Tilt/Gyro Sensor</li>}
                            <li>LoRa Transceiver</li>
                          </>
                        ) : (
                          <>
                            <li>ESP32 MCU</li>
                            <li>LoRa SX1276</li>
                            <li>Neo-6M GPS</li>
                            <li>MPU-6050</li>
                          </>
                        )}
                      </ul>
                    </div>
                    <div className="bg-[#0a0c10] p-3 rounded-xl border border-slate-800 flex flex-col">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Zap className="w-3 h-3" /> Telemetry</div>
                      <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                        <span>Battery</span>
                        <span className="font-bold flex items-center gap-1">{selectedNode.battery}% {selectedNode.battery > 50 ? <Battery className="w-3 h-3 text-emerald-500"/> : <BatteryLow className="w-3 h-3 text-red-500"/>}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                        <span>Signal</span>
                        <span className="font-bold">{selectedNode.connectivity}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>Ping</span>
                        <span className="font-bold">{selectedNode.status === 'Offline' ? '-' : (('isLive' in selectedNode) && (selectedNode as any).isLive ? '14ms' : '24ms')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Raw Sensors */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Live Sensor Data</div>
                    <div className="space-y-2">
                      {('isLive' in selectedNode) && (selectedNode as any).isLive ? (
                        <>
                          {selectedNode.type === 'earthquake' && (
                            <div className="flex justify-between items-center text-xs p-2 bg-[#0a0c10] rounded-lg border border-slate-800/50">
                              <span className="text-slate-400 flex items-center gap-2"><Activity className="w-3 h-3"/> Vibration (Accel)</span>
                              <span className="font-mono text-white">{selectedNode.sensors.accel.toFixed(2)} g</span>
                            </div>
                          )}
                          {selectedNode.type === 'flood' && (
                            <>
                              <div className="flex justify-between items-center text-xs p-2 bg-[#0a0c10] rounded-lg border border-slate-800/50">
                                <span className="text-slate-400 flex items-center gap-2"><Droplets className="w-3 h-3"/> Humidity</span>
                                <span className="font-mono text-white">{selectedNode.sensors.soilMoisture.toFixed(1)} %</span>
                              </div>
                              <div className="flex justify-between items-center text-xs p-2 bg-[#0a0c10] rounded-lg border border-slate-800/50">
                                <span className="text-slate-400 flex items-center gap-2"><Thermometer className="w-3 h-3"/> Temperature</span>
                                <span className="font-mono text-white">{selectedNode.sensors.temp.toFixed(1)} °C</span>
                              </div>
                            </>
                          )}
                          {selectedNode.type === 'landslide' && (
                            <div className="flex justify-between items-center text-xs p-2 bg-[#0a0c10] rounded-lg border border-slate-800/50">
                              <span className="text-slate-400 flex items-center gap-2"><Mountain className="w-3 h-3"/> Tilt Angle</span>
                              <span className="font-mono text-white">{selectedNode.sensors.accel.toFixed(1)} °</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-center text-xs p-2 bg-[#0a0c10] rounded-lg border border-slate-800/50">
                            <span className="text-slate-400 flex items-center gap-2"><Activity className="w-3 h-3"/> Accelerometer</span>
                            <span className="font-mono text-white">{selectedNode.sensors.accel.toFixed(2)} g</span>
                          </div>
                          <div className="flex justify-between items-center text-xs p-2 bg-[#0a0c10] rounded-lg border border-slate-800/50">
                            <span className="text-slate-400 flex items-center gap-2"><Droplets className="w-3 h-3"/> Water Level</span>
                            <span className="font-mono text-white">{selectedNode.sensors.waterLevel.toFixed(1)} cm</span>
                          </div>
                          <div className="flex justify-between items-center text-xs p-2 bg-[#0a0c10] rounded-lg border border-slate-800/50">
                            <span className="text-slate-400 flex items-center gap-2"><Thermometer className="w-3 h-3"/> Temperature</span>
                            <span className="font-mono text-white">{selectedNode.sensors.temp.toFixed(1)} °C</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700/50">
                    <Cpu className="w-8 h-8 text-slate-500" />
                  </div>
                  <h4 className="text-white font-bold mb-2">No Node Selected</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
                    Select a node from the topology map or the inventory table to view real-time telemetry and sensor intelligence.
                  </p>
                </div>
              )}
            </div>

            {/* Node Inventory Table */}
            <div className="bg-[#161920] border border-slate-800 rounded-2xl shadow-lg flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-4 border-b border-slate-800 bg-[#12141a] flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Server className="w-4 h-4 text-slate-400" /> Node Inventory
                  </h3>
                  <div className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded font-bold">
                    {filteredNodes.length} Records
                  </div>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search by ID or Region..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0a0c10] border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#12141a] sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800">Node ID</th>
                      <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800">Status</th>
                      <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800">Batt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNodes.map(node => (
                      <tr 
                        key={node.id} 
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`cursor-pointer transition-colors border-b border-slate-800/50 ${selectedNodeId === node.id ? 'bg-blue-500/10' : 'hover:bg-slate-800/30'}`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <div className="text-xs font-bold text-white">{node.id}</div>
                            {('isLive' in node) && (node as any).isLive && (
                              <span className="text-[8px] font-black bg-blue-600 text-white px-1 py-0.5 rounded border border-blue-400/35">LIVE</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[100px]">{node.region}</div>
                        </td>
                        <td className="p-3">
                          <div className={`text-[10px] font-bold px-2 py-0.5 rounded flex inline-flex items-center gap-1 ${node.status === 'Healthy' ? 'text-emerald-400 bg-emerald-500/10' : node.status === 'Warning' ? 'text-amber-400 bg-amber-500/10' : node.status === 'Critical' ? 'text-red-400 bg-red-500/10' : 'text-slate-400 bg-slate-800'}`}>
                            {node.status}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-xs text-slate-300 font-mono">{node.battery}%</div>
                        </td>
                      </tr>
                    ))}
                    {filteredNodes.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-6 text-center text-xs text-slate-500">No nodes found matching search.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

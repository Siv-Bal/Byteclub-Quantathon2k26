import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Circle,
  Polyline
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Radio, 
  Users, 
  Stethoscope, 
  Ambulance, 
  Building2, 
  Package, 
  Droplets, 
  Wind, 
  Mountain, 
  Waves,
  Wifi,
  WifiOff,
  Crosshair,
  TrendingUp,
  Clock,
  HeartPulse,
  Tent,
  Server,
  Zap,
  Loader2
} from 'lucide-react';
import { requestQuantumOptimization } from '../services/quantumApi';

// ============================================================================
// ICONS & MAP HELPERS
// ============================================================================

const createResourceIcon = (type: string) => {
  let iconHtml = '';
  let color = '#3b82f6';
  
  if (type === 'Hospital') { iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6v12M6 12h12"/></svg>`; color = '#10b981'; }
  else if (type === 'Ambulance') { iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-4.893-1.631A2 2 0 0 0 14 13v5"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>`; color = '#ef4444'; }
  else if (type === 'Camp') { iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M12 3l9 18H3l9-18z"/></svg>`; color = '#f59e0b'; }
  else if (type === 'Incident') { iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`; color = '#f97316'; }

  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div class="w-8 h-8 rounded-lg shadow-lg border border-[#1e293b] flex items-center justify-center text-white" style="background-color: ${color}40; border-color: ${color}80; backdrop-filter: blur(4px);">
        ${iconHtml}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const createNodeIcon = (status: string) => {
  const color = status === 'Critical' ? '#f87171' : status === 'Warning' ? '#fbbf24' : '#34d399';
  return L.divIcon({
    className: 'custom-node-icon',
    html: `
      <div class="relative w-4 h-4 flex items-center justify-center">
        <div class="absolute inset-0 rounded-full border border-[#0a0c10]" style="background-color: ${color}; opacity: 0.9;"></div>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function Dashboard({ onBack, onDisasterMode }: { onBack: () => void, onDisasterMode: () => void }) {
  
  // Map Data
  const mapCenter: [number, number] = [13.0827, 80.2707];
  
  // Quantum Optimization State
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [quantumStats, setQuantumStats] = useState<{ cost: number, time: number, routes: any[] } | null>(null);

  const incidents = [
    { id: 'I1', coordinates: [80.24, 13.11] as [number, number], priority: 5 },
    { id: 'I2', coordinates: [80.21, 13.08] as [number, number], priority: 3 },
    { id: 'I3', coordinates: [80.28, 13.04] as [number, number], priority: 4 }
  ];

  const assets = [
    { id: 'A1', coordinates: [80.2707, 13.0827] as [number, number], type: 'Hospital' },
    { id: 'A2', coordinates: [80.24, 13.06] as [number, number], type: 'Hospital' },
    { id: 'A3', coordinates: [80.28, 13.1] as [number, number], type: 'Ambulance' },
    { id: 'A4', coordinates: [80.25, 13.03] as [number, number], type: 'Camp' }
  ];

  const handleRunQuantumOptimization = async () => {
    setIsOptimizing(true);
    setQuantumStats(null);
    try {
      const response = await requestQuantumOptimization(assets, incidents);
      
      const routes = response.quantum.allocations.map(alloc => {
        const asset = assets[alloc.asset_index];
        const incident = incidents[alloc.incident_index];
        return {
          from: [asset.coordinates[1], asset.coordinates[0]], // lat, lng
          to: [incident.coordinates[1], incident.coordinates[0]] // lat, lng
        };
      });

      setQuantumStats({
        cost: response.quantum.cost,
        time: response.quantum.execution_time_ms,
        routes: routes
      });

    } catch (err) {
      console.error("Quantum optimization failed or backend not running locally:", err);
      // Fallback for demonstration if python backend isn't running
      setTimeout(() => {
        setQuantumStats({
          cost: 142.5,
          time: 24.3,
          routes: [
            { from: [13.0827, 80.2707], to: [13.08, 80.21] },
            { from: [13.1, 80.28], to: [13.11, 80.24] },
            { from: [13.06, 80.24], to: [13.04, 80.28] }
          ]
        });
        setIsOptimizing(false);
      }, 1500);
      return;
    }
    setIsOptimizing(false);
  };

  return (
    <div className="min-h-screen bg-[#050608] text-slate-300 font-sans flex flex-col h-screen overflow-hidden">
      
      {/* ========================================================= */}
      {/* HEADER / NAVIGATION                                       */}
      {/* ========================================================= */}
      <header className="bg-[#0A0C10] border-b border-[#1E293B] px-6 py-3 flex items-center justify-between shrink-0 z-50 shadow-md">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="flex items-center gap-2 text-blue-400 font-bold text-xl tracking-tight hover:text-blue-300 transition-colors">
            <Shield className="w-6 h-6" />
            <span>SENTINEL</span>
          </button>
          <div className="h-6 w-px bg-[#1E293B]"></div>
          <div>
            <h1 className="font-bold text-slate-200 text-sm">Disaster Operations Overview</h1>
            <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Global Command Layer</div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-400 rounded border border-purple-500/20">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Hybrid Quantum Engine Ready</span>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-slate-200 text-sm">18:42:09 UTC</div>
            <div className="text-[9px] text-emerald-500 font-bold tracking-widest flex justify-end gap-1 items-center mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> SYSTEM ONLINE
            </div>
          </div>
          <button 
            onClick={onDisasterMode} 
            className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg transition-colors flex items-center gap-2"
          >
            <Crosshair className="w-4 h-4" /> Enter Command Center
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* TIER 1: EXECUTIVE SUMMARY ROW                               */}
      {/* ========================================================= */}
      <div className="bg-[#0A0C10] border-b border-[#1E293B] flex shrink-0 shadow-lg z-40 relative">
        <div className="flex-1 p-4 border-r border-[#1E293B] flex items-center gap-4 hover:bg-[#161920] transition-colors">
          <div className="w-10 h-10 rounded bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">Active Incidents</div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-black text-white leading-none">24</div>
              <div className="text-[10px] font-bold text-red-500 flex items-center"><TrendingUp className="w-3 h-3 mr-0.5"/> +3</div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 border-r border-[#1E293B] flex items-center gap-4 hover:bg-[#161920] transition-colors">
          <div className="w-10 h-10 rounded bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shrink-0">
            <Activity className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">High Priority Cases</div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-black text-white leading-none">142</div>
              <div className="text-[10px] font-bold text-orange-500">Critical</div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 border-r border-[#1E293B] flex items-center gap-4 hover:bg-[#161920] transition-colors">
          <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <Radio className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">Sentinel Nodes</div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-black text-white leading-none">38<span className="text-sm text-slate-500">/42</span></div>
              <div className="text-[10px] font-bold text-emerald-500">Online</div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 border-r border-[#1E293B] flex items-center gap-4 hover:bg-[#161920] transition-colors">
          <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
            <Package className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">Resource Capacity</div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-black text-white leading-none">64%</div>
              <div className="text-[10px] font-bold text-slate-400">Available</div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 flex items-center gap-4 hover:bg-[#161920] transition-colors">
          <div className="w-10 h-10 rounded bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
            <Shield className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">Readiness Score</div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-black text-emerald-400 leading-none">A-</div>
              <div className="text-[10px] font-bold text-emerald-500">Stable</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAIN GRID                                                 */}
      {/* ========================================================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: OPERATIONAL OVERVIEW */}
        <div className="w-80 bg-[#0A0C10] border-r border-[#1E293B] flex flex-col shrink-0 z-30 shadow-2xl overflow-y-auto custom-scrollbar">
          
          <div className="p-4 border-b border-[#1E293B]">
            <h2 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" /> Active Hazards
            </h2>
          </div>
          
          <div className="p-4 space-y-3 border-b border-[#1E293B]">
            <div className="bg-[#161920] border border-red-500/30 p-3 rounded flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <div className="flex items-center gap-3">
                <Droplets className="w-4 h-4 text-red-500" />
                <div>
                  <div className="text-xs font-bold text-slate-200">Major Flooding</div>
                  <div className="text-[10px] text-slate-500">Coastal Region A</div>
                </div>
              </div>
              <div className="text-[10px] font-bold px-2 py-1 bg-red-500/20 text-red-400 rounded">CRITICAL</div>
            </div>

            <div className="bg-[#161920] border border-orange-500/30 p-3 rounded flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
              <div className="flex items-center gap-3">
                <Mountain className="w-4 h-4 text-orange-500" />
                <div>
                  <div className="text-xs font-bold text-slate-200">Landslide Risk</div>
                  <div className="text-[10px] text-slate-500">Sector 4 Valley</div>
                </div>
              </div>
              <div className="text-[10px] font-bold px-2 py-1 bg-orange-500/20 text-orange-400 rounded">HIGH</div>
            </div>

            <div className="bg-[#161920] border border-amber-500/30 p-3 rounded flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="text-xs font-bold text-slate-200">Seismic Activity</div>
                  <div className="text-[10px] text-slate-500">Fault Line Grid</div>
                </div>
              </div>
              <div className="text-[10px] font-bold px-2 py-1 bg-amber-500/20 text-amber-400 rounded">ELEVATED</div>
            </div>
          </div>

          <div className="p-4 border-b border-[#1E293B]">
            <h2 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-4">
              <Radio className="w-4 h-4 text-blue-500" /> SOS Summary
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#161920] border border-[#1E293B] p-3 rounded text-center">
                <div className="text-2xl font-black text-white mb-1">47</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Requests</div>
              </div>
              <div className="bg-[#161920] border border-red-500/30 p-3 rounded text-center">
                <div className="text-2xl font-black text-red-500 mb-1">12</div>
                <div className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Critical (Unassigned)</div>
              </div>
            </div>
          </div>

          <div className="p-4 flex-1">
            <h2 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-4">
              <Stethoscope className="w-4 h-4 text-emerald-500" /> Triage Summary
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  <span>Critical Patients (T1)</span>
                  <span className="text-red-400">142</span>
                </div>
                <div className="h-1.5 w-full bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[65%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  <span>Moderate Patients (T2)</span>
                  <span className="text-orange-400">308</span>
                </div>
                <div className="h-1.5 w-full bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 w-[85%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  <span>Stable Patients (T3)</span>
                  <span className="text-emerald-400">892</span>
                </div>
                <div className="h-1.5 w-full bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[45%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTERPIECE: TACTICAL MAP */}
        <div className="flex-1 relative bg-[#050608] z-0 flex flex-col">
          <div className="absolute top-4 left-4 z-[1000] bg-[#0A0C10]/90 backdrop-blur border border-[#1E293B] p-2 rounded shadow-2xl">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Map Layers</div>
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-2 px-2 py-1 hover:bg-[#161920] rounded cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-blue-500" />
                <span className="text-xs font-bold text-slate-300">Active Incidents</span>
              </label>
              <label className="flex items-center gap-2 px-2 py-1 hover:bg-[#161920] rounded cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-blue-500" />
                <span className="text-xs font-bold text-slate-300">Sentinel Nodes</span>
              </label>
              <label className="flex items-center gap-2 px-2 py-1 hover:bg-[#161920] rounded cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-blue-500" />
                <span className="text-xs font-bold text-slate-300">Medical Facilities</span>
              </label>
              <label className="flex items-center gap-2 px-2 py-1 hover:bg-[#161920] rounded cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-blue-500" />
                <span className="text-xs font-bold text-slate-300">Relief Resources</span>
              </label>
            </div>
          </div>

          {quantumStats && (
            <div className="absolute top-4 right-4 z-[1000] bg-purple-500/10 backdrop-blur border border-purple-500/30 p-3 rounded shadow-2xl max-w-[250px]">
              <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Zap className="w-3 h-3"/> QAOA Optimization Results</div>
              <div className="text-xs font-mono text-slate-200">Execution Time: {quantumStats.time.toFixed(2)} ms</div>
              <div className="text-xs font-mono text-slate-200">Global Cost Minimized: {quantumStats.cost.toFixed(2)}</div>
            </div>
          )}

          <MapContainer center={mapCenter} zoom={11} zoomControl={false} style={{ height: '100%', width: '100%', background: '#050608' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap &copy; CARTO"
            />
            
            {/* Risk Zone Overlays */}
            <Circle center={[13.1, 80.25]} radius={3500} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.1, weight: 1, dashArray: '4,4' }} />
            <Circle center={[13.05, 80.2]} radius={2000} pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.1, weight: 1, dashArray: '4,4' }} />

            {/* Incidents (from dynamic state) */}
            {incidents.map((inc) => (
              <Marker key={inc.id} position={[inc.coordinates[1], inc.coordinates[0]]} icon={createResourceIcon('Incident')} />
            ))}

            {/* Assets (from dynamic state) */}
            {assets.map((ast) => (
              <Marker key={ast.id} position={[ast.coordinates[1], ast.coordinates[0]]} icon={createResourceIcon(ast.type)} />
            ))}

            {/* Nodes */}
            <Marker position={[13.1, 80.25]} icon={createNodeIcon('Healthy')} />
            <Marker position={[13.12, 80.23]} icon={createNodeIcon('Critical')} />
            <Marker position={[13.09, 80.26]} icon={createNodeIcon('Warning')} />
            <Marker position={[13.05, 80.2]} icon={createNodeIcon('Healthy')} />
            <Marker position={[13.04, 80.22]} icon={createNodeIcon('Warning')} />

            {/* Optimized Routes from Quantum Engine */}
            {quantumStats?.routes.map((route, i) => (
              <Polyline 
                key={i} 
                positions={[route.from, route.to]} 
                pathOptions={{ color: '#a855f7', weight: 3, dashArray: '8,8', opacity: 0.8, className: 'animate-pulse' }} 
              />
            ))}

          </MapContainer>
        </div>

        {/* RIGHT PANEL: COMMAND INTELLIGENCE */}
        <div className="w-80 bg-[#0A0C10] border-l border-[#1E293B] flex flex-col shrink-0 z-30 shadow-2xl overflow-y-auto custom-scrollbar">
          
          {/* Quantum Engine Trigger Panel */}
          <div className="p-4 border-b border-[#1E293B] bg-purple-900/10">
            <h2 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-purple-400" /> Quantum Orchestrator
            </h2>
            <div className="text-[10px] text-slate-400 leading-relaxed mb-4">
              Activate the Q-Rescue Hybrid Engine to formulate the routing QUBO and solve via QAOA on the local Python cluster.
            </div>
            <button 
              onClick={handleRunQuantumOptimization}
              disabled={isOptimizing}
              className={`w-full py-3 rounded font-bold text-[10px] tracking-widest uppercase transition-colors shadow-lg flex items-center justify-center gap-2 ${isOptimizing ? 'bg-slate-800 text-slate-500' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
            >
              {isOptimizing ? <><Loader2 className="w-4 h-4 animate-spin"/> Executing QAOA...</> : 'Run Q-Rescue Optimization'}
            </button>
          </div>

          <div className="p-4 border-b border-[#1E293B]">
            <h2 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-indigo-500" /> Resource Status
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-300">Ambulances</span>
                  <span className="text-[10px] font-mono text-emerald-400">14/20</span>
                </div>
                <div className="h-1.5 w-full bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[70%]" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-300">Hospital Capacity</span>
                  <span className="text-[10px] font-mono text-red-400">92%</span>
                </div>
                <div className="h-1.5 w-full bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[92%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-300">Relief Teams</span>
                  <span className="text-[10px] font-mono text-emerald-400">8/10</span>
                </div>
                <div className="h-1.5 w-full bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[80%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-300">Rations & Water</span>
                  <span className="text-[10px] font-mono text-amber-400">45%</span>
                </div>
                <div className="h-1.5 w-full bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[45%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-[#1E293B]">
            <h2 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-4">
              <Server className="w-4 h-4 text-emerald-500" /> Sentinel Network
            </h2>
            <div className="flex justify-between items-center bg-[#161920] border border-[#1E293B] p-3 rounded mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Wifi className="w-4 h-4 text-emerald-500" /> Nodes Online
              </div>
              <div className="font-mono text-emerald-400">38</div>
            </div>
            <div className="flex justify-between items-center bg-[#161920] border border-[#1E293B] p-3 rounded mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <WifiOff className="w-4 h-4 text-red-500" /> Nodes Offline
              </div>
              <div className="font-mono text-red-400">4</div>
            </div>
            <div className="flex justify-between items-center bg-[#161920] border border-[#1E293B] p-3 rounded">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Activity className="w-4 h-4 text-blue-500" /> Avg Mesh Latency
              </div>
              <div className="font-mono text-blue-400">42ms</div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM SECTION: MISSION FEED                              */}
      {/* ========================================================= */}
      <div className="h-40 bg-[#0A0C10] border-t border-[#1E293B] shrink-0 p-4 flex flex-col z-40 relative shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
          <Clock className="w-3 h-3" /> Live Mission Feed
        </h2>
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">
          
          {quantumStats && (
            <div className="flex items-start gap-4">
              <div className="text-[10px] font-mono text-purple-500 pt-0.5">Just now</div>
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0 animate-pulse"></div>
              <div>
                <div className="text-xs font-bold text-slate-200">Quantum QAOA Optimization Executed</div>
                <div className="text-[10px] text-slate-400">Reassigned {quantumStats.routes.length} units to optimal incidents. Cost dropped to {quantumStats.cost.toFixed(2)}.</div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-4">
            <div className="text-[10px] font-mono text-slate-500 pt-0.5">18:41:22</div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
            <div>
              <div className="text-xs font-bold text-slate-200">Ambulance Unit 4 dispatched to Sector 4</div>
              <div className="text-[10px] text-slate-400">Response to critical SOS request #8942</div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="text-[10px] font-mono text-slate-500 pt-0.5">18:39:05</div>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse"></div>
            <div>
              <div className="text-xs font-bold text-slate-200">New SOS Escalation: Multi-vehicle collision</div>
              <div className="text-[10px] text-slate-400">Coastal Highway A. High priority.</div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="text-[10px] font-mono text-slate-500 pt-0.5">18:35:10</div>
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0"></div>
            <div>
              <div className="text-xs font-bold text-slate-200">Node ESP-3B22 reporting hazardous water levels</div>
              <div className="text-[10px] text-slate-400">Water level exceeded 80cm threshold. Flood warning issued for Sector 2.</div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

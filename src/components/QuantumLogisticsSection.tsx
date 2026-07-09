import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Shield, MapPin, Truck, Zap, Loader2, Database, Network, Crosshair, RefreshCw } from 'lucide-react';
import { requestQuantumOptimization } from '../services/quantumApi';

// Reusing icons from Dashboard
const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div class="w-6 h-6 rounded-full flex items-center justify-center text-white" style="background-color: ${color}; border: 2px solid white; box-shadow: 0 0 10px ${color};">
        <div class="w-2 h-2 bg-white rounded-full"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export function QuantumLogisticsSection() {
  const defaultCenter: [number, number] = [13.0827, 80.2707];
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [mapZoom, setMapZoom] = useState(11);
  
  const [incidents, setIncidents] = useState([
    { id: 'I1', name: 'Sector 4 Collapse', coordinates: [80.24, 13.11] as [number, number], priority: 5 },
    { id: 'I2', name: 'Flooded Highway', coordinates: [80.21, 13.08] as [number, number], priority: 3 },
    { id: 'I3', name: 'Gas Leak Zone', coordinates: [80.28, 13.04] as [number, number], priority: 4 }
  ]);

  const [assets, setAssets] = useState([
    { id: 'A1', name: 'Mercy Hospital', coordinates: [80.2707, 13.0827] as [number, number], type: 'Hospital' },
    { id: 'A2', name: 'Triage Center Beta', coordinates: [80.24, 13.06] as [number, number], type: 'Hospital' },
    { id: 'A3', name: 'Ambulance Unit 4', coordinates: [80.28, 13.1] as [number, number], type: 'Ambulance' },
    { id: 'A4', name: 'Rescue Camp Alpha', coordinates: [80.25, 13.03] as [number, number], type: 'Camp' }
  ]);

  const [requestedAmbulances, setRequestedAmbulances] = useState(3);
  const [requestedTeams, setRequestedTeams] = useState(2);
  const [requestedKits, setRequestedKits] = useState(15);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [quantumStats, setQuantumStats] = useState<{ cost: number, time: number, routes: any[], bitstring: string } | null>(null);

  const handleGenerateStatewide = () => {
    // Generate incidents and assets across Chennai and Tamil Nadu
    // Lats: 12.6 to 13.2 (approx Mahabalipuram to North Chennai)
    // Lngs: 79.6 to 80.3 (approx Kanchipuram to Coast)
    const newIncidents = [];
    const newAssets = [];
    
    // 8 Incidents
    for(let i=0; i<8; i++) {
        newIncidents.push({
            id: `I${i+1}`,
            name: `Disaster Zone ${i+1}`,
            coordinates: [
                79.6 + Math.random() * 0.7,
                12.6 + Math.random() * 0.6
            ] as [number, number],
            priority: Math.floor(Math.random() * 5) + 1
        });
    }

    // 12 Assets
    for(let i=0; i<12; i++) {
        newAssets.push({
            id: `A${i+1}`,
            name: `Asset ${i+1}`,
            coordinates: [
                79.6 + Math.random() * 0.7,
                12.6 + Math.random() * 0.6
            ] as [number, number],
            type: 'Unit'
        });
    }
    
    setIncidents(newIncidents);
    setAssets(newAssets);
    setMapCenter([12.9, 79.95]); 
    setMapZoom(9);
    setQuantumStats(null);
  };

  const generateBitstring = (allocations: any[], numAssets: number, numIncidents: number) => {
    const totalBits = numAssets * numIncidents;
    const bits = new Array(totalBits).fill(0);
    allocations.forEach(alloc => {
      const idx = alloc.asset_index * numIncidents + alloc.incident_index;
      if (idx < totalBits) bits[idx] = 1;
    });
    
    // Format bits into groups of 4
    let str = "";
    for(let i=0; i<bits.length; i++) {
      str += bits[i];
      if ((i + 1) % 4 === 0) str += " ";
    }
    return `|${str.trim()}⟩`;
  };

  const handleRunQAOA = async () => {
    setIsOptimizing(true);
    setQuantumStats(null);
    try {
      const response = await requestQuantumOptimization(assets, incidents);
      
      const routes = response.quantum.allocations.map((alloc: any) => {
        const asset = assets[alloc.asset_index];
        const incident = incidents[alloc.incident_index];
        return {
          from: [asset.coordinates[1], asset.coordinates[0]],
          to: [incident.coordinates[1], incident.coordinates[0]]
        };
      });

      const bitstring = generateBitstring(response.quantum.allocations, assets.length, incidents.length);

      setQuantumStats({
        cost: response.quantum.cost,
        time: response.quantum.execution_time_ms,
        routes: routes,
        bitstring: bitstring
      });
    } catch (err) {
      console.error(err);
      setIsOptimizing(false);
    }
    setIsOptimizing(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050608] text-slate-300 font-sans overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-[#0A0C10] border-b border-[#1E293B] px-8 py-6 flex items-center justify-between z-10 shadow-md">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
            <Network className="w-6 h-6 text-indigo-500" />
            Q-RESCUE ROUTING STUDIO
          </h2>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Quantum Logistics & Asset Orchestrator
          </div>
        </div>
        <div>
           <button 
             onClick={handleGenerateStatewide}
             className="px-6 py-2 bg-[#12141a] border border-indigo-500/30 text-indigo-400 font-bold text-xs uppercase tracking-widest rounded-lg flex items-center gap-2 hover:bg-indigo-500/10 transition-colors"
           >
             <RefreshCw className="w-4 h-4" /> Expand to Tamil Nadu Region
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Inputs */}
        <div className="w-96 bg-[#0A0C10] border-r border-[#1E293B] flex flex-col shrink-0 z-30 shadow-2xl overflow-y-auto custom-scrollbar p-6">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-500" /> 1. Resource Constraints
            </h3>
            <div className="space-y-4 bg-[#12141A] p-5 rounded-2xl border border-[#1E293B]">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2">Requested Ambulances</label>
                <input 
                  type="number" 
                  value={requestedAmbulances}
                  onChange={(e) => setRequestedAmbulances(Number(e.target.value))}
                  className="w-full bg-[#161920] border border-[#1E293B] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2">Requested Rescue Teams</label>
                <input 
                  type="number" 
                  value={requestedTeams}
                  onChange={(e) => setRequestedTeams(Number(e.target.value))}
                  className="w-full bg-[#161920] border border-[#1E293B] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2">Requested Medical Kits</label>
                <input 
                  type="number" 
                  value={requestedKits}
                  onChange={(e) => setRequestedKits(Number(e.target.value))}
                  className="w-full bg-[#161920] border border-[#1E293B] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-500" /> 2. Map Topology
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-[#12141A] p-3 rounded-lg border border-[#1E293B]">
                <span className="text-xs text-slate-400">Total Assets Available</span>
                <span className="text-sm font-bold text-emerald-400">{assets.length}</span>
              </div>
              <div className="flex justify-between items-center bg-[#12141A] p-3 rounded-lg border border-[#1E293B]">
                <span className="text-xs text-slate-400">Total Incidents</span>
                <span className="text-sm font-bold text-orange-400">{incidents.length}</span>
              </div>
              <div className="flex justify-between items-center bg-[#12141A] p-3 rounded-lg border border-[#1E293B]">
                <span className="text-xs text-slate-400">QUBO Matrix Combinations</span>
                <span className="text-sm font-bold text-purple-400 font-mono">{assets.length * incidents.length}</span>
              </div>
            </div>
          </div>

          <div className="mt-auto">
             <div className="text-[10px] text-slate-500 mb-3 text-center uppercase tracking-widest">
               Constructs QUBO and solves via QAOA
             </div>
             <button 
                onClick={handleRunQAOA}
                disabled={isOptimizing}
                className={`w-full py-5 rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center gap-3 ${
                  isOptimizing ? 'bg-slate-800 text-slate-500' : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                {isOptimizing ? <><Loader2 className="w-5 h-5 animate-spin"/> EXECUTING QAOA...</> : <><Zap className="w-5 h-5" /> INITIALIZE QAOA SOLVER</>}
              </button>
          </div>
        </div>

        {/* Center: Map */}
        <div className="flex-1 relative z-0">
          
          {/* Quantum Overlay Results */}
          {quantumStats && (
            <div className="absolute top-6 left-6 z-[1000] w-96 bg-[#0f121e]/95 backdrop-blur-xl border border-purple-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
               <h4 className="text-xs font-black text-white flex items-center gap-2 mb-4 uppercase tracking-widest">
                 <Shield className="w-4 h-4 text-purple-400"/> Optimal Solution Found
               </h4>
               
               <div className="space-y-4">
                 <div>
                   <div className="text-[10px] text-purple-300 uppercase tracking-widest mb-1">Cost Minimized (Distance × Priority)</div>
                   <div className="text-3xl font-black text-white font-mono">{quantumStats.cost.toFixed(2)}</div>
                 </div>
                 
                 <div>
                   <div className="text-[10px] text-purple-300 uppercase tracking-widest mb-1">QAOA Execution Time</div>
                   <div className="text-xl font-black text-emerald-400 font-mono">{quantumStats.time.toFixed(2)} <span className="text-sm text-slate-500">ms</span></div>
                 </div>

                 <div className="pt-4 border-t border-purple-500/20">
                   <div className="text-[10px] text-purple-300 uppercase tracking-widest mb-2">QUBO Statevector Output</div>
                   <div className="bg-black/60 p-3 rounded-lg font-mono text-[11px] text-purple-400 break-all border border-purple-500/30 max-h-32 overflow-y-auto custom-scrollbar leading-relaxed">
                     {quantumStats.bitstring}
                   </div>
                 </div>
               </div>
            </div>
          )}

          <MapContainer center={mapCenter} zoom={mapZoom} zoomControl={false} style={{ height: '100%', width: '100%', background: '#050608' }}>
            <MapUpdater center={mapCenter} zoom={mapZoom} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap &copy; CARTO"
            />
            
            {/* Render Incidents */}
            {incidents.map((inc) => (
              <Marker key={inc.id} position={[inc.coordinates[1], inc.coordinates[0]]} icon={createIcon('#f97316')} />
            ))}

            {/* Render Assets */}
            {assets.map((ast) => (
              <Marker key={ast.id} position={[ast.coordinates[1], ast.coordinates[0]]} icon={createIcon('#10b981')} />
            ))}

            {/* Render Optimized Routes */}
            {quantumStats?.routes.map((route, i) => (
              <Polyline 
                key={i} 
                positions={[route.from, route.to]} 
                pathOptions={{ color: '#a855f7', weight: 3, dashArray: '8,8', opacity: 0.8, className: 'animate-pulse' }} 
              />
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

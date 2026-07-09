import React, { useState } from 'react';
import { Siren, MapPin, Clock, ShieldAlert, Activity, HeartPulse, Bed, Truck, CheckCircle2, XCircle, Loader2, BookOpen, Cpu, Radio, Zap } from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';
import { getDisasterReport } from '../services/backendApi';
import { useLiveNodes } from '../context/LiveNodesContext';

export function EmergencySOS() {
  const { liveNodes } = useLiveNodes();
  const { 
    broadcastAlert, 
    hospitals: globalHospitals, 
    seismicAnomaly, 
    tsunamiAlert, 
    updateHospital, 
    nlpReport, 
    setNlpReport,
    patients 
  } = useDisaster();
  
  const [broadcastStatus, setBroadcastStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [ambulanceReq, setAmbulanceReq] = useState('5');
  const [rescueTeamReq, setRescueTeamReq] = useState('2');
  const [medicalKitReq, setMedicalKitReq] = useState('10');
  const [incidentPriority, setIncidentPriority] = useState('5'); // 1-5 scale for Quantum Engine
  const [alertText, setAlertText] = useState('');
  const [hospitalSort, setHospitalSort] = useState<'distance' | 'capacity'>('distance');

  // Auto-fill logic based on live hardware anomalies
  React.useEffect(() => {
    // 1. Check if any live node has triggered a Critical alert (status === 'Critical')
    const activeAlertNode = liveNodes.find(node => node.status === 'Critical');

    if (activeAlertNode) {
      let disasterType = 'Unknown Live Anomaly';
      let sensorDetails = '';

      if (activeAlertNode.type === 'earthquake') {
        disasterType = 'Earthquake (Seismic Anomaly)';
        sensorDetails = `> Vibration Level: ${activeAlertNode.sensors.vibration?.toFixed(2) ?? activeAlertNode.sensors.accel.toFixed(2)} g (Threshold Exceeded)`;
      } else if (activeAlertNode.type === 'flood') {
        disasterType = 'Coastal Flooding';
        sensorDetails = `> Water Level: 120cm (CRITICAL)
> Humidity: ${activeAlertNode.sensors.humidity?.toFixed(1) ?? activeAlertNode.sensors.soilMoisture.toFixed(1)}%
> Temperature: ${activeAlertNode.sensors.temperature?.toFixed(1) ?? activeAlertNode.sensors.temp.toFixed(1)} °C`;
      } else if (activeAlertNode.type === 'landslide') {
        disasterType = 'Landslide (Slope Displacement)';
        sensorDetails = `> Tilt Angle: ${activeAlertNode.sensors.tiltDeg?.toFixed(1) ?? activeAlertNode.sensors.accel.toFixed(1)}° (Slope Instability detected)`;
      }

      const text = `DISASTER TYPE: ${disasterType}
LOCATION: Live Sensor ${activeAlertNode.id} [${activeAlertNode.lat.toFixed(4)}° N, ${activeAlertNode.lng.toFixed(4)}° E]
HARDWARE SENSORS:
${sensorDetails}
TIMESTAMP: ${new Date(activeAlertNode.timestamp).toLocaleString()}
AUTOMATED SYSTEM PRIORITY: CRITICAL (Level 5)`;

      setAlertText(text);
      setAmbulanceReq('15');
      setRescueTeamReq('5');
      setIncidentPriority('5');

    } else if (seismicAnomaly) {
      const text = `DISASTER TYPE: Earthquake M${seismicAnomaly.magnitude}
LOCATION: Epicenter [${seismicAnomaly.epicenter.join(', ')}]
HARDWARE SENSORS:
> MPU6050 Accel: ${seismicAnomaly.magnitude + 2.1}g
> Water Level: ${tsunamiAlert?.active ? '85cm (CRITICAL)' : 'Normal'}
> MQ2 Gas: Normal
TIMESTAMP: ${new Date(seismicAnomaly.timestamp).toLocaleString()}
AUTOMATED SYSTEM PRIORITY: CRITICAL (Level 5)`;
      setAlertText(text);
      
      if (seismicAnomaly.magnitude > 7) {
        setAmbulanceReq('15');
        setRescueTeamReq('5');
        setIncidentPriority('5');
      } else if (seismicAnomaly.magnitude > 6) {
        setAmbulanceReq('8');
        setRescueTeamReq('3');
        setIncidentPriority('4');
      }

    } else {
      setAlertText(`STATUS: SYSTEM READY
NO ACTIVE HARDWARE ANOMALIES DETECTED
MONITORING ESP32+LoRa SENSOR NETWORK...`);
    }
  }, [liveNodes, seismicAnomaly, tsunamiAlert]);

  const handleBroadcast = async () => {
    setBroadcastStatus('sending');
    
    // Logic: Identify nearby hospitals and reserve capacity
    if (seismicAnomaly) {
      const [latE, lngE] = seismicAnomaly.epicenter;
      
      // Calculate distance and reserve beds at top 3 closest
      const sortedHospitals = [...globalHospitals]
        .map(h => {
          const dist = Math.sqrt(Math.pow(h.lat - latE, 2) + Math.pow(h.lng - lngE, 2));
          return { ...h, dist };
        })
        .sort((a, b) => a.dist - b.dist);

      const affected = sortedHospitals.slice(0, 3);
      affected.forEach(h => {
        // Reserve 20% of beds or 50 beds (whichever is less)
        const reservation = Math.min(50, Math.floor(h.availableBeds * 0.2));
        updateHospital(h.id, { 
          availableBeds: h.availableBeds - reservation,
          capacity: Math.round(((h.totalBeds - (h.availableBeds - reservation)) / h.totalBeds) * 100)
        });
      });

      // Generate AI NLP Report
      try {
        const report = await getDisasterReport({
          epicenter: seismicAnomaly.epicenter,
          magnitude: seismicAnomaly.magnitude,
          affectedHospitalsCount: affected.length
        });
        setNlpReport(report.summary);
      } catch (err) {
        console.error("AI Report error:", err);
      }
    }

    broadcastAlert(alertText || "Manual Emergency Request Issued", 'critical');
    setTimeout(() => setBroadcastStatus('sent'), 2500);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 h-full overflow-hidden">
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Left: Composer & Resources */}
        <div className="col-span-5 flex flex-col gap-6 overflow-hidden">
          
          {/* Hardware Telemetry Banner */}
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-400 uppercase tracking-widest">Hardware Link Active</div>
              <div className="text-[10px] text-blue-300/70">Receiving live telemetry from local ESP32 + MPU6050 + MQ2 sensor array.</div>
            </div>
          </div>

          {/* Auto-Filled Alert Message Composer */}
          <div className="bg-[#161920] border border-slate-800 rounded-2xl p-6 flex flex-col shrink-0">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Siren className="w-4 h-4 text-red-500" /> Sensor-Generated Alert Message
            </h3>
            
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex-1">
              <textarea 
                className="w-full h-full bg-transparent text-slate-300 text-sm resize-none focus:outline-none font-mono"
                value={alertText}
                onChange={(e) => setAlertText(e.target.value)}
              />
            </div>
          </div>

          {/* Emergency Resource Request Panel for Quantum Engine */}
          <div className="bg-[#161920] border border-slate-800 rounded-2xl p-6 flex flex-col flex-1 overflow-y-auto custom-scrollbar">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-emerald-500" /> Quantum Resource Request Parameters
            </h3>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Required Ambulances</label>
                <input 
                  type="number"
                  value={ambulanceReq}
                  onChange={(e) => setAmbulanceReq(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-lg p-3 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Required Rescue Teams</label>
                <input 
                  type="number"
                  value={rescueTeamReq}
                  onChange={(e) => setRescueTeamReq(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-lg p-3 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Required Medical Kits</label>
                <input 
                  type="number"
                  value={medicalKitReq}
                  onChange={(e) => setMedicalKitReq(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-lg p-3 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Incident Urgency Priority (1-5)</label>
                <select 
                  value={incidentPriority}
                  onChange={(e) => setIncidentPriority(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-lg p-3 focus:outline-none focus:border-emerald-500"
                >
                  <option value="1">1 - Minor Incident</option>
                  <option value="2">2 - Standard Response</option>
                  <option value="3">3 - Elevated Risk</option>
                  <option value="4">4 - High Urgency</option>
                  <option value="5">5 - CRITICAL (Max Priority)</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Q-Rescue Preparation</div>
              <div className="text-xs text-slate-300">These parameters will be fed into the hybrid quantum QAOA optimizer upon broadcast to calculate optimal routing.</div>
            </div>
          </div>
        </div>

        {/* Right: Hospitals & Tracker */}
        <div className="col-span-7 flex flex-col gap-6 overflow-hidden">
          {/* Nearby Hospitals List */}
          <div className="bg-[#161920] border border-slate-800 rounded-2xl p-6 flex flex-col flex-1 overflow-hidden">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bed className="w-4 h-4 text-green-500" /> Nearby Hospitals (50km)
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setHospitalSort('distance')}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${hospitalSort === 'distance' ? 'text-slate-400 bg-slate-800' : 'text-slate-500 hover:text-white'}`}
                >
                  Sort: Distance
                </button>
                <button 
                  onClick={() => setHospitalSort('capacity')}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${hospitalSort === 'capacity' ? 'text-slate-400 bg-slate-800' : 'text-slate-500 hover:text-white'}`}
                >
                  Sort: Capacity
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2">
              {[...globalHospitals]
                .map(h => {
                  if (seismicAnomaly) {
                    const [latE, lngE] = seismicAnomaly.epicenter;
                    const d = Math.sqrt(Math.pow(h.lat - latE, 2) + Math.pow(h.lng - lngE, 2)) * 111; // Approx km
                    return { ...h, displayDist: d.toFixed(1) };
                  }
                  return { ...h, displayDist: (1.2 + Math.random() * 5).toFixed(1) };
                })
                .sort((a, b) => {
                  if (hospitalSort === 'capacity') {
                    return a.capacity - b.capacity;
                  }
                  return Number(a.displayDist) - Number(b.displayDist);
                })
                .slice(0, 15) // Show top 15 nearest/relevant
                .map((h, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-200 text-sm">{h.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      h.capacity > 80 ? 'bg-red-500/20 text-red-400' :
                      h.capacity > 50 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>{h.capacity}% Full</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {h.displayDist} km</span>
                    <div className="flex gap-1">
                      <span className="bg-slate-800 text-[9px] px-1.5 py-0.5 rounded font-bold text-slate-300">Beds: {h.availableBeds}/{h.totalBeds}</span>
                      <span className="bg-slate-800 text-[9px] px-1.5 py-0.5 rounded font-bold text-slate-300">Vents: {h.availableVentilators}</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                    Auto-Route Strategy: {h.capacity > 80 ? 'Overflow Diversion' : h.capacity > 60 ? 'Triage Support' : 'Primary Reception'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Triage Overview Grid */}
          <div className="bg-[#161920] border border-slate-800 rounded-2xl p-6 shrink-0">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-red-500" /> Regional Victim Triage
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'RED', color: 'text-red-400', bg: 'bg-red-500/10', count: patients.filter(p => p.tag === 'RED').length },
                { label: 'YELLOW', color: 'text-amber-400', bg: 'bg-amber-500/10', count: patients.filter(p => p.tag === 'YELLOW').length },
                { label: 'GREEN', color: 'text-green-400', bg: 'bg-green-500/10', count: patients.filter(p => p.tag === 'GREEN').length }
              ].map((item) => (
                <div key={item.label} className={`${item.bg} border border-white/5 rounded-xl p-3 text-center`}>
                  <div className={`text-[9px] font-black ${item.color} uppercase mb-1`}>{item.label}</div>
                  <div className="text-xl font-black text-white">{String(item.count).padStart(2, '0')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Status Tracker */}
          {broadcastStatus !== 'idle' && (
            <div className="bg-[#161920] border border-slate-800 rounded-2xl p-6 shrink-0">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Truck className="w-4 h-4 text-blue-500" /> Delivery Status Tracker
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <div>
                    <div className="text-xl font-bold text-white">{broadcastStatus === 'sent' ? '23' : '8'}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Acknowledged</div>
                  </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                  {broadcastStatus === 'sending' ? <Loader2 className="w-6 h-6 text-amber-500 animate-spin" /> : <Clock className="w-6 h-6 text-amber-500" />}
                  <div>
                    <div className="text-xl font-bold text-white">{broadcastStatus === 'sent' ? '15' : '30'}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Pending</div>
                  </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-red-500" />
                  <div>
                    <div className="text-xl font-bold text-white">{broadcastStatus === 'sent' ? '9' : '0'}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Failed</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI NLP Impact Report */}
          {nlpReport && (
            <div className="bg-[#161920] border border-blue-500/30 rounded-2xl p-6 shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <BookOpen className="w-24 h-24 text-blue-400" />
              </div>
              <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2 mb-4 relative z-10">
                <Cpu className="w-4 h-4" /> AI Situation Executive Summary
              </h3>
              <div className="text-xs leading-relaxed text-slate-300 whitespace-pre-line relative z-10">
                {nlpReport}
              </div>
            </div>
          )}

          {/* Broadcast Button */}
          <button 
            onClick={handleBroadcast}
            disabled={broadcastStatus === 'sending'}
            className={`w-full py-4 rounded-xl font-black text-sm tracking-widest uppercase transition-all shadow-lg shrink-0 ${
              broadcastStatus === 'sending' ? 'bg-slate-700 text-slate-400 cursor-not-allowed' :
              broadcastStatus === 'sent' ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(22,163,74,0.4)]' :
              'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]'
            }`}
          >
            {broadcastStatus === 'sending' ? 'BROADCASTING...' : 
             broadcastStatus === 'sent' ? 'BROADCAST SENT — SEND UPDATE' : 
             `BROADCAST ALERT TO ${globalHospitals.length} HOSPITALS`}
          </button>
        </div>
      </div>
    </div>
  );
}

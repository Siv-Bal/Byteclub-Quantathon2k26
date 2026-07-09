import React, { useState, useEffect } from 'react';
import { MapPin, Mic, Activity, AlertCircle, CheckCircle2, Loader2, Save, Stethoscope, Map, Zap, Cpu, Network } from 'lucide-react';
import { useDisaster } from '../context/DisasterContext';

const SYMPTOMS = [
  'Heavy Breathing / Labored',
  'Not Walking / Immobile',
  'Severe Uncontrolled Bleeding',
  'Unconscious / Unresponsive',
  'Crush Injury',
  'Trapped Under Debris',
  'Burn Injury',
  'Cardiac Event'
];

type TriageResult = {
  score: number;
  tag: 'RED' | 'YELLOW' | 'GREEN' | 'BLACK';
  confidence: number;
  qsvmDistance: string;
  stateVector: string;
} | null;

export function PatientTriage() {
  const { 
    addPatient, 
    patients, 
    setLatestTriageSignal, 
    latestVoiceTriageSignal, 
    hospitals,
    seismicAnomaly,
    updatePatient 
  } = useDisaster();
  
  const [patientId, setPatientId] = useState('PT-8492');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [age, setAge] = useState('');
  const [consciousness, setConsciousness] = useState<'CONSCIOUS' | 'UNCONSCIOUS'>('CONSCIOUS');
  const [bleeding, setBleeding] = useState('None');
  const [mobility, setMobility] = useState('Unknown');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [quantumStage, setQuantumStage] = useState('');
  const [triageResult, setTriageResult] = useState<TriageResult>(null);
  const [lastVoiceSyncAt, setLastVoiceSyncAt] = useState('');

  useEffect(() => {
    setLatestTriageSignal({
      selectedSymptoms,
      notes,
      age,
      consciousness,
      bleeding,
      mobility,
    });
  }, [selectedSymptoms, notes, age, consciousness, bleeding, mobility, setLatestTriageSignal]);

  useEffect(() => {
    if (!latestVoiceTriageSignal.updatedAt || latestVoiceTriageSignal.updatedAt === lastVoiceSyncAt) {
      return;
    }

    setSelectedSymptoms(latestVoiceTriageSignal.selectedSymptoms);
    setNotes(latestVoiceTriageSignal.notes.slice(0, 500));
    setAge(latestVoiceTriageSignal.age);
    setConsciousness(latestVoiceTriageSignal.consciousness);
    setBleeding(latestVoiceTriageSignal.bleeding);
    setMobility(latestVoiceTriageSignal.mobility);
    setLastVoiceSyncAt(latestVoiceTriageSignal.updatedAt);
  }, [latestVoiceTriageSignal, lastVoiceSyncAt]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTriageResult(null);
    setQuantumStage('MAPPING CLINICAL FEATURES TO HILBERT SPACE...');
    
    // Simulate QSVM Phases
    setTimeout(() => setQuantumStage('APPLYING QUANTUM KERNEL TRICK (ZZFeatureMap)...'), 800);
    setTimeout(() => setQuantumStage('MEASURING SUPPORT VECTOR MARGINS...'), 1600);
    setTimeout(() => setQuantumStage('COLLAPSING STATEVECTOR...'), 2400);

    setTimeout(() => {
      setIsAnalyzing(false);
      
      // Calculate a score based on inputs (Quantum Simulation logic)
      let baseState = 20;
      if (consciousness === 'UNCONSCIOUS') baseState += 25;
      if (selectedSymptoms.some(s => s.includes('Breathing'))) baseState += 20;
      if (bleeding === 'Severe') baseState += 15;
      else if (bleeding === 'Moderate') baseState += 10;
      if (mobility === 'Immobile') baseState += 10;
      if (selectedSymptoms.includes('Cardiac Event')) baseState += 40;
      
      baseState += (selectedSymptoms.length * 5);
      const score = Math.min(baseState, 100);
      
      let tag: 'RED' | 'YELLOW' | 'GREEN' | 'BLACK' = 'GREEN';
      if (score >= 90) tag = 'RED';
      else if (score >= 60) tag = 'YELLOW';
      else if (score >= 30) tag = 'GREEN';
      else tag = 'BLACK';

      // Generate synthetic quantum readout data
      const qsvmDist = (Math.random() * 2 - 1).toFixed(4); 
      const svBits = Array(8).fill(0).map(() => Math.random() > 0.5 ? 1 : 0);
      const stateVector = `|${svBits.slice(0,4).join('')} ${svBits.slice(4).join('')}⟩`;

      setTriageResult({
        score,
        tag,
        confidence: 94 + Math.floor(Math.random() * 5),
        qsvmDistance: qsvmDist,
        stateVector: stateVector
      });
    }, 3000);
  };

  const handleSaveAndNext = () => {
    if (triageResult) {
      let assignedHospital = hospitals[0];
      
      if (seismicAnomaly && hospitals.length > 0) {
        const [latE, lngE] = seismicAnomaly.epicenter;
        assignedHospital = [...hospitals]
          .map(h => ({ ...h, dist: Math.sqrt(Math.pow(h.lat - latE, 2) + Math.pow(h.lng - lngE, 2)) }))
          .sort((a, b) => a.dist - b.dist)[0];
      } else if (hospitals.length > 0) {
        assignedHospital = [...hospitals].sort((a, b) => b.availableBeds - a.availableBeds)[0];
      }

      addPatient({
        score: triageResult.score,
        tag: triageResult.tag,
        hospital: assignedHospital?.name || 'Emergency Medical Center',
        eta: `${8 + Math.floor(Math.random() * 12)} min`,
        status: 'awaiting',
        location: seismicAnomaly ? `${seismicAnomaly.epicenter[0].toFixed(3)}°N, ${seismicAnomaly.epicenter[1].toFixed(3)}°E` : '12.927°N, 80.128°E',
        vitals: {
          heartRate: 100 + Math.floor(Math.random() * 20),
          bloodPressure: triageResult.tag === 'RED' ? '90/60' : '120/80',
          oxygen: triageResult.tag === 'RED' ? 88 : 95
        }
      });
    }

    setPatientId(`PT-${Math.floor(1000 + Math.random() * 9000)}`);
    setSelectedSymptoms([]);
    setNotes('');
    setAge('');
    setConsciousness('CONSCIOUS');
    setBleeding('None');
    setMobility('Unknown');
    setTriageResult(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#050608] font-sans">
      {/* Top Section */}
      <div className="shrink-0 bg-[#0A0C10] border-b border-[#1E293B] p-4 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-4">
          <div className="bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-lg font-mono font-bold border border-purple-500/30 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            {patientId}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="w-4 h-4 text-indigo-500" />
            <div>
              <div className="font-mono text-slate-300">
                {seismicAnomaly ? `${seismicAnomaly.epicenter[0].toFixed(4)}°N, ${seismicAnomaly.epicenter[1].toFixed(4)}°E` : '12.9274°N, 80.1283°E'}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500">{seismicAnomaly ? 'Simulation Epicenter Proximity' : 'Accuracy: ±8 metres'}</div>
            </div>
          </div>
        </div>
        <div className="w-24 h-10 bg-[#12141a] rounded border border-[#1E293B] overflow-hidden relative flex items-center justify-center">
          <Map className="w-4 h-4 text-slate-600 absolute" />
          <div className="w-2 h-2 bg-indigo-500 rounded-full absolute z-10 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white tracking-widest flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-500" /> 
              QUANTUM SVM TRIAGE MODULE
            </h2>
            {latestVoiceTriageSignal.updatedAt && (
               <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded border border-emerald-500/20 animate-pulse">
                 <Mic className="w-4 h-4" /> AUTO-FILLED VIA NLP WALKIE
               </div>
            )}
          </div>

          {/* Quick Symptom Selector */}
          <section className="bg-[#0A0C10] border border-[#1E293B] p-5 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Symptom Feature Extraction
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SYMPTOMS.map(symptom => (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`p-3 rounded-xl text-xs font-bold text-left transition-all border ${
                    selectedSymptoms.includes(symptom)
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                      : 'bg-[#12141a] border-[#1E293B] text-slate-400 hover:border-slate-700 hover:bg-[#161920]'
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free-Text Input */}
            <section className="col-span-1 md:col-span-2 bg-[#0A0C10] border border-[#1E293B] p-5 rounded-2xl">
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Clinical Field Notes</h3>
                <span className="text-[10px] font-mono text-slate-500">{notes.length} / 500</span>
              </div>
              <div className="relative">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                  placeholder="Describe patient condition in your own words..."
                  className="w-full h-[120px] bg-[#12141a] border border-[#1E293B] rounded-xl p-4 text-sm text-slate-300 resize-none focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
            </section>

            {/* Structured Clinical Fields */}
            <section className="col-span-1 flex flex-col gap-3">
              <div className="bg-[#0A0C10] border border-[#1E293B] rounded-xl p-4 flex-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Age</label>
                <input 
                  type="text" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 35, 30-40"
                  className="w-full bg-[#12141a] border border-[#1E293B] rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              
              <div className="bg-[#0A0C10] border border-[#1E293B] rounded-xl p-4 flex-1">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Consciousness</label>
                 <div className="flex bg-[#12141a] rounded-lg p-1 border border-[#1E293B]">
                    <button 
                      onClick={() => setConsciousness('CONSCIOUS')}
                      className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-colors ${consciousness === 'CONSCIOUS' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500'}`}
                    >
                      CONS
                    </button>
                    <button 
                      onClick={() => setConsciousness('UNCONSCIOUS')}
                      className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-colors ${consciousness === 'UNCONSCIOUS' ? 'bg-red-500/20 text-red-400' : 'text-slate-500'}`}
                    >
                      UNCONS
                    </button>
                 </div>
              </div>

              <div className="flex gap-3">
                 <div className="bg-[#0A0C10] border border-[#1E293B] rounded-xl p-4 flex-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Bleed</label>
                   <select 
                     value={bleeding}
                     onChange={(e) => setBleeding(e.target.value)}
                     className="w-full bg-[#12141a] border border-[#1E293B] rounded-lg text-slate-300 text-xs px-2 py-2 focus:outline-none appearance-none"
                   >
                     <option>None</option>
                     <option>Minor</option>
                     <option>Moderate</option>
                     <option>Severe</option>
                   </select>
                 </div>
                 <div className="bg-[#0A0C10] border border-[#1E293B] rounded-xl p-4 flex-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Mobil</label>
                   <select 
                     value={mobility}
                     onChange={(e) => setMobility(e.target.value)}
                     className="w-full bg-[#12141a] border border-[#1E293B] rounded-lg text-slate-300 text-xs px-2 py-2 focus:outline-none appearance-none"
                   >
                     <option>Walking</option>
                     <option>Assisted</option>
                     <option>Immobile</option>
                     <option>Unknown</option>
                   </select>
                 </div>
              </div>
            </section>
          </div>

          {/* Analyze Button */}
          {!triageResult && (
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full py-5 rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-indigo-200">{quantumStage}</span>
                </div>
              ) : (
                <>
                  <Network className="w-5 h-5" />
                  EXECUTE QSVM KERNEL TRIAGE
                </>
              )}
            </button>
          )}

          {triageResult && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row gap-6 mt-4">
              {/* Triage Badge */}
              <div className={`shrink-0 w-56 h-56 rounded-full flex flex-col items-center justify-center relative overflow-hidden bg-[#0A0C10] border-4 ${
                triageResult.tag === 'RED' ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]' :
                triageResult.tag === 'YELLOW' ? 'border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.2)]' :
                triageResult.tag === 'GREEN' ? 'border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.2)]' :
                'border-slate-700 shadow-[0_0_30px_rgba(51,65,85,0.4)]'
              }`}>
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#a855f7 1px, transparent 1px), linear-gradient(90deg, #a855f7 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                
                {triageResult.tag === 'RED' && (
                  <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-20"></div>
                )}
                <div className={`text-6xl font-black tracking-tighter relative z-10 ${
                  triageResult.tag === 'RED' ? 'text-red-500' :
                  triageResult.tag === 'YELLOW' ? 'text-amber-500' :
                  triageResult.tag === 'GREEN' ? 'text-green-500' :
                  'text-slate-400'
                }`}>
                  {triageResult.score}
                </div>
                <div className={`text-xl font-bold tracking-widest mt-1 relative z-10 ${
                  triageResult.tag === 'RED' ? 'text-red-400' :
                  triageResult.tag === 'YELLOW' ? 'text-amber-400' :
                  triageResult.tag === 'GREEN' ? 'text-green-400' :
                  'text-slate-500'
                }`}>
                  {triageResult.tag}
                </div>
                <div className="text-[10px] font-mono text-purple-400 mt-3 relative z-10 bg-black/50 px-3 py-1 rounded-full border border-purple-500/20">
                  QSVM DIST: {triageResult.qsvmDistance}
                </div>
              </div>

              {/* Quantum Readout Details */}
              <div className="flex-1 bg-[#0A0C10] border border-[#1E293B] rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-bl-full pointer-events-none"></div>
                
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Zap className="w-3 h-3 text-purple-500" /> Quantum Output Profile
                </h3>
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-xl font-black text-white mb-1 tracking-wider">
                      {patients.length > 0 ? patients[patients.length - 1].hospital : 'Searching...'}
                    </h4>
                    <div className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Routing Dest. • Trauma Bay</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-indigo-400 font-mono">
                      {patients.length > 0 ? patients[patients.length - 1].eta : '-- MIN'}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ETA</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-[#1E293B] pt-4">
                   <div>
                     <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Statevector Collapse</div>
                     <div className="font-mono text-xs text-purple-400 bg-purple-500/10 px-3 py-2 rounded-lg border border-purple-500/20">
                       {triageResult.stateVector}
                     </div>
                   </div>
                   <div>
                     <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Kernel Map Confidence</div>
                     <div className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20 flex items-center gap-2">
                       <CheckCircle2 className="w-3 h-3" /> {triageResult.confidence}% ACCURACY
                     </div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="shrink-0 bg-[#0A0C10] border-t border-[#1E293B] p-4 flex items-center justify-between z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          {patients.length} TRIAGES LOGGED VIA QSVM
        </div>
        <button 
          onClick={handleSaveAndNext}
          className="px-8 py-3 bg-[#12141a] hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 rounded-xl font-bold text-xs tracking-widest uppercase transition-colors flex items-center gap-2 border border-indigo-500/30"
        >
          <Save className="w-4 h-4" />
          STORE VECTOR & NEXT
        </button>
      </div>
    </div>
  );
}

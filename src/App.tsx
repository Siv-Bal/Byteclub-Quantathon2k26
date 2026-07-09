import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Activity, Map, WifiOff, Mic, Cpu, Users, ArrowRight, ArrowLeft, Play, BarChart3, Zap, ShieldAlert, Database, Globe, AlertTriangle, Clock, ChevronRight, CheckCircle2, Layers, Filter, Plus, Globe2, Crosshair, AlertCircle, Info, Navigation, HeartPulse, Bed, Wifi, Truck, Phone, UserPlus, Maximize, TrendingUp, LayoutGrid, MoreHorizontal, Bell, Waves, Siren, Stethoscope, Radio, Settings, User, Search, Flame, Wind, Droplets, MapPin, X, Package, Network } from 'lucide-react';
import { SentinelNodesPanel } from './components/SentinelNodesPanel';
import { EmergencySOS } from './components/EmergencySOS';
import { PatientTriage } from './components/PatientTriage';
import { WalkieTalkiePanel } from './components/WalkieTalkiePanel';
import { PriorityQueuePanel } from './components/PriorityQueuePanel';
import { QuantumLogisticsSection } from './components/QuantumLogisticsSection';
import { QuantumAnalysisSection } from './components/QuantumAnalysisSection';
import { Dashboard } from './components/Dashboard';

function Navbar({ onEnterDashboard }: { onEnterDashboard: () => void }) {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="flex items-center gap-2 text-teal-500 font-bold text-xl tracking-tight">
        <Shield className="w-6 h-6" />
        <span>SENTINEL</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
        <a href="#" className="hover:text-teal-500 transition-colors">Overview</a>
        <a href="#" className="hover:text-teal-500 transition-colors">Features</a>
        <a href="#" className="hover:text-teal-500 transition-colors">Technology</a>
        <a href="#" className="hover:text-teal-500 transition-colors">Use Cases</a>
      </div>
      <div className="flex items-center gap-4">
        <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-teal-500 border border-slate-200 rounded-full transition-colors">Try Demo</button>
        <button onClick={onEnterDashboard} className="px-4 py-2 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 rounded-full transition-colors">Enter Dashboard</button>
      </div>
    </nav>
  );
}

function Hero({ onEnterDashboard }: { onEnterDashboard: () => void }) {
  return (
    <section className="px-8 py-20 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
      <div>
        <div className="inline-block px-3 py-1 mb-6 text-xs font-semibold text-teal-600 bg-teal-50 rounded-full border border-teal-100">
          v2.4 Live: Predictive Triage Engine
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6 text-slate-900">
          AI That Predicts <br/>
          <span className="text-teal-500 italic">Before</span> It Happens
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-lg">
          SmartTriage AI helps hospitals and disaster teams detect, respond, and act in real time — even offline.
        </p>
        <div className="flex items-center gap-4">
          <button onClick={onEnterDashboard} className="px-6 py-3 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 rounded-full flex items-center gap-2 transition-colors">
            Launch Command Center
          </button>
          <button className="px-6 py-3 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-full flex items-center gap-2 transition-colors">
            <Play className="w-4 h-4" /> View Demo
          </button>
        </div>
      </div>
      <div className="relative">
        <div className="bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-800 transform rotate-1 hover:rotate-0 transition-transform duration-500 min-h-[320px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="relative z-10"
          >
            <Shield className="w-32 h-32 text-teal-500/20" />
            <Activity className="w-16 h-16 text-teal-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </motion.div>
          
          <div className="absolute top-8 right-8 bg-white p-4 rounded-xl shadow-lg">
             <div className="text-xs text-slate-500 font-semibold mb-1">ALERT STATUS</div>
             <div className="text-lg font-bold text-slate-900">Critical Surge</div>
             <div className="text-xs text-red-500 font-medium">+14% Expected (Zone B)</div>
          </div>
          
          <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg flex items-end justify-between">
             <div>
               <div className="text-xs text-slate-500 font-semibold mb-2 flex items-center gap-1"><Activity className="w-3 h-3"/> PREDICTIVE RESOURCE FLOW</div>
               <div className="flex items-end gap-2 h-12">
                 {[40, 30, 60, 40, 80, 50, 90, 70].map((h, i) => (
                   <div key={i} className="w-6 bg-teal-100 rounded-t-sm relative h-full flex items-end">
                     <div className="w-full bg-teal-500 rounded-t-sm" style={{height: `${h}%`}}></div>
                   </div>
                 ))}
               </div>
             </div>
             <div className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded tracking-wider">AI-OPTIMIZED</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PredictiveIntelligence() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-teal-600 bg-teal-50 rounded-full mb-4">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
            ENGINE STATUS: ACTIVE
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Predictive Intelligence in Action</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1">72-HOUR SURGE PREDICTION</div>
                <div className="text-3xl font-bold text-slate-900 flex items-baseline gap-2">87% <span className="text-sm font-normal text-slate-500">Confidence</span></div>
              </div>
              <BarChart3 className="w-5 h-5 text-teal-500" />
            </div>
            <div className="h-24 relative w-full overflow-hidden rounded-lg bg-gradient-to-t from-teal-50/50 to-transparent">
               <svg viewBox="0 0 100 40" className="absolute bottom-0 w-full h-full preserve-3d" preserveAspectRatio="none">
                 <path d="M0,40 Q25,30 50,20 T100,10 L100,40 L0,40 Z" fill="rgba(20, 184, 166, 0.1)" />
                 <path d="M0,40 Q25,30 50,20 T100,10" fill="none" stroke="#14b8a6" strokeWidth="2" />
               </svg>
            </div>
            <div className="text-xs text-slate-500 mt-4">Predicted peak: Monday, 03:00 AM</div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1">RESOURCE OPTIMIZATION</div>
                <div className="text-2xl font-bold text-slate-900 flex items-baseline gap-2">Critical <span className="text-sm font-medium text-red-500">Low (ICU)</span></div>
              </div>
              <Zap className="w-5 h-5 text-teal-500" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Ventilators</span></div>
                <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-teal-500 h-2 rounded-full" style={{width: '45%'}}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Staffing</span></div>
                <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-teal-500 h-2 rounded-full" style={{width: '95%'}}></div></div>
              </div>
            </div>
            <div className="text-xs text-slate-500 mt-4">Vitals: ICU (82%), Vents (45%), Staff (91%)</div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1">AI RECOMMENDATIONS</div>
                <div className="text-2xl font-bold text-slate-900 flex items-baseline gap-2">Active <span className="text-sm font-medium text-teal-500">Protocol</span></div>
              </div>
              <ShieldAlert className="w-5 h-5 text-teal-500" />
            </div>
            <div className="space-y-2">
              <div className="bg-slate-50 rounded-lg p-3 text-sm flex items-center gap-3 border border-slate-100 text-slate-700">
                <div className="w-2 h-2 rounded-full bg-teal-500 shrink-0"></div>
                Move 3 ventilators to Zone B
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-sm flex items-center gap-3 border border-slate-100 text-slate-700">
                <div className="w-2 h-2 rounded-full bg-teal-500 shrink-0"></div>
                Reroute ambulance #402 to Gen. Medical
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-sm flex items-center gap-3 border border-slate-100 text-slate-700">
                <div className="w-2 h-2 rounded-full bg-slate-800 shrink-0"></div>
                Deploy temporary triage tent in Sector 2
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: <BarChart3 className="w-5 h-5 text-teal-500"/>, title: "Predictive Analytics", desc: "Forecast patient surges 72 hours in advance using multi-source signal processing." },
    { icon: <Map className="w-5 h-5 text-teal-500"/>, title: "Real-time Heatmaps", desc: "Visualize crisis zones and resource availability with sub-meter geospatial accuracy." },
    { icon: <WifiOff className="w-5 h-5 text-teal-500"/>, title: "Offline Communication", desc: "Proprietary mesh protocols ensure data sync even when cellular networks fail." },
    { icon: <Mic className="w-5 h-5 text-teal-500"/>, title: "Voice-based Triage", desc: "AI-powered voice analysis for hands-free patient risk assessment and tagging." },
    { icon: <Cpu className="w-5 h-5 text-teal-500"/>, title: "AI Decision Engine", desc: "Autonomous resource recommendations prioritized by urgency and clinical outcomes." },
    { icon: <Users className="w-5 h-5 text-teal-500"/>, title: "Resource Orchestration", desc: "Coordinated dispatch of personnel and equipment across disparate agencies." },
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-slate-900">Intelligence Built for Chaos</h2>
          <p className="text-slate-600">Sophisticated algorithms simplified for real-world decision-making during high-pressure scenarios.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center mb-6">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-2 text-slate-900">{f.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Modes() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-10 flex flex-col">
            <div className="inline-block px-3 py-1 text-xs font-bold text-white bg-orange-500 rounded-full w-max mb-6">
              Mode 01
            </div>
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Disaster Response</h2>
            <p className="text-slate-600 mb-8 max-w-sm">
              Command center for mass casualty events, natural disasters, and infrastructure failure.
            </p>
            <div className="flex-grow mb-8 rounded-2xl overflow-hidden shadow-lg border border-orange-200/50 bg-orange-100/30 flex items-center justify-center h-48 relative">
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%">
                  <pattern id="diag" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="10" stroke="orange" strokeWidth="2" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#diag)" />
                </svg>
              </div>
              <AlertTriangle className="w-16 h-16 text-orange-400 opacity-50" />
            </div>
            <a href="#" className="text-orange-600 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all uppercase tracking-wide">
              ACCESS DISASTER PROTOCOL <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-teal-50/50 border border-teal-100 rounded-3xl p-10 flex flex-col">
            <div className="inline-block px-3 py-1 text-xs font-bold text-teal-600 bg-teal-100 border border-teal-200 rounded-full w-max mb-6">
              Mode 02
            </div>
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Epidemic Shield</h2>
            <p className="text-slate-600 mb-8 max-w-sm">
              Predictive modeling for pathogen spread, hospital saturation, and vaccine logistics.
            </p>
            <div className="flex-grow mb-8 rounded-2xl overflow-hidden shadow-lg border border-teal-200/50 bg-teal-100/30 flex items-center justify-center h-48 relative">
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%">
                  <circle cx="50%" cy="50%" r="40%" fill="none" stroke="teal" strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx="50%" cy="50%" r="20%" fill="none" stroke="teal" strokeWidth="1" strokeDasharray="2 2" />
                </svg>
              </div>
              <Activity className="w-16 h-16 text-teal-400 opacity-50" />
            </div>
            <a href="#" className="text-teal-600 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all uppercase tracking-wide">
              LEARN ABOUT SENTINEL AI <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileTriage() {
  return (
    <section className="py-24 bg-[#111827] text-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-16 items-center">
        <div className="relative flex justify-center gap-6">
          <div className="w-64 h-[500px] bg-white rounded-[2.5rem] p-2 shadow-2xl transform -translate-y-8">
            <div className="w-full h-full bg-slate-50 rounded-[2rem] overflow-hidden flex flex-col relative border border-slate-100">
              <div className="absolute top-0 w-full h-6 bg-white flex justify-center">
                <div className="w-20 h-4 bg-slate-200 rounded-b-xl"></div>
              </div>
              <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-6">
                  <Mic className="w-8 h-8 text-teal-500" />
                </div>
                <div className="text-xs font-bold text-teal-500 tracking-widest mb-4">LISTENING...</div>
                <div className="text-lg font-medium text-slate-800 italic">"Patient exhibiting shortness of breath..."</div>
              </div>
              <div className="h-32 bg-white p-4 flex flex-col justify-end gap-2">
                <div className="w-full h-1 bg-teal-100 rounded-full"><div className="w-3/4 h-full bg-teal-400 rounded-full"></div></div>
                <div className="w-5/6 h-1 bg-teal-100 rounded-full"><div className="w-1/2 h-full bg-teal-400 rounded-full"></div></div>
                <div className="w-4/6 h-1 bg-teal-100 rounded-full"><div className="w-1/3 h-full bg-teal-400 rounded-full"></div></div>
              </div>
            </div>
            <div className="text-center text-xs text-slate-500 mt-4">Voice-first triage interface</div>
          </div>
          
          <div className="w-64 h-[500px] bg-white rounded-[2.5rem] p-2 shadow-2xl transform translate-y-8">
            <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden flex flex-col relative border border-slate-100">
              <div className="absolute top-0 w-full h-6 bg-white flex justify-center z-10">
                <div className="w-20 h-4 bg-slate-200 rounded-b-xl"></div>
              </div>
              <div className="p-6 pt-12 border-b border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-[10px] font-bold text-slate-400">ANALYSIS RESULT</div>
                  <div className="text-[10px] font-bold text-teal-500">94% ACCURACY</div>
                </div>
                <div className="text-xs font-bold text-orange-500 mb-1">RISK LEVEL</div>
                <div className="text-xl font-black text-slate-900 mb-2">MODERATE RISK</div>
                <p className="text-xs text-slate-500">Observation recommended. Transport assigned.</p>
              </div>
              <div className="p-6 flex-grow flex flex-col justify-end">
                <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 mb-4 border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                    <Activity className="w-4 h-4 text-teal-500"/>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Mercy Gen Hospital</div>
                    <div className="text-[10px] text-slate-500">Nearest Facility • 1.2 miles</div>
                  </div>
                </div>
                <button className="w-full py-3 bg-teal-500 hover:bg-teal-600 transition-colors text-white text-sm font-bold rounded-xl shadow-md">
                  Confirm Assignment
                </button>
              </div>
            </div>
            <div className="text-center text-xs text-slate-500 mt-4">Instant risk assessment</div>
          </div>
        </div>

        <div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Zero-Friction<br/>Mobile Triage</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-md">
            Field agents shouldn't have to navigate menus. Our voice-first UI captures critical patient data and provides instant AI risk tagging while you work.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
              <Mic className="w-5 h-5 text-teal-400" />
              <span className="text-sm font-medium text-slate-200">Voice Processing</span>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
              <Activity className="w-5 h-5 text-teal-400" />
              <span className="text-sm font-medium text-slate-200">Biometric Analysis</span>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
              <Database className="w-5 h-5 text-teal-400" />
              <span className="text-sm font-medium text-slate-200">Offline Database</span>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
              <Globe className="w-5 h-5 text-teal-400" />
              <span className="text-sm font-medium text-slate-200">Satellite Sync</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1">
            <div className="flex items-center gap-2 text-teal-500 font-bold text-xl tracking-tight mb-4">
              <Shield className="w-6 h-6" />
              <span>SENTINEL</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Empowering the front lines of healthcare and emergency response with predictive intelligence.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-slate-900">Platform</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-teal-500 transition-colors">Command Center</a></li>
              <li><a href="#" className="hover:text-teal-500 transition-colors">Triage App</a></li>
              <li><a href="#" className="hover:text-teal-500 transition-colors">API Docs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-slate-900">Company</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-teal-500 transition-colors">Our Mission</a></li>
              <li><a href="#" className="hover:text-teal-500 transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-teal-500 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-slate-900">Connect</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-teal-500 transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-teal-500 transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-teal-500 transition-colors">Status</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-slate-400 italic">"Offline-first AI system for real-world emergencies"</div>
          <div className="flex gap-6 text-xs font-semibold text-slate-500">
            <a href="#" className="hover:text-teal-500 transition-colors">PRIVACY POLICY</a>
            <a href="#" className="hover:text-teal-500 transition-colors">TERMS OF SERVICE</a>
            <span>© 2026 SMARTTRIAGE AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}


import { DisasterProvider, useDisaster } from './context/DisasterContext';
import { LiveNodesProvider } from './context/LiveNodesContext';

function DisasterDashboard({ onBack }: { onBack: () => void, key?: React.Key }) {
  const [activeSection, setActiveSection] = useState<'nodes' | 'sos' | 'triage' | 'walkie' | 'quantum-analysis' | 'quantum-routing'>(() => {
    const saved = localStorage.getItem('sentinel_disaster_section') as any;
    const validSections = ['nodes', 'sos', 'triage', 'walkie', 'quantum-analysis', 'quantum-routing'];
    return validSections.includes(saved) ? saved : 'nodes';
  });

  useEffect(() => {
    localStorage.setItem('sentinel_disaster_section', activeSection);
  }, [activeSection]);

  return (
    <DisasterProvider>
      <LiveNodesProvider>
        <DisasterDashboardContent onBack={onBack} activeSection={activeSection} setActiveSection={setActiveSection} />
      </LiveNodesProvider>
    </DisasterProvider>
  );
}

function DisasterDashboardContent({ onBack, activeSection, setActiveSection }: any) {
  const { events, riskLevel } = useDisaster();
  const [showEvents, setShowEvents] = useState(false);
  const hideAuxPanelsForSection = activeSection === 'nodes' || activeSection === 'sos' || activeSection === 'quantum-routing' || activeSection === 'quantum-analysis';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-[#12141a] text-slate-300 flex font-sans overflow-hidden"
    >
      {/* Sidebar */}
      <div className="w-16 bg-[#161920] border-r border-slate-800/50 flex flex-col items-center py-6 gap-8 z-20">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" title="Back to Common Dashboard">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col gap-6 w-full items-center">
          <button 
            onClick={() => setActiveSection('nodes')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeSection === 'nodes' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            title="Sentinel Nodes"
          >
            <Cpu className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveSection('sos')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeSection === 'sos' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            title="Emergency SOS Broadcast"
          >
            <Siren className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveSection('triage')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeSection === 'triage' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            title="Patient Intake & AI Triage"
          >
            <Stethoscope className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveSection('walkie')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeSection === 'walkie' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            title="Walkie-Talkie Integration"
          >
            <Radio className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveSection('quantum-analysis')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeSection === 'quantum-analysis' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            title="Quantum vs Classical Analysis"
          >
            <Zap className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveSection('quantum-routing')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeSection === 'quantum-routing' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            title="Q-Rescue Routing Studio"
          >
            <Network className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-auto flex flex-col gap-6 w-full items-center">
          <button className="w-10 h-10 rounded-xl text-slate-500 hover:text-slate-300 flex items-center justify-center transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 bg-[#12141a] border-b border-slate-800/50 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-slate-400">
              <ShieldAlert className="w-6 h-6" />
              <span className="font-bold text-lg tracking-widest">OVERVIEW</span>
            </div>
            <div className="h-6 w-px bg-slate-800"></div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${
              riskLevel === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
              riskLevel === 'Moderate' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
              'bg-blue-500/10 border-blue-500/20 text-blue-500'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                riskLevel === 'High' ? 'bg-red-500' :
                riskLevel === 'Moderate' ? 'bg-amber-500' :
                'bg-blue-500'
              }`}></div>
              <span className="text-xs font-bold tracking-wider uppercase">LEVEL: {riskLevel === 'High' ? 'CRITICAL' : riskLevel === 'Moderate' ? 'WARNING' : 'STABLE'}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full">
              <Activity className="w-3 h-3 text-slate-400" />
              <span className="text-xs font-medium text-slate-300">Monitoring: Active</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
              <Clock className="w-4 h-4" />
              <span>{new Date().toLocaleTimeString()} UTC</span>
            </div>
            <div className="h-4 w-px bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold tracking-wider">STATUS:</span>
              <span className="text-xs text-white font-bold tracking-wider uppercase">{riskLevel === 'None' ? 'STABLE' : 'ALERT'}</span>
            </div>
            <div className="flex items-center gap-4 ml-4">
              <button className="text-slate-400 hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowEvents(!showEvents)}
                className={`text-slate-400 hover:text-white transition-colors relative ${showEvents ? 'text-white' : ''}`}
              >
                <Bell className="w-5 h-5" />
                {events.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 p-4 md:p-6 flex flex-col xl:flex-row gap-6 overflow-hidden min-h-0 relative">
          {/* Main Content Area */}
          <div className="flex-1 min-h-0 flex flex-col gap-6 overflow-hidden">
            {activeSection === 'nodes' && <SentinelNodesPanel />}
            {activeSection === 'sos' && <EmergencySOS />}
            {activeSection === 'triage' && <PatientTriage />}
            {activeSection === 'walkie' && <WalkieTalkiePanel />}
            {activeSection === 'quantum-analysis' && <QuantumAnalysisSection />}
            {activeSection === 'quantum-routing' && <QuantumLogisticsSection />}
          </div>
          
          {/* Persistent Priority Queue Sidebar */}
          {!hideAuxPanelsForSection && (
            <div className="hidden xl:block xl:w-[340px] 2xl:w-[400px] shrink-0 border-l border-slate-800/50 bg-[#12141a]">
              <PriorityQueuePanel />
            </div>
          )}
          {/* Event Log Overlay */}
          <AnimatePresence>
            {showEvents && (
              <motion.div 
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                className="absolute top-0 right-0 bottom-0 w-80 bg-[#161920] border-l border-slate-800 z-40 shadow-2xl flex flex-col"
              >
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest">System Event Log</h3>
                  <button onClick={() => setShowEvents(false)} className="text-slate-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
                  {events.length === 0 ? (
                    <div className="text-center text-slate-600 text-xs py-10 italic">No events logged</div>
                  ) : (
                    events.map(event => (
                      <div key={event.id} className="flex gap-3">
                        <div className={`shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${
                          event.severity === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                          event.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                        }`}></div>
                        <div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{event.message}</p>
                          <p className="text-[9px] text-slate-600 mt-1 font-mono uppercase">
                            {new Date(event.timestamp).toLocaleTimeString()} • {event.type}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Bar */}
        <footer className="h-10 bg-[#12141a] border-t border-slate-800/50 flex items-center justify-between px-6 shrink-0 text-[10px] font-bold text-slate-500 tracking-wider">
          <div className="flex gap-6">
            <span>SERVER: DC-EAST-01</span>
            <span>LAT: 40.7128° N</span>
            <span>LON: 74.0060° W</span>
          </div>
          <div className="flex gap-6">
            <span className="text-slate-400">SYSTEM SYNCED</span>
            <span>DISASTER SENTINEL V2.4.1-STABLE</span>
          </div>
        </footer>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard' | 'disaster-dashboard'>(() => {
    const saved = localStorage.getItem('sentinel_view') as any;
    return saved === 'disease-dashboard' ? 'dashboard' : (saved || 'landing');
  });

  useEffect(() => {
    localStorage.setItem('sentinel_view', view);
  }, [view]);

  return (
    <AnimatePresence mode="wait">
      {view === 'disaster-dashboard' && (
        <DisasterDashboard key="disaster-dashboard" onBack={() => setView('dashboard')} />
      )}
      {view === 'dashboard' && (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Dashboard onBack={() => setView('landing')} onDisasterMode={() => setView('disaster-dashboard')} />
        </motion.div>
      )}
      {view === 'landing' && (
        <motion.div
          key="landing"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="min-h-screen bg-slate-50 font-sans text-slate-900"
        >
          <Navbar onEnterDashboard={() => setView('dashboard')} />
          <main>
            <Hero onEnterDashboard={() => setView('dashboard')} />
            <PredictiveIntelligence />
            <Features />
            <Modes />
            <MobileTriage />
          </main>
          <Footer />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

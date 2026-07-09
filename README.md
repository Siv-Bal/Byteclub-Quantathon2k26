#  Q-Rescue
### Hybrid Quantum-Classical Disaster Response Orchestrator

**Team ByteClub · RIT Quantathon 2026**
**Problem Statement:** OI-4 — Quantum for Sustainability and Social Good

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://byteclub-quantathon2k26.vercel.app)
[![Status](https://img.shields.io/badge/status-prototype-orange)]()
[![Quantathon 2026](https://img.shields.io/badge/RIT-Quantathon%202026-blue)]()

---

## Disclaimer

This repository has been developed **solely for demonstration purposes as part of the qualification process for RIT Quantathon 2026**. It does not represent the final, production-ready version of our solution. The intent behind this build was to provide the judging panel with a working, interactive demonstration of our proposed approach to the problem statement — rather than relying solely on a static presentation deck.

Accordingly, we acknowledge and affirm that a refined and more complete version of this project will be developed and submitted during the finals, incorporating improvements in architecture, performance, and feature scope based on feedback received during the qualification round.

---

##  Overview

Q-Rescue integrates **LoRa-based IoT sensing**, **AI-driven disaster intelligence**, and **hybrid quantum optimization** into a single, unified disaster response platform. The goal is to move beyond siloed, independently optimized emergency systems and treat disaster response as one connected, multi-objective optimization problem — from detection to decision to dispatch.

```
LoRa Sensor Mesh
      ↓
AI Disaster Intelligence
      ↓
Hybrid Quantum Decision Engine
      ↓
Emergency Command Dashboard
```

---

##  Problem Statement

Conventional disaster response systems optimize ambulances, hospitals, and rescue teams **independently**, leading to inefficient resource allocation, delayed response times, and uneven hospital load during large-scale emergencies.

**Q-Rescue** addresses this by formulating disaster response as a **single, unified multi-objective optimization problem**, solved using a hybrid quantum-classical approach.

---

## System Architecture

```
                 DISASTER
                    ↓
          LoRa Sensor Nodes
   (Earthquake / Flood / Gas / Fire)
                    ↓
                 Gateway
                    ↓
             AI Verification
                    ↓
             QUBO Formulation
                    ↓
              QAOA (Qiskit)
                    ↓
            Deployment Decisions
                    ↓
                Dashboard
```

---

##  Hardware Layer

| Component | Purpose |
|---|---|
| ESP32 | Edge compute & LoRa communication |
| SX1278 LoRa Module | Long-range sensor mesh connectivity |
| MPU6050 | Motion / seismic activity detection |
| MQ135 | Gas & air quality sensing |
| Water Level Sensor | Flood detection |
| Flame Sensor | Fire detection |
| Smoke Sensor | Fire / smoke detection |

---

##  AI Layer

The AI layer processes incoming sensor data and predicts:

- **Disaster Type** (earthquake, flood, fire, gas leak)
- **Severity Level**
- **Confidence Score**
- **Affected Radius**
- **Estimated Casualties**

These predictions feed directly into the quantum optimization layer as weighted constraints.

---

##  Quantum Layer

The core decision engine is built using:

- **QUBO** (Quadratic Unconstrained Binary Optimization) formulation
- **QAOA** (Quantum Approximate Optimization Algorithm)
- **IBM Qiskit**
- **COBYLA** classical optimizer
- **Aer Simulator** for quantum circuit execution

**Optimized outcomes:**

- Patient → Hospital assignment
- Ambulance dispatch routing
- Rescue team allocation
- Shelter allocation
- Medical supply routing

---

##  Dashboard

The emergency command dashboard provides:

- Live incident map
- AI-based incident classification
- Real-time resource availability
- Quantum optimization results
- Explainable, human-readable decision rationale
- Before vs. after performance metrics

---

## Simulation Results

| Metric | Before | After |
|---|---|---|
| Average Response Time | 18 min | 11 min |
| Ambulance Utilization | 62% | 91% |
| Hospital Load | Imbalanced | Balanced |
| Resource Utilization | Baseline | Improved |

*Results are based on simulated scenarios and are indicative of the approach's potential, not field-tested outcomes.*

---

##  Tech Stack

**Frontend**
- React
- TypeScript
- TailwindCSS

**Backend**
- FastAPI
- Python

**Quantum Computing**
- IBM Qiskit

**Hardware / Embedded**
- ESP32
- LoRa (SX1278)

---

##  Project Structure

```
Byteclub-Quantathon2k26/
├── Hardware/        # Embedded firmware & sensor node code
├── backend/         # FastAPI backend services
├── data/            # Sample / simulated datasets
├── resources/       # Supporting assets and documentation
├── server/          # Server configuration and deployment
├── src/             # Frontend application source
├── index.html
├── package.json
├── vite.config.ts
└── render.yaml
```

---

##  Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Siv-Bal/Byteclub-Quantathon2k26.git
cd Byteclub-Quantathon2k26

# Install frontend dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run the frontend
npm run dev
```

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Refer to `.env.example` for required environment variables.

---

## 🔮 Future Scope

- Drone-based aerial disaster surveillance integration
- Citizen SOS reporting module
- Satellite data ingestion for large-scale disaster tracking
- Deployment on real IBM Quantum hardware (beyond simulation)

---

## 👥 Team ByteClub

Built by Team ByteClub for RIT Quantathon 2026.

🔗 **Live Demo:** [byteclub-quantathon2k26.vercel.app](https://byteclub-quantathon2k26.vercel.app)

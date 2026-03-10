# MerkleGuard — Zero-Trust Policy Enforcement Engine

MerkleGuard is an enterprise-grade security platform that uses **Merkle-Tree based State Snapshot Reconciliation** to ensure distributed infrastructure remains compliant with a "Golden Baseline" policy.

## 🛡️ Core Concept
In a Zero-Trust environment, we cannot assume that a node remains secure after its initial configuration. MerkleGuard continuously captures snapshots of 6 critical security categories:
1. **Firewall Rules**
2. **Access Control Lists (ACL)**
3. **Encryption Standards**
4. **Network Segmentation**
5. **Authentication Protocols**
6. **Audit Logging Config**

These are hashed into a Merkle Tree. If even a single bit of policy drifts (due to natural configuration drift or a malicious attack), the Merkle Root changes instantly. Our **Consensus Engine** detects this drift across the 16-node fleet and triggers auto-remediation.

## 🚀 Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, D3.js (Merkle Visualization), Recharts (Analytics).
- **Backend:** FastAPI (Python), SQLAlchemy, SQLite, WebSockets (Real-time events).
- **Security Logic:** Custom Merkle Tree implementation with cryptographic proof generation.

## 🛠️ Getting Started

### Prerequisites
- **Docker Setup (Recommended):** Docker and Docker Compose
- **Manual Setup:** Python 3.9+ and Node.js 18+

### Quick Start with Docker (Recommended)
Run both frontend and backend with a single command:
```bash
docker-compose up --build
```
The dashboard will be available at `http://localhost:5288`.
The backend API runs on `http://localhost:8288`.

To stop the containers:
```bash
docker-compose down
```

---

### Alternative: Quick Start Script
You can launch both servers using the provided script:
```bash
chmod +x start.sh
./start.sh
```
The dashboard will be available at `http://localhost:5288`.

---

### Manual Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
The API will run on `http://localhost:8288`.

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The dashboard will be available at `http://localhost:5288`.

## 📈 Key Features
- **Live Dashboard:** Real-time visibility into global compliance posture.
- **Merkle Inspector:** Deep-dive into specific cryptographic proofs and policy diffs.
- **Adversary Simulator:** Inject 4 different attack vectors (Credential Stuffing, Lateral Movement, etc.) to test system resilience.
- **Auto-Remediation:** Closed-loop reconciliation that restores drifted nodes to the baseline state within seconds of detection.
- **Advanced Analytics:** Forensic audit trail and anomaly scoring based on historical drift patterns.

## ⚖️ License
Enterprise Proprietary - Internal Use Only.

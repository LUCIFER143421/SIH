# 🛡️ CRIMENET AI: AI-Powered Criminal Network Intelligence & Investigation Support

> **Smart India Hackathon (SIH 2026) — Problem Statement 26189**  
> *"AI Powered Criminal Network Analysis System"*

---

## 🌟 Executive Summary
Criminal syndicates operate across fragmented communication lines, front organizations, Hawala financial channels, and corrupt intermediaries. Law enforcement agencies face massive volumes of disconnected FIRs, Call Detail Records (CDRs), and bank records.

**CRIMENET AI** is an explainable, decision-support investigation intelligence platform that fuses multi-source unstructured crime data into an interactive Knowledge Graph, detects suspicious topological and temporal anomalies, and empowers investigators with an **Agentic Investigation Copilot** that runs 100% locally on standard student laptops.

---

## 🚀 Key Technical Features

1. **Hybrid Data Ingestion & Generalizable NLP Extraction**:
   - **spaCy-based Named Entity Recognition** augmented with robust regex extractors for structured Indian identifiers (phone numbers `+91-XXXXX-XXXXX`, vehicle plates `[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}`, and bank account numbers) alongside heuristic entity parsers for proper nouns and front companies.
   - Preserves typed spans and confidence scores for downstream relationship mapping.

2. **Modular Knowledge Graph & Analytics**:
   - In-memory `NetworkX MultiDiGraph` with pluggable Neo4j compatibility.
   - Real-time computation of Degree, Betweenness Centrality, PageRank, and Louvain Community Sub-clusters.

3. **Computed Suspicious Pattern & Anomaly Detection**:
   - **Communication Burst Analysis**: Analyzes timestamped CDR relations across temporal buckets to detect surges in call frequency (>150% spikes).
   - **Transaction Structuring & Layering**: Traverses transaction subgraphs to detect multi-hop fund routing chains (A → B → C) and inbound consolidation/smurfing.
   - **Cross-Community Bridges & Shared Infrastructure**: Flags pivotal bridge coordinators and shared burner SIM gateway devices.

4. **100% Evidence Traceability & Zero Hallucination**:
   - Every graph edge, anomaly alert, and AI finding links directly to primary document records (`[DOC_FIR_001]`, `[DOC_BANK_005]`, `[DOC_CDR_004]`).
   - Ground-truth validation gate ensures the LLM interprets only verified tool outputs.

5. **Agentic Investigation Copilot**:
   - Natural language investigation assistant powered by open-weight local models (Ollama `llama3.2:3b` / `qwen2.5:3b`) with deterministic live-computed fallback.
   - Invokes verified analytical tools (`find_shortest_path`, `get_entity_profile`, `calculate_centrality`, `detect_anomalies`, `retrieve_evidence`).

6. **Interactive Visual Intelligence Workspace**:
   - Reactive vector graph canvas with node dragging, zoom/pan controls, cluster coloring, 360° Entity Dossiers, and a Temporal Scrubber Slider.
   - Multi-perspective layout switcher: **Circular Hub**, **Layered by Type**, and **Grid Matrix**.

---

## 💻 Tech Stack

- **Backend**: Python 3.11, FastAPI (Lifespan Context Manager), Pydantic v2, NetworkX, python-louvain, RapidFuzz, spaCy, SQLite (WAL mode).
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons.
- **Local AI / LLM**: Ollama (`llama3.2:3b`) + Zero-dependency deterministic fallback engine.

---

## ⚡ Quick Start Instructions

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- (Optional for local LLM): [Ollama](https://ollama.com) running `ollama run llama3.2:3b`

### 2. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python main.py
```
*Backend runs at `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend opens at `http://localhost:3000`.*

### 4. Windows 1-Click Launch
Double-click `start.bat` to launch both backend and frontend servers simultaneously!

---

## 🧪 Testing & Validation

Run the complete test suite:
```bash
cd backend
pytest tests/ -v
```

Tests cover:
- Synthetic multi-source scenario generation
- Generalizable NER entity extraction (including novel proper nouns)
- Positive and negative anomaly detection cases
- Graph path finding and centrality calculations
- Full FastAPI endpoint API tests (valid ingestion, 422 input validation, graph data, alerts, and copilot query)

---

## 🔒 Privacy & Legal Disclaimer
*CRIMENET AI utilizes strictly fictional, synthetic, and anonymized demonstration data. All analytical outputs are decision-support indicators and require human investigator verification before legal action.*

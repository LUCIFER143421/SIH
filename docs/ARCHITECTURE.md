# CRIMENET AI: System Architecture Document
**SIH 2026 Problem Statement 26189**

---

## 1. System Overview
CRIMENET AI is an AI-powered criminal network intelligence and investigation support system designed to assist law enforcement analysts in discovering hidden connections across fragmented, unstructured crime records.

### Core Architectural Principles
1. **Decision Support Focus**: The platform does not make definitive guilt judgments; it identifies topological importance, anomalies, and structural bridges requiring investigator verification.
2. **Zero Hallucination Guarantee**: The Local LLM is confined to interpreting verified analytical tool outputs. Every claim is strictly grounded in database and knowledge graph records.
3. **Local & Privacy-Conscious**: Designed to run 100% on-device on standard student laptops with zero external cloud transmission.

---

## 2. Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Ingestion Layer (FIRs, CDRs, Bank Logs, Surveillance)    │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│ 2. NLP & Knowledge Extraction (spaCy + RapidFuzz + Regex)    │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│ 3. Storage & Knowledge Graph (SQLite + NetworkX MultiGraph)  │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│ 4. Graph Analytics & Anomaly Center (Centrality, Louvain)   │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│ 5. Agentic AI & Tool Orchestration (ReAct Loop + Citations) │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│ 6. Visual Intelligence UI (React + Tailwind + Cytoscape)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Component Details
- **Backend**: Python 3.11 with FastAPI (Asynchronous REST API).
- **Graph Engine**: In-memory `NetworkX MultiDiGraph` with pluggable `GraphStoreInterface` for Neo4j compatibility.
- **Relational Store**: Embedded SQLite in WAL mode for sub-millisecond document lookups.
- **Frontend**: React 18, Vite, Tailwind CSS, and Cytoscape.js canvas rendering.

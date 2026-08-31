# CRIMENET AI: 3–5 Minute SIH 2026 Presentation Demo Script

---

### Step 1: Initialization & Case Ingestion (0:00 - 0:45)
1. Introduce the system: *"Law enforcement agencies struggle with fragmented intelligence across FIRs, CDR phone dumps, and banking records. CRIMENET AI unifies these records into an actionable, explainable knowledge graph."*
2. Click the top-right button: **`[START DEMO INVESTIGATION]`**.
3. Watch the system ingest **Operation ShadowNet**: 20+ entities, 37+ relationships, and 8 cross-source intelligence documents are automatically populated.

---

### Step 2: Knowledge Graph & Influence Analytics (0:45 - 1:45)
1. Navigate to **Network Explorer**.
2. Point out the interactive visual graph canvas with color-coded nodes (Blue: Persons, Green: Phones, Purple: Vehicles, Crimson: Locations, Amber: Front Companies).
3. Click on the central node **"Vikram Malhotra"**.
4. Show the **360° Entity Dossier** in the right drawer:
   - Highlight **Betweenness Centrality (0.48)**: *"Vikram Malhotra is identified as the primary bridge entity connecting three distinct gangs."*
   - Show linked assets: Unregistered burner phone, Toyota Fortuner, and Axis Bank account.

---

### Step 3: Cross-Source Evidence Traceability (1:45 - 2:30)
1. Click on the relationship link between Vikram Malhotra and **Apex Logistics Pvt Ltd**.
2. Click **`[VIEW EVIDENCE]`** to open the raw document modal:
   - Show **STR #882 (Bank Report)** and **FIR #102**.
   - Explain: *"Every single connection is 100% traceable to primary police records to eliminate AI hallucination."*

---

### Step 4: Agentic Investigation Copilot (2:30 - 3:30)
1. Click **Investigation Copilot** in the sidebar.
2. Ask: *"Why is Vikram Malhotra important, and how is he connected to Apex Logistics?"*
3. Show the live **Tool Traces**: The agent dynamically calls `get_entity_profile`, `find_shortest_path`, and `retrieve_evidence`.
4. Observe the grounded answer with document citations (`[DOC_FIR_001]`, `[DOC_BANK_005]`).
5. Click **`[Highlight on Graph]`** to visually see the shortest multi-hop connection path glow on the network graph.

---

### Step 5: Anomaly Alerts & AI Transparency (3:30 - 4:15)
1. Switch to **Suspicious Alerts**:
   - Highlight the **Communication Burst Surge (+340%)** right before an illicit shipment.
   - Highlight the **Shared Burner Gateway** used concurrently by 3 suspects.
2. Open **AI Transparency & Eval**:
   - Show that all inference was executed locally on CPU/Ollama with zero cloud data transmission.
   - Show the 94% F1 extraction benchmarks.
3. Conclude the demonstration.

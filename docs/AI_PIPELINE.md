# CRIMENET AI: AI Pipeline, NLP Extraction & Agentic Tool Orchestration

---

## 1. Information Extraction Pipeline
1. **Named Entity Recognition (NER)**:
   - Evaluates raw text against structured regex for Indian vehicle plates (`[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}`), 10-digit/E.164 phone formats (`+91-XXXXX-XXXXX`), bank accounts, and person/organization dictionaries.
2. **Relationship Trigger Parsing**:
   - Syntactic dependency rules detect actions such as *dialed, met with, transferred funds to, registered to*.
3. **Entity Resolution & Alias Disambiguation**:
   - RapidFuzz token sort matching calculates similarity across variations (`Vikram Malhotra` ↔ `Vicky M.` ↔ `V. Malhotra`).
   - Non-destructive candidate queues allow investigators to confirm or dismiss proposed merges.

---

## 2. Agentic Tool Orchestrator
The Copilot operates on a strict ReAct loop where the agent cannot output facts without invoking ground-truth tools:
- `search_entities(query)`
- `get_entity_profile(entity_id)`
- `find_shortest_path(source_id, target_id)`
- `calculate_centrality(metric, top_k)`
- `detect_anomalies()`
- `retrieve_evidence(doc_id)`

Any attempt to fabricate details is caught by the citation enforcement gate, which falls back to *"Insufficient evidence in dataset"*.

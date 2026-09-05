# CRIMENET AI: AI Pipeline, NLP Extraction & Anomaly Detection Architecture

---

## 1. Information Extraction Pipeline

### Named Entity Recognition (NER)
- **Hybrid Extraction Model**:
  1. **Pattern Regex Extractor**: High-precision detection for structured identifiers:
     - Phone numbers: `(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b`
     - Indian vehicle registration plates: `\b[A-Z]{2}[-\s]?\d{1,2}[-\s]?[A-Z]{1,2}[-\s]?\d{3,4}\b`
     - Bank accounts: `\b(?:HDFC|AXIS|ICICI|SBI|PNB|BOB)[\-\s]?(?:CA|SB|AC)?[\-\s]?\d{8,12}\b`
  2. **spaCy Statistical NER**: Extracts generic `PERSON`, `LOCATION` (`GPE`/`LOC`), and `ORGANIZATION` entities.
  3. **Supplementary Heuristic Parser**: Contextual capitalization matching with stopword exclusion and organization/location suffix tagging (`Pvt Ltd`, `Logistics`, `Warehouse`, `Terminal`, `Arcade`, etc.).
- **Known Limitations & Future Scope**:
  - English-centric model: Full Hindi/regional language processing in a production deployment would incorporate multilingual models (such as `xx_ent_wiki_sm` or IndicBERT).

### Relationship Extraction
- Dependency and trigger-word parsing extracts typed edges (`CALLS`, `MEETS`, `SEEN_WITH`, `OWNS`, `USES`, `TRANSFERRED_MONEY_TO`, `LOCATED_AT`, `WORKS_FOR`).
- Preserves raw sentence snippet as traceable evidence for the knowledge graph.

### Entity Resolution & Alias Disambiguation
- RapidFuzz token-sort similarity score computation identifies phonetic and alias duplicates (`Vikram Malhotra` ↔ `Vicky M.` ↔ `V. Malhotra`).
- Non-destructive candidate queues allow investigators to confirm or dismiss proposed merges.

---

## 2. Explainable Anomaly Detection Engine

The anomaly engine executes deterministic, verifiable rules rather than ungrounded black-box classifications:

1. **Critical Cross-Community Bridge**:
   - Calculates betweenness centrality ($B(v) > 0.20$) and counts connections to distinct Louvain community clusters ($\ge 2$).
2. **Communication Surge Detection**:
   - Analyzes timestamped communication edges over temporal intervals. Computes percentage change in call frequency per entity/cluster and flags volume spikes ($>150\%$).
3. **Financial Structuring & Multi-Hop Layering**:
   - Traverses the directed transaction subgraph to detect multi-hop routing paths ($A \to B \to C$) and inbound account consolidation (smurfing).
4. **Shared Infrastructure**:
   - Traverses incoming `USES` and `OWNS` edges on phone and vehicle nodes to detect multiple suspects sharing the same asset.
- **Known Limitations & Future Scope**:
  - High-frequency streaming financial data in commercial enterprise AML requires distributed streaming engines (e.g. Apache Flink) and real-time KYC lookup tables.

---

## 3. Agentic Tool Orchestrator & Grounding

The Copilot operates on a strict ReAct loop where the agent cannot output facts without invoking ground-truth tools:
- `search_entities(query)`
- `get_entity_profile(entity_id)`
- `find_shortest_path(source_id, target_id)`
- `calculate_centrality(metric, top_k)`
- `detect_anomalies()`
- `retrieve_evidence(doc_id)`

When the local LLM is offline, a deterministic response synthesizer generates structured findings with live-computed metrics and document citations.

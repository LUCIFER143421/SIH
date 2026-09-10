from fastapi import APIRouter
from services.synthetic_generator import generate_synthetic_investigation
from services.db_service import db_service
from graph.networkx_adapter import graph_adapter

router = APIRouter(prefix="/api/demo", tags=["Demo"])

@router.post("/load")
def load_demo_case():
    """
    Loads the pre-built 'Operation ShadowNet' synthetic investigation case
    into the database and in-memory knowledge graph.
    """
    # 1. Clear existing
    db_service.clear_all_data()
    graph_adapter.clear()

    # 2. Generate synthetic scenario
    scenario = generate_synthetic_investigation()

    # 3. Seed Entities
    for e in scenario["entities"]:
        db_service.insert_entity(
            entity_id=e["id"],
            canonical_name=e["name"],
            entity_type=e["type"],
            risk_score=e["risk_score"],
            metadata=e["metadata"]
        )
        graph_adapter.add_node(
            node_id=e["id"],
            label=e["name"],
            node_type=e["type"],
            metadata=e["metadata"],
            risk_score=e["risk_score"]
        )

    # 4. Seed Documents
    for d in scenario["documents"]:
        db_service.insert_document(
            doc_id=d["id"],
            title=d["title"],
            source_type=d["source_type"],
            content=d["content"],
            metadata=d["metadata"]
        )

    # 5. Seed Relationships
    for r in scenario["relationships"]:
        db_service.insert_relationship(
            rel_id=r["id"],
            source_id=r["source"],
            target_id=r["target"],
            rel_type=r["type"],
            confidence=r["confidence"],
            timestamp=r["timestamp"],
            doc_id=r["doc"],
            evidence_snippet=r["snippet"]
        )
        graph_adapter.add_edge(
            edge_id=r["id"],
            source_id=r["source"],
            target_id=r["target"],
            relation_type=r["type"],
            confidence=r["confidence"],
            timestamp=r["timestamp"],
            document_id=r["doc"],
            metadata={"snippet": r["snippet"]}
        )

    # 6. Seed Resolution Candidates
    for rc in scenario["resolution_candidates"]:
        db_service.insert_resolution_candidate(
            candidate_id=rc["id"],
            src_id=rc["source_id"],
            tgt_id=rc["target_id"],
            sim_score=rc["similarity"],
            reason=rc["reason"]
        )

    # 7. Seed Alerts
    for a in scenario["alerts"]:
        db_service.insert_alert(
            alert_id=a["id"],
            rule_name=a["rule_name"],
            severity=a["severity"],
            title=a["title"],
            description=a["description"],
            entity_ids=a["entity_ids"],
            evidence_doc_ids=a["evidence_document_ids"],
            confidence=a["confidence"],
            metadata=a["metadata"]
        )

    return {
        "status": "SUCCESS",
        "case_name": "Operation ShadowNet: The Dimapur-Kolkata Syndicate",
        "loaded_entities": len(scenario["entities"]),
        "loaded_documents": len(scenario["documents"]),
        "loaded_relationships": len(scenario["relationships"]),
        "loaded_alerts": len(scenario["alerts"])
    }

@router.post("/reset")
def reset_system():
    """Wipes all databases and graph memory."""
    db_service.clear_all_data()
    graph_adapter.clear()
    return {"status": "SUCCESS", "message": "System reset completed."}

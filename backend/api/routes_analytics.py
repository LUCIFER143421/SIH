from fastapi import APIRouter
from analytics.centrality import centrality_engine
from analytics.community import community_engine
from services.db_service import db_service
from graph.networkx_adapter import graph_adapter

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/centrality")
def get_centrality_ranking(top_k: int = 10):
    """Returns ranked list of influential and bridge entities."""
    return centrality_engine.get_influential_entities(top_k=top_k)

@router.get("/stats")
def get_network_statistics():
    """Returns top-level intelligence metrics for the dashboard."""
    entities = db_service.get_entities()
    relationships = db_service.get_relationships()
    documents = db_service.get_documents()
    alerts = db_service.get_alerts()
    comm_data = community_engine.detect_communities()

    return {
        "total_entities": len(entities),
        "total_relationships": len(relationships),
        "total_documents": len(documents),
        "total_alerts": len(alerts),
        "total_communities": comm_data["community_count"],
        "density": round(len(relationships) / max(len(entities) * (len(entities) - 1), 1), 4),
        "high_risk_entities_count": len([e for e in entities if e.get("risk_score", 0) > 0.75])
    }

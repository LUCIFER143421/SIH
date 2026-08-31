from typing import Optional
from fastapi import APIRouter, Query
from models.schemas import GraphDataResponse
from graph.networkx_adapter import graph_adapter
from analytics.centrality import centrality_engine
from analytics.community import community_engine

router = APIRouter(prefix="/api/graph", tags=["Graph"])

@router.get("/data", response_model=GraphDataResponse)
def get_graph(
    node_type: Optional[str] = Query(None, description="Filter by node type (PERSON, PHONE, VEHICLE, LOCATION, etc.)"),
    min_confidence: float = Query(0.0, description="Minimum edge confidence score"),
    date_from: Optional[str] = Query(None, description="Filter edges after this date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter edges before this date (YYYY-MM-DD)")
):
    """
    Returns nodes and edges enriched with centrality metrics and community IDs
    formatted specifically for visual graph rendering.
    """
    raw_data = graph_adapter.get_graph_data(node_type=node_type, min_confidence=min_confidence)
    
    # Calculate community assignments with safe fallback
    partition = {}
    community_count = 1
    try:
        comm_data = community_engine.detect_communities()
        partition = comm_data.get("partition", {})
        community_count = comm_data.get("community_count", 1)
    except Exception as e:
        print(f"[CRIMENET AI] Community detection fallback: {e}")

    # Calculate centralities with safe fallback
    bet = {}
    pr = {}
    deg = {}
    try:
        metrics = centrality_engine.compute_all_metrics()
        bet = metrics.get("betweenness", {})
        pr = metrics.get("pagerank", {})
        deg = metrics.get("degree", {})
    except Exception as e:
        print(f"[CRIMENET AI] Centrality metrics fallback: {e}")

    # Enrich nodes with graph metrics
    enriched_nodes = []
    for n in raw_data.get("nodes", []):
        nid = n["id"]
        enriched_nodes.append({
            "id": str(nid),
            "label": str(n.get("label", nid)),
            "type": str(n.get("type", "ENTITY")),
            "risk_score": float(n.get("risk_score", 0.0)),
            "community_id": int(partition.get(nid, 0)),
            "betweenness": float(round(bet.get(nid, 0.0), 4)),
            "pagerank": float(round(pr.get(nid, 0.0), 4)),
            "degree": float(round(deg.get(nid, 0.0), 4)),
            "metadata": n.get("metadata", {})
        })

    # Filter edges by date if specified
    filtered_edges = []
    for e in raw_data.get("edges", []):
        ts = e.get("timestamp")
        if date_from and ts and ts < date_from:
            continue
        if date_to and ts and ts > date_to:
            continue
        filtered_edges.append({
            "id": str(e.get("id")),
            "source": str(e.get("source")),
            "target": str(e.get("target")),
            "label": str(e.get("label", "LINK")),
            "confidence": float(e.get("confidence", 1.0)),
            "timestamp": e.get("timestamp"),
            "document_id": str(e.get("document_id", "")),
            "evidence_snippet": e.get("evidence_snippet", ""),
            "metadata": e.get("metadata", {})
        })

    return GraphDataResponse(
        nodes=enriched_nodes,
        edges=filtered_edges,
        total_nodes=len(enriched_nodes),
        total_edges=len(filtered_edges),
        communities_count=max(community_count, 1)
    )

@router.get("/subgraph/{entity_id}")
def get_entity_subgraph(entity_id: str, hops: int = 1):
    """Retrieves localized N-hop subgraph around a specific entity."""
    return graph_adapter.get_neighborhood(entity_id, hops=hops)

@router.get("/path")
def find_path(source_id: str, target_id: str):
    """Finds the shortest intelligence path between two entities."""
    return graph_adapter.find_shortest_path(source_id, target_id)

@router.get("/communities")
def get_communities():
    """Returns detected community clusters and modularity groupings."""
    return community_engine.detect_communities()

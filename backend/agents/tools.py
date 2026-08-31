from typing import Dict, Any, List, Optional
from services.db_service import db_service
from graph.networkx_adapter import graph_adapter
from analytics.centrality import centrality_engine
from analytics.community import community_engine
from analytics.anomaly_detector import anomaly_detector

class InvestigationTools:
    @staticmethod
    def search_entities(query: str, entity_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Search database and graph for entities matching the name or ID."""
        entities = db_service.search_entities_by_name(query)
        if entity_type:
            entities = [e for e in entities if e["entity_type"].upper() == entity_type.upper()]
        return entities

    @staticmethod
    def get_entity_profile(entity_id: str) -> Dict[str, Any]:
        """Fetch 360-degree profile, connections, and evidence for an entity."""
        entity = db_service.get_entity_by_id(entity_id)
        if not entity:
            return {"error": f"Entity '{entity_id}' not found."}
        
        rels = db_service.get_entity_relationships(entity_id)
        subgraph = graph_adapter.get_neighborhood(entity_id, hops=1)
        
        # Calculate centrality
        metrics = centrality_engine.compute_all_metrics()
        bet = metrics["betweenness"].get(entity_id, 0.0)
        pr = metrics["pagerank"].get(entity_id, 0.0)
        deg = metrics["degree"].get(entity_id, 0.0)

        return {
            "entity": entity,
            "degree": len(rels),
            "betweenness": round(bet, 4),
            "pagerank": round(pr, 4),
            "connections": rels,
            "connected_nodes": [n for n in subgraph["nodes"] if n["id"] != entity_id]
        }

    @staticmethod
    def find_relationships(entity_a: str, entity_b: str) -> List[Dict[str, Any]]:
        """Find direct or multi-hop connections between two entities."""
        # Check direct
        all_rels = db_service.get_relationships()
        direct = [
            r for r in all_rels
            if (r["source_entity_id"] == entity_a and r["target_entity_id"] == entity_b) or
               (r["source_entity_id"] == entity_b and r["target_entity_id"] == entity_a)
        ]
        return direct

    @staticmethod
    def find_shortest_path(source_id: str, target_id: str) -> Dict[str, Any]:
        """Calculate shortest connection path between two entities in the graph."""
        res = graph_adapter.find_shortest_path(source_id, target_id)
        if not res:
            return {"status": "NO_PATH_FOUND", "path_nodes": [], "path_edges": []}
        
        # Enrich path node names
        node_details = [db_service.get_entity_by_id(n) for n in res["path_nodes"]]
        return {
            "status": "PATH_FOUND",
            "hop_count": res["hop_count"],
            "path_nodes": [n for n in node_details if n],
            "path_edges": res["path_edges"]
        }

    @staticmethod
    def calculate_centrality(top_k: int = 5) -> List[Dict[str, Any]]:
        """Get the most influential / bridge entities in the network."""
        return centrality_engine.get_influential_entities(top_k=top_k)

    @staticmethod
    def detect_communities() -> Dict[str, Any]:
        """Detect sub-gangs and modular communities."""
        return community_engine.detect_communities()

    @staticmethod
    def detect_anomalies() -> List[Dict[str, Any]]:
        """Run all suspicious pattern detection algorithms."""
        return anomaly_detector.scan_all_anomalies()

    @staticmethod
    def retrieve_evidence(document_id: str) -> Dict[str, Any]:
        """Fetch raw source document content, case metadata, and extracted facts."""
        doc = db_service.get_document_by_id(document_id)
        if not doc:
            return {"error": f"Document '{document_id}' not found."}
        return doc

investigation_tools = InvestigationTools()

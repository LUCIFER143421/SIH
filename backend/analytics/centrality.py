import networkx as nx
from typing import Dict, Any, List
from graph.networkx_adapter import graph_adapter

class CentralityEngine:
    def compute_all_metrics(self) -> Dict[str, Any]:
        g = graph_adapter.undirected_g
        if len(g) == 0:
            return {"degree": {}, "betweenness": {}, "pagerank": {}, "closeness": {}, "bridges": []}

        # 1. Degree Centrality
        deg_centrality = nx.degree_centrality(g)
        
        # 2. Betweenness Centrality
        bet_centrality = nx.betweenness_centrality(g)
        
        # 3. PageRank
        try:
            pagerank = nx.pagerank(g, alpha=0.85)
        except Exception:
            pagerank = deg_centrality

        # 4. Closeness Centrality
        closeness = nx.closeness_centrality(g)

        # 5. Bridges
        bridges = list(nx.bridges(g)) if nx.is_connected(g) or len(g) > 1 else []

        return {
            "degree": deg_centrality,
            "betweenness": bet_centrality,
            "pagerank": pagerank,
            "closeness": closeness,
            "bridges": bridges
        }

    def get_influential_entities(self, top_k: int = 10) -> List[Dict[str, Any]]:
        metrics = self.compute_all_metrics()
        bet = metrics["betweenness"]
        pr = metrics["pagerank"]
        deg = metrics["degree"]

        nodes_scored = []
        for node_id in bet.keys():
            node_data = graph_adapter.g.nodes.get(node_id, {})
            # Composite influence formula (Normalized to 0-100)
            composite = (bet.get(node_id, 0) * 0.45 + pr.get(node_id, 0) * 0.35 + deg.get(node_id, 0) * 0.20) * 100
            
            nodes_scored.append({
                "id": node_id,
                "name": node_data.get("label", node_id),
                "type": node_data.get("node_type", "ENTITY"),
                "influence_score": round(min(composite * 2.5, 98.0), 1),  # Scaled for clear investigator readout
                "betweenness": round(bet.get(node_id, 0), 4),
                "pagerank": round(pr.get(node_id, 0), 4),
                "degree_centrality": round(deg.get(node_id, 0), 4),
                "connection_count": graph_adapter.g.degree(node_id),
                "role": node_data.get("metadata", {}).get("role", "Entity")
            })

        return sorted(nodes_scored, key=lambda x: x["influence_score"], reverse=True)[:top_k]

centrality_engine = CentralityEngine()

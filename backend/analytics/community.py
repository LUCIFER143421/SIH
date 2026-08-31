import networkx as nx
from typing import Dict, Any, List
from graph.networkx_adapter import graph_adapter

try:
    import community as community_louvain
    HAS_LOUVAIN = True
except ImportError:
    HAS_LOUVAIN = False

class CommunityEngine:
    def detect_communities(self) -> Dict[str, Any]:
        g = graph_adapter.undirected_g
        if len(g) == 0:
            return {"partition": {}, "communities": [], "modularity": 0.0, "community_count": 0}

        partition = {}
        if HAS_LOUVAIN:
            try:
                partition = community_louvain.best_partition(g)
            except Exception:
                partition = self._fallback_communities(g)
        else:
            partition = self._fallback_communities(g)

        # Group nodes by community ID
        grouped: Dict[int, List[Dict[str, Any]]] = {}
        for node_id, comm_id in partition.items():
            if comm_id not in grouped:
                grouped[comm_id] = []
            node_data = graph_adapter.g.nodes.get(node_id, {})
            grouped[comm_id].append({
                "id": node_id,
                "name": node_data.get("label", node_id),
                "type": node_data.get("node_type", "ENTITY")
            })

        communities_list = [
            {
                "community_id": cid,
                "label": f"Cluster #{cid + 1}",
                "size": len(members),
                "members": members
            }
            for cid, members in sorted(grouped.items(), key=lambda x: len(x[1]), reverse=True)
        ]

        return {
            "partition": partition,
            "communities": communities_list,
            "community_count": len(communities_list)
        }

    def _fallback_communities(self, g: nx.Graph) -> Dict[str, int]:
        partition = {}
        try:
            communities_gen = nx.algorithms.community.greedy_modularity_communities(g)
            for idx, comm in enumerate(communities_gen):
                for node in comm:
                    partition[node] = idx
        except Exception:
            for idx, comp in enumerate(nx.connected_components(g)):
                for node in comp:
                    partition[node] = idx
        return partition

community_engine = CommunityEngine()

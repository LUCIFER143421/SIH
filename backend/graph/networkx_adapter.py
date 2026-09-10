import networkx as nx
from typing import Dict, Any, List, Optional
from graph.graph_store import GraphStoreInterface
from services.db_service import db_service

class NetworkXGraphAdapter(GraphStoreInterface):
    def __init__(self):
        self.g = nx.MultiDiGraph()
        self.undirected_g = nx.Graph()

    def clear(self):
        self.g.clear()
        self.undirected_g.clear()

    @property
    def graph(self):
        return self.g

    def ensure_hydrated(self):
        """Auto-hydrates graph from database if in-memory graph is empty."""
        if len(self.g) == 0:
            self.rehydrate()

    def rehydrate(self, entities: Optional[List[Dict[str, Any]]] = None, relationships: Optional[List[Dict[str, Any]]] = None):
        """Completely rebuilds in-memory graph from database records or passed datasets."""
        self.clear()
        ents = entities if entities is not None else db_service.get_entities()
        for e in ents:
            self.add_node(
                node_id=e["id"],
                label=e.get("canonical_name") or e.get("name", e["id"]),
                node_type=e.get("entity_type") or e.get("type", "ENTITY"),
                metadata=e.get("metadata", {}),
                risk_score=float(e.get("risk_score", 0.0))
            )
        
        rels = relationships if relationships is not None else db_service.get_relationships()
        for r in rels:
            src = r.get("source_entity_id") or r.get("source")
            tgt = r.get("target_entity_id") or r.get("target")
            rel_type = r.get("relationship_type") or r.get("type", "CONNECTED_TO")
            conf = float(r.get("confidence", 1.0))
            ts = r.get("timestamp")
            doc = r.get("document_id") or r.get("doc", "")
            snip = r.get("evidence_snippet") or r.get("snippet", "")
            
            self.add_edge(
                r["id"],
                src,
                tgt,
                rel_type,
                conf,
                ts,
                doc,
                {"snippet": snip}
            )

    def add_node(self, node_id: str, label: str, node_type: str, metadata: Optional[Dict[str, Any]] = None, risk_score: Optional[float] = None):
        meta = metadata or {}
        score = float(risk_score) if risk_score is not None else float(meta.get("risk_score", 0.0))
        self.g.add_node(
            node_id,
            label=label,
            node_type=node_type,
            risk_score=score,
            metadata=meta
        )
        self.undirected_g.add_node(
            node_id,
            label=label,
            node_type=node_type,
            risk_score=score,
            metadata=meta
        )

    def add_edge(self, edge_id: str, source_id: str, target_id: str, relation_type: str,
                 confidence: float = 1.0, timestamp: Optional[str] = None,
                 document_id: str = "", metadata: Optional[Dict[str, Any]] = None):
        meta = metadata or {}
        self.g.add_edge(
            source_id,
            target_id,
            key=edge_id,
            id=edge_id,
            relation_type=relation_type,
            confidence=confidence,
            timestamp=timestamp,
            document_id=document_id,
            evidence_snippet=meta.get("snippet", ""),
            metadata=meta
        )
        self.undirected_g.add_edge(
            source_id,
            target_id,
            relation_type=relation_type,
            document_id=document_id
        )

    def get_graph_data(self, node_type: Optional[str] = None, min_confidence: float = 0.0) -> Dict[str, Any]:
        self.ensure_hydrated()
        nodes_list = []
        for n, data in self.g.nodes(data=True):
            if node_type and data.get("node_type", "").upper() != node_type.upper():
                continue
            deg = self.g.degree(n)
            nodes_list.append({
                "id": n,
                "label": data.get("label", n),
                "type": data.get("node_type", "ENTITY"),
                "risk_score": data.get("risk_score", 0.0),
                "degree": deg,
                "metadata": data.get("metadata", {})
            })

        edges_list = []
        for u, v, k, data in self.g.edges(keys=True, data=True):
            conf = data.get("confidence", 1.0)
            if conf < min_confidence:
                continue
            edges_list.append({
                "id": data.get("id", f"{u}_{v}_{k}"),
                "source": u,
                "target": v,
                "label": data.get("relation_type", "CONNECTED_TO"),
                "confidence": conf,
                "timestamp": data.get("timestamp"),
                "document_id": data.get("document_id", ""),
                "evidence_snippet": data.get("evidence_snippet", ""),
                "metadata": data.get("metadata", {})
            })

        return {
            "nodes": nodes_list,
            "edges": edges_list,
            "total_nodes": len(nodes_list),
            "total_edges": len(edges_list)
        }

    def get_neighborhood(self, node_id: str, hops: int = 1) -> Dict[str, Any]:
        self.ensure_hydrated()
        if node_id not in self.g:
            return {"nodes": [], "edges": [], "total_nodes": 0, "total_edges": 0}

        subgraph_nodes = {node_id}
        current_frontier = {node_id}

        for _ in range(hops):
            next_frontier = set()
            for n in current_frontier:
                neighbors = set(self.g.predecessors(n)).union(set(self.g.successors(n)))
                next_frontier.update(neighbors)
            subgraph_nodes.update(next_frontier)
            current_frontier = next_frontier

        sub_g = self.g.subgraph(subgraph_nodes)
        
        nodes_list = []
        for n in sub_g.nodes():
            data = self.g.nodes[n]
            nodes_list.append({
                "id": n,
                "label": data.get("label", n),
                "type": data.get("node_type", "ENTITY"),
                "risk_score": data.get("risk_score", 0.0),
                "degree": self.g.degree(n),
                "metadata": data.get("metadata", {})
            })

        edges_list = []
        for u, v, k, data in sub_g.edges(keys=True, data=True):
            edges_list.append({
                "id": data.get("id", f"{u}_{v}_{k}"),
                "source": u,
                "target": v,
                "label": data.get("relation_type", "CONNECTED_TO"),
                "confidence": data.get("confidence", 1.0),
                "timestamp": data.get("timestamp"),
                "document_id": data.get("document_id", ""),
                "evidence_snippet": data.get("evidence_snippet", ""),
                "metadata": data.get("metadata", {})
            })

        return {
            "nodes": nodes_list,
            "edges": edges_list,
            "total_nodes": len(nodes_list),
            "total_edges": len(edges_list)
        }

    def find_shortest_path(self, source_id: str, target_id: str) -> List[Dict[str, Any]]:
        self.ensure_hydrated()
        if source_id not in self.undirected_g or target_id not in self.undirected_g:
            return []

        try:
            path_nodes = nx.shortest_path(self.undirected_g, source=source_id, target=target_id)
            path_edges = []
            for i in range(len(path_nodes) - 1):
                u = path_nodes[i]
                v = path_nodes[i+1]
                edge_found = None
                if self.g.has_edge(u, v):
                    for k, d in self.g[u][v].items():
                        edge_found = {"source": u, "target": v, "id": d.get("id"), "label": d.get("relation_type"), "doc": d.get("document_id")}
                        break
                elif self.g.has_edge(v, u):
                    for k, d in self.g[v][u].items():
                        edge_found = {"source": v, "target": u, "id": d.get("id"), "label": d.get("relation_type"), "doc": d.get("document_id")}
                        break
                if edge_found:
                    path_edges.append(edge_found)

            return {
                "path_nodes": path_nodes,
                "path_edges": path_edges,
                "hop_count": len(path_nodes) - 1
            }
        except nx.NetworkXNoPath:
            return []

graph_adapter = NetworkXGraphAdapter()

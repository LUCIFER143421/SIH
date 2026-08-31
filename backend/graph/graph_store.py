from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class GraphStoreInterface(ABC):
    @abstractmethod
    def clear(self):
        pass

    @abstractmethod
    def add_node(self, node_id: str, label: str, node_type: str, metadata: Optional[Dict[str, Any]] = None):
        pass

    @abstractmethod
    def add_edge(self, edge_id: str, source_id: str, target_id: str, relation_type: str,
                 confidence: float = 1.0, timestamp: Optional[str] = None,
                 document_id: str = "", metadata: Optional[Dict[str, Any]] = None):
        pass

    @abstractmethod
    def get_graph_data(self, node_type: Optional[str] = None, min_confidence: float = 0.0) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_neighborhood(self, node_id: str, hops: int = 1) -> Dict[str, Any]:
        pass

    @abstractmethod
    def find_shortest_path(self, source_id: str, target_id: str) -> List[Dict[str, Any]]:
        pass

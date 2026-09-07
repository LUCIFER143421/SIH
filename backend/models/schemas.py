from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime

# --- Entity Models ---
class EntityBase(BaseModel):
    id: str
    canonical_name: str
    entity_type: str = Field(..., description="PERSON, PHONE, VEHICLE, LOCATION, ORGANIZATION, ACCOUNT, EVENT")
    risk_score: float = 0.0
    metadata: Dict[str, Any] = Field(default_factory=dict)

class EntityCreate(BaseModel):
    canonical_name: str
    entity_type: str
    risk_score: float = 0.0
    metadata: Dict[str, Any] = Field(default_factory=dict)

class EntityResponse(EntityBase):
    created_at: Optional[str] = None
    degree: Optional[Union[int, float]] = 0
    betweenness: Optional[float] = 0.0
    pagerank: Optional[float] = 0.0
    community_id: Optional[int] = None
    aliases: List[str] = Field(default_factory=list)

# --- Relationship Models ---
class RelationshipBase(BaseModel):
    id: str
    source_entity_id: str
    target_entity_id: str
    relationship_type: str = Field(..., description="CALLS, MEETS, ASSOCIATED_WITH, OWNS, USES, VISITED, TRANSFERRED_MONEY_TO, WORKS_FOR, SEEN_WITH, COMMUNICATED_WITH")
    confidence: float = 1.0
    timestamp: Optional[str] = None
    document_id: str
    evidence_snippet: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class RelationshipCreate(BaseModel):
    source_entity_id: str
    target_entity_id: str
    relationship_type: str
    confidence: float = 1.0
    timestamp: Optional[str] = None
    document_id: str
    evidence_snippet: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

# --- Document Models ---
class DocumentBase(BaseModel):
    id: str
    title: str
    source_type: str = Field(..., description="FIR, CDR, BANK, SURVEILLANCE, INTEL")
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[str] = None

class DocumentCreate(BaseModel):
    title: str
    source_type: str
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

class DocumentIngestResponse(BaseModel):
    document_id: str
    title: str
    extracted_entities_count: int
    extracted_relationships_count: int
    entities: List[Dict[str, Any]]
    relationships: List[Dict[str, Any]]

# --- Entity Resolution Models ---
class ResolutionCandidate(BaseModel):
    id: str
    source_entity_id: str
    source_name: str
    source_type: str
    target_entity_id: str
    target_name: str
    target_type: str
    similarity_score: float
    status: str = "PENDING"
    reason: str
    created_at: Optional[str] = None

class MergeDecisionRequest(BaseModel):
    candidate_id: str
    primary_entity_id: str
    secondary_entity_id: str
    action: str = Field(..., description="MERGE or DISMISS")

# --- Suspicious Pattern / Alert Models ---
class Alert(BaseModel):
    id: str
    rule_name: str
    severity: str = Field(..., description="HIGH, MEDIUM, LOW")
    title: str
    description: str
    entity_ids: List[str]
    evidence_document_ids: List[str]
    confidence: float
    status: str = "UNRESOLVED"
    source: Optional[str] = "case_file"
    created_at: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class AlertVerifyRequest(BaseModel):
    alert_id: str
    status: str = Field(..., description="VERIFIED, DISMISSED, UNDER_REVIEW")
    notes: Optional[str] = None

# --- Graph Visualization Models ---
class GraphNode(BaseModel):
    id: str
    label: str
    type: str
    risk_score: float = 0.0
    community_id: Optional[int] = 0
    betweenness: float = 0.0
    pagerank: float = 0.0
    degree: Union[int, float] = 0
    metadata: Dict[str, Any] = Field(default_factory=dict)

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    confidence: float = 1.0
    timestamp: Optional[str] = None
    document_id: str = ""
    evidence_snippet: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class GraphDataResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    total_nodes: int
    total_edges: int
    communities_count: int

# --- Investigation Copilot Models ---
class CopilotQueryRequest(BaseModel):
    query: str
    context_entity_id: Optional[str] = None
    conversation_history: List[Dict[str, str]] = Field(default_factory=list)

class ToolTrace(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    output_summary: str

class CopilotQueryResponse(BaseModel):
    query: str
    answer: str
    confidence: float
    tool_traces: List[ToolTrace]
    highlight_node_ids: List[str] = Field(default_factory=list)
    highlight_edge_ids: List[str] = Field(default_factory=list)
    evidence_citations: List[Dict[str, Any]] = Field(default_factory=list)
    suggested_followups: List[str] = Field(default_factory=list)

# --- Entity 360 Dossier Model ---
class EntityDossier(BaseModel):
    entity: EntityResponse
    direct_connections: List[Dict[str, Any]]
    associated_locations: List[Dict[str, Any]]
    associated_phones: List[Dict[str, Any]]
    associated_vehicles: List[Dict[str, Any]]
    associated_accounts: List[Dict[str, Any]]
    relevant_alerts: List[Alert]
    evidence_records: List[Dict[str, Any]]
    timeline_events: List[Dict[str, Any]]

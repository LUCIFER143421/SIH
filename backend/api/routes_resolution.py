from fastapi import APIRouter, HTTPException
from models.schemas import MergeDecisionRequest
from services.db_service import db_service
from nlp.resolution_engine import resolution_engine
from graph.networkx_adapter import graph_adapter

router = APIRouter(prefix="/api/resolution", tags=["Entity Resolution"])

@router.get("/candidates")
def get_candidates():
    """Returns potential duplicate entity pairs with similarity scores and rationale."""
    db_candidates = db_service.get_resolution_candidates(status="PENDING")
    if not db_candidates:
        # Run dynamic scanner on current entities
        entities = db_service.get_entities()
        return resolution_engine.find_alias_candidates(entities)
    return db_candidates

@router.post("/merge")
def merge_entities(req: MergeDecisionRequest):
    """Merges two entity IDs non-destructively, transferring relationships and logging alias."""
    primary = req.primary_entity_id or req.canonical_id
    secondary = req.secondary_entity_id or req.alias_id
    if not primary or not secondary:
        raise HTTPException(status_code=422, detail="Both primary (canonical) and secondary (alias) entity IDs are required for merge.")

    db_service.merge_entities(
        primary_id=primary,
        secondary_id=secondary,
        candidate_id=req.candidate_id
    )
    # Immediately synchronize the in-memory graph
    graph_adapter.rehydrate()
    return {
        "status": "MERGED",
        "primary_entity_id": primary,
        "merged_secondary_id": secondary
    }

@router.post("/dismiss")
def dismiss_candidate(candidate_id: str):
    """Dismisses an entity resolution suggestion."""
    db_service.dismiss_candidate(candidate_id)
    return {"status": "DISMISSED", "candidate_id": candidate_id}

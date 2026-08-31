from fastapi import APIRouter, HTTPException
from models.schemas import MergeDecisionRequest
from services.db_service import db_service
from nlp.resolution_engine import resolution_engine

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
    db_service.merge_entities(
        primary_id=req.primary_entity_id,
        secondary_id=req.secondary_entity_id,
        candidate_id=req.candidate_id
    )
    return {
        "status": "MERGED",
        "primary_entity_id": req.primary_entity_id,
        "merged_secondary_id": req.secondary_entity_id
    }

@router.post("/dismiss")
def dismiss_candidate(candidate_id: str):
    """Dismisses an entity resolution suggestion."""
    db_service.dismiss_candidate(candidate_id)
    return {"status": "DISMISSED", "candidate_id": candidate_id}

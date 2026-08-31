from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from models.schemas import EntityResponse, EntityDossier
from services.db_service import db_service
from agents.tools import investigation_tools
from config import SYSTEM_INFO

router = APIRouter(prefix="/api", tags=["Entities & Evidence"])

@router.get("/system-info")
def get_system_info():
    """Returns local AI runtime transparency details."""
    return SYSTEM_INFO

@router.get("/entities")
def list_entities(type: Optional[str] = None, search: Optional[str] = None):
    """Lists entities with optional filtering and search."""
    if search:
        return db_service.search_entities_by_name(search)
    return db_service.get_entities(entity_type=type)

@router.get("/entities/{entity_id}", response_model=EntityResponse)
def get_entity(entity_id: str):
    """Fetches details for a single entity."""
    ent = db_service.get_entity_by_id(entity_id)
    if not ent:
        raise HTTPException(status_code=404, detail=f"Entity '{entity_id}' not found.")
    return ent

@router.get("/entities/{entity_id}/dossier")
def get_entity_dossier(entity_id: str):
    """Returns a full 360-degree intelligence dossier for an entity."""
    ent = db_service.get_entity_by_id(entity_id)
    if not ent:
        raise HTTPException(status_code=404, detail=f"Entity '{entity_id}' not found.")

    rels = db_service.get_entity_relationships(entity_id)
    
    # Categorize linked assets
    locations = []
    phones = []
    vehicles = []
    accounts = []
    direct_associates = []

    for r in rels:
        other_id = r["target_entity_id"] if r["source_entity_id"] == entity_id else r["source_entity_id"]
        other_name = r["target_name"] if r["source_entity_id"] == entity_id else r["source_name"]
        other_type = r["target_type"] if r["source_entity_id"] == entity_id else r["source_type"]

        item = {"id": other_id, "name": other_name, "relationship": r["relationship_type"], "doc_id": r["document_id"]}
        if other_type == "LOCATION":
            locations.append(item)
        elif other_type == "PHONE":
            phones.append(item)
        elif other_type == "VEHICLE":
            vehicles.append(item)
        elif other_type == "ACCOUNT":
            accounts.append(item)
        elif other_type == "PERSON":
            direct_associates.append(item)

    # Relevant alerts
    all_alerts = db_service.get_alerts()
    matched_alerts = [a for a in all_alerts if entity_id in a.get("entity_ids", [])]

    # Collect source documents
    doc_ids = {r["document_id"] for r in rels if r.get("document_id")}
    evidence_docs = [db_service.get_document_by_id(did) for did in doc_ids if did]

    return {
        "entity": ent,
        "direct_associates": direct_associates,
        "associated_locations": locations,
        "associated_phones": phones,
        "associated_vehicles": vehicles,
        "associated_accounts": accounts,
        "relevant_alerts": matched_alerts,
        "evidence_records": [d for d in evidence_docs if d],
        "relationships_count": len(rels)
    }

@router.get("/documents")
def list_documents():
    """Lists all ingested intelligence documents."""
    return db_service.get_documents()

@router.get("/documents/{document_id}")
def get_document(document_id: str):
    """Retrieves document text and case metadata."""
    doc = db_service.get_document_by_id(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document '{document_id}' not found.")
    return doc

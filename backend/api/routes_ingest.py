import uuid
from fastapi import APIRouter, HTTPException, UploadFile, File
from models.schemas import DocumentCreate, DocumentIngestResponse
from services.db_service import db_service
from nlp.entity_extractor import entity_extractor
from nlp.relation_extractor import relation_extractor
from graph.networkx_adapter import graph_adapter

router = APIRouter(prefix="/api/ingest", tags=["Ingestion"])

MAX_UPLOAD_SIZE = 2 * 1024 * 1024  # 2MB maximum upload size

@router.post("/document", response_model=DocumentIngestResponse)
def ingest_document(doc_in: DocumentCreate):
    """
    Ingests raw unstructured text (FIR, Intel, Surveillance, etc.),
    runs NER entity extraction and relationship discovery,
    and indexes everything into SQLite and Knowledge Graph.
    """
    # Validate input: reject empty or whitespace-only documents
    if not doc_in.content or not doc_in.content.strip():
        raise HTTPException(
            status_code=422,
            detail="Document content cannot be empty or whitespace only."
        )
    if not doc_in.title or not doc_in.title.strip():
        raise HTTPException(
            status_code=422,
            detail="Document title cannot be empty or whitespace only."
        )

    clean_content = doc_in.content.strip()
    clean_title = doc_in.title.strip()
    doc_id = f"DOC_{doc_in.source_type.upper()}_{uuid.uuid4().hex[:6]}"
    
    # 1. Save Document
    db_service.insert_document(
        doc_id=doc_id,
        title=clean_title,
        source_type=doc_in.source_type.upper(),
        content=clean_content,
        metadata=doc_in.metadata
    )

    # 2. Extract Entities
    extracted_entities = entity_extractor.extract(clean_content)
    
    # Insert or link entities
    entity_map = {}
    for ent in extracted_entities:
        # Check if already exists in DB
        existing = db_service.search_entities_by_name(ent["canonical_name"])
        matched_id = None
        for ex in existing:
            if ex["canonical_name"].lower() == ent["canonical_name"].lower():
                matched_id = ex["id"]
                break
        
        if not matched_id:
            matched_id = ent["id"]
            db_service.insert_entity(
                entity_id=matched_id,
                canonical_name=ent["canonical_name"],
                entity_type=ent["entity_type"],
                risk_score=0.5
            )
            graph_adapter.add_node(
                node_id=matched_id,
                label=ent["canonical_name"],
                node_type=ent["entity_type"]
            )
        
        entity_map[ent["canonical_name"]] = matched_id

    # 3. Extract Relationships
    extracted_rels = relation_extractor.extract_relations_from_doc(clean_content, extracted_entities, doc_id)
    for r in extracted_rels:
        src_id = entity_map.get(r["source_entity_name"])
        tgt_id = entity_map.get(r["target_entity_name"])
        if src_id and tgt_id and src_id != tgt_id:
            db_service.insert_relationship(
                rel_id=r["id"],
                source_id=src_id,
                target_id=tgt_id,
                rel_type=r["relationship_type"],
                confidence=r["confidence"],
                doc_id=doc_id,
                evidence_snippet=r["evidence_snippet"]
            )
            graph_adapter.add_edge(
                edge_id=r["id"],
                source_id=src_id,
                target_id=tgt_id,
                relation_type=r["relationship_type"],
                confidence=r["confidence"],
                document_id=doc_id,
                metadata={"snippet": r["evidence_snippet"]}
            )

    return DocumentIngestResponse(
        document_id=doc_id,
        title=clean_title,
        extracted_entities_count=len(extracted_entities),
        extracted_relationships_count=len(extracted_rels),
        entities=extracted_entities,
        relationships=extracted_rels
    )

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Uploads and ingests plain text / json files with size and content validation."""
    content = await file.read()
    
    # Check file size limit (413 Payload Too Large)
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File size ({len(content)} bytes) exceeds the maximum allowed limit of {MAX_UPLOAD_SIZE // (1024 * 1024)}MB."
        )

    text = content.decode("utf-8", errors="ignore")
    if not text or not text.strip():
        raise HTTPException(
            status_code=422,
            detail="Uploaded file is empty or contains only whitespace."
        )

    doc_in = DocumentCreate(
        title=file.filename or "Uploaded Document",
        source_type="INTEL",
        content=text.strip()
    )
    return ingest_document(doc_in)

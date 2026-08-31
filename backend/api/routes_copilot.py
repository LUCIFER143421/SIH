from fastapi import APIRouter
from models.schemas import CopilotQueryRequest, CopilotQueryResponse
from agents.orchestrator import investigation_orchestrator

router = APIRouter(prefix="/api/copilot", tags=["Copilot"])

@router.post("/query", response_model=CopilotQueryResponse)
async def query_copilot(req: CopilotQueryRequest):
    """
    Agentic Investigation Copilot endpoint.
    Orchestrates verified analytical tools and returns grounded intelligence with citations.
    """
    res = await investigation_orchestrator.process_query(
        query=req.query,
        context_entity_id=req.context_entity_id,
        conversation_history=req.conversation_history
    )
    return CopilotQueryResponse(**res)

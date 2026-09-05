import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes_demo import router as demo_router, load_demo_case
from api.routes_ingest import router as ingest_router
from api.routes_graph import router as graph_router
from api.routes_analytics import router as analytics_router
from api.routes_alerts import router as alerts_router
from api.routes_resolution import router as resolution_router
from api.routes_copilot import router as copilot_router
from api.routes_entities import router as entities_router
from services.db_service import db_service
from graph.networkx_adapter import graph_adapter

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup initialization
    existing_entities = db_service.get_entities()
    if not existing_entities:
        print("[CRIMENET AI] Initializing database with demo investigation scenario...")
        load_demo_case()
    else:
        print(f"[CRIMENET AI] Hydrating knowledge graph with {len(existing_entities)} existing entities...")
        graph_adapter.ensure_hydrated()
    print(f"[CRIMENET AI] Knowledge Graph ready with {len(graph_adapter.g.nodes)} nodes and {len(graph_adapter.g.edges)} edges.")
    
    yield
    # Shutdown logic (if any cleanup needed)

app = FastAPI(
    title="CRIMENET AI - Criminal Network Analysis & Intelligence Support",
    description="AI-Powered Criminal Network Intelligence System for SIH 2026 Problem Statement 26189",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(demo_router)
app.include_router(ingest_router)
app.include_router(graph_router)
app.include_router(analytics_router)
app.include_router(alerts_router)
app.include_router(resolution_router)
app.include_router(copilot_router)
app.include_router(entities_router)

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "system": "CRIMENET AI",
        "problem_statement": "SIH 2026 PS 26189",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = os.getenv("DB_PATH", str(DATA_DIR / "crimenet.db"))
GRAPH_BACKEND = os.getenv("GRAPH_BACKEND", "networkx")  # networkx | neo4j
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

# LLM Configuration
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama")  # ollama | deterministic
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")

# AI System Transparency Info
SYSTEM_INFO = {
    "system_name": "CRIMENET AI",
    "tagline": "AI-Powered Criminal Network Intelligence & Investigation Support",
    "version": "1.0.0-SIH2026",
    "model_name": OLLAMA_MODEL,
    "llm_provider": LLM_PROVIDER,
    "inference_mode": "Local / On-Device (Zero Cloud Transmission)",
    "graph_engine": "In-Memory NetworkX MultiGraph + Cypher Abstraction",
    "disclaimer": "CRIMENET AI is an analytical decision-support system for law enforcement research. All synthetic data and analytical outputs require human investigator verification."
}

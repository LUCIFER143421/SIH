import os
import sys
from pathlib import Path

# Ensure backend root is in sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from services.db_service import db_service
from graph.networkx_adapter import graph_adapter

if __name__ == "__main__":
    db_service.clear_all_data()
    graph_adapter.clear()
    print("[CRIMENET AI] Database and in-memory graph successfully cleared to 0 records.")

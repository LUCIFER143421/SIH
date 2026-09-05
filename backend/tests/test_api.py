import pytest
from fastapi.testclient import TestClient
from main import app
from services.db_service import db_service
from graph.networkx_adapter import graph_adapter

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_demo_data():
    """Ensure clean demo scenario loaded before tests."""
    client.post("/api/demo/load")

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"
    assert "CRIMENET AI" in data["system"]

def test_demo_load_endpoint():
    response = client.post("/api/demo/load")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["loaded_entities"] >= 15
    assert data["loaded_relationships"] >= 20

def test_ingest_document_valid():
    payload = {
        "title": "FIR #999/2026 - Test Intercept",
        "source_type": "FIR",
        "content": "On 20 March 2026, Inspector Rajiv Mehta arrested Rahul Sharma using phone +91-98765-43210 near Dimapur Market."
    }
    response = client.post("/api/ingest/document", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "document_id" in data
    assert data["extracted_entities_count"] >= 2
    assert "relationships" in data

def test_ingest_document_invalid_empty_content():
    payload = {
        "title": "Empty Document",
        "source_type": "FIR",
        "content": "   "
    }
    response = client.post("/api/ingest/document", json=payload)
    assert response.status_code == 422
    assert "content cannot be empty" in response.json()["detail"].lower()

def test_ingest_document_invalid_empty_title():
    payload = {
        "title": "",
        "source_type": "FIR",
        "content": "Valid content text here."
    }
    response = client.post("/api/ingest/document", json=payload)
    assert response.status_code == 422

def test_graph_data_endpoint():
    response = client.get("/api/graph/data")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert data["total_nodes"] >= 15
    assert data["total_edges"] >= 20
    assert len(data["nodes"]) == data["total_nodes"]

    # Verify node structure
    first_node = data["nodes"][0]
    assert "id" in first_node
    assert "label" in first_node
    assert "type" in first_node
    assert "betweenness" in first_node
    assert "community_id" in first_node

def test_analytics_centrality_endpoint():
    response = client.get("/api/analytics/centrality?top_k=5")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 5
    assert len(data) >= 1
    assert "influence_score" in data[0]
    assert "betweenness" in data[0]

def test_analytics_disruption_simulation():
    payload = {"target_entity_id": "PER_001"}
    response = client.post("/api/analytics/disruption-simulation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "fragmentation_percent" in data
    assert "remaining_bridges" in data
    assert data["fragmentation_percent"] > 0

def test_analytics_hypothesis_testing():
    payload = {"hypothesis_id": "vikram_coordination"}
    response = client.post("/api/analytics/test-hypothesis", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "assessment" in data
    assert "supporting_signals" in data
    assert data["confidence_percent"] > 50

def test_analytics_hidden_intermediaries():
    response = client.get("/api/analytics/hidden-intermediaries")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "gap_type" in data[0]

def test_analytics_next_actions():
    response = client.get("/api/analytics/next-actions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "action_category" in data[0]

def test_analytics_financial_flow():
    response = client.get("/api/analytics/financial-flow")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert "primary_layering_flow" in data

def test_alerts_endpoint():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    first_alert = data[0]
    assert "rule_name" in first_alert
    assert "severity" in first_alert
    assert "entity_ids" in first_alert
    assert "confidence" in first_alert

def test_entity_dossier_endpoint():
    response = client.get("/api/entities/PER_001/dossier")
    assert response.status_code == 200
    data = response.json()
    assert "entity" in data
    assert data["entity"]["canonical_name"] == "Vikram Malhotra"
    assert "direct_associates" in data
    assert "associated_locations" in data
    assert "evidence_records" in data

def test_copilot_query_endpoint():
    payload = {
        "query": "Why is Vikram Malhotra considered an important bridge entity?"
    }
    response = client.post("/api/copilot/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "confidence" in data
    assert "tool_traces" in data
    assert "highlight_node_ids" in data
    assert len(data["tool_traces"]) >= 1

def test_system_info_endpoint():
    response = client.get("/api/system-info")
    assert response.status_code == 200
    data = response.json()
    assert data["system_name"] == "CRIMENET AI"
    assert "disclaimer" in data

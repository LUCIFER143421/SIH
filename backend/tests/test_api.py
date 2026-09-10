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

def test_analytics_hypothesis_dynamic_three_distinct_cases():
    """
    Tests that /api/analytics/test-hypothesis dynamically parses questions:
    1. Real connected entities -> High confidence & verified link
    2. Real but unconnected entities -> Low confidence & NO SIGNIFICANT LINK
    3. Unknown non-existent entity -> UNVERIFIABLE / ENTITY NOT IN CASE FILE
    """
    # 1. Connected pair (Rajesh Thapa and Vikram Malhotra)
    q1 = {"custom_statement": "Is Rajesh Thapa working for Vikram Malhotra?"}
    res1 = client.post("/api/analytics/test-hypothesis", json=q1).json()
    assert res1["assessment"] in ["STRONG CORROBORATED CONNECTION", "INDIRECT MULTI-HOP CONNECTION"]
    assert res1["confidence_percent"] >= 70
    assert len(res1["supporting_signals"]) >= 1

    # 2. Real but unconnected pair (Sunil Mehta and Inspector S. K. Roy)
    q2 = {"custom_statement": "Is Sunil Mehta coordinating with Inspector S. K. Roy?"}
    res2 = client.post("/api/analytics/test-hypothesis", json=q2).json()
    assert res2["assessment"] == "NO SIGNIFICANT LINK DETECTED"
    assert res2["confidence_percent"] <= 30
    assert len(res2["supporting_signals"]) == 0
    assert len(res2["contradicting_signals"]) >= 1

    # 3. Unknown entity (Johnathan Walker)
    q3 = {"custom_statement": "Is Johnathan Walker financing the operation?"}
    res3 = client.post("/api/analytics/test-hypothesis", json=q3).json()
    assert res3["assessment"] == "UNVERIFIABLE / ENTITY NOT IN CASE FILE"
    assert res3["confidence_percent"] <= 20
    assert len(res3["supporting_signals"]) == 0

    # Ensure all three responses are meaningfully distinct
    assert res1["assessment"] != res2["assessment"]
    assert res2["assessment"] != res3["assessment"]
    assert res1["confidence_percent"] != res2["confidence_percent"]

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

    # Verify both seeded case_file and live_detection alerts are present
    sources = [a.get("source") for a in data]
    assert "case_file" in sources
    assert "live_detection" in sources

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

def test_copilot_out_of_domain_query():
    payload = {
        "query": "what is the capital of France?"
    }
    response = client.post("/api/copilot/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "OUT OF DOMAIN" in data["answer"] or "not have information" in data["answer"].lower()
    assert data["confidence"] == 0.0
    assert "NETWORK ANALYTICS SUMMARY" not in data["answer"]

def test_system_info_endpoint():
    response = client.get("/api/system-info")
    assert response.status_code == 200
    data = response.json()
    assert data["system_name"] == "CRIMENET AI"
    assert "disclaimer" in data

def test_alerts_verification_status_persistence():
    # 1. Fetch current alerts
    res = client.get("/api/alerts")
    assert res.status_code == 200
    alerts = res.json()
    assert len(alerts) >= 1
    target_alert_id = alerts[0]["id"]

    # 2. Update status to VERIFIED
    verify_res = client.patch(f"/api/alerts/{target_alert_id}/status?status=VERIFIED")
    assert verify_res.status_code == 200
    assert verify_res.json()["status"] == "VERIFIED"

    # 3. Verify that fetching alerts reflects VERIFIED
    res_after = client.get("/api/alerts")
    updated_alert = next((a for a in res_after.json() if a["id"] == target_alert_id), None)
    assert updated_alert is not None
    assert updated_alert["status"] == "VERIFIED"

    # 4. Update status to DISMISSED
    dismiss_res = client.patch(f"/api/alerts/{target_alert_id}/status?status=DISMISSED")
    assert dismiss_res.status_code == 200
    assert dismiss_res.json()["status"] == "DISMISSED"

    res_after_dismiss = client.get("/api/alerts")
    dismissed_alert = next((a for a in res_after_dismiss.json() if a["id"] == target_alert_id), None)
    assert dismissed_alert is not None
    assert dismissed_alert["status"] == "DISMISSED"

def test_entity_resolution_merge_api():
    # Ingest two similar records or use existing candidates
    res = client.get("/api/resolution/candidates")
    assert res.status_code == 200
    candidates = res.json()
    if candidates:
        first_pair = candidates[0]
        merge_payload = {
            "canonical_id": first_pair.get("source_entity_id") or first_pair.get("entity_a_id") or first_pair.get("primary_entity_id"),
            "alias_id": first_pair.get("target_entity_id") or first_pair.get("entity_b_id") or first_pair.get("secondary_entity_id"),
            "candidate_id": first_pair.get("id")
        }
        merge_res = client.post("/api/resolution/merge", json=merge_payload)
        assert merge_res.status_code == 200
        assert merge_res.json()["status"] == "MERGED"


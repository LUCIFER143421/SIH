import pytest
from services.synthetic_generator import generate_synthetic_investigation
from nlp.entity_extractor import entity_extractor
from nlp.relation_extractor import relation_extractor
from nlp.resolution_engine import resolution_engine
from graph.networkx_adapter import graph_adapter
from analytics.centrality import centrality_engine
from analytics.community import community_engine
from analytics.anomaly_detector import anomaly_detector
from agents.tools import investigation_tools

def test_synthetic_data_generation():
    data = generate_synthetic_investigation()
    assert len(data["entities"]) >= 15
    assert len(data["documents"]) >= 5
    assert len(data["relationships"]) >= 25
    assert len(data["alerts"]) >= 3

def test_nlp_entity_extractor():
    text = "Rahul Sharma contacted Amit Kumar using phone 9876543210 on 14 August near Dimapur Market. Vehicle NL-01-AB-1234 was observed."
    entities = entity_extractor.extract(text)
    names = [e["canonical_name"] for e in entities]
    types = [e["entity_type"] for e in entities]
    
    assert "Amit Kumar" in names or "Rahul Sharma" in names
    assert "PHONE" in types
    assert "VEHICLE" in types
    assert "LOCATION" in types

def test_relation_extractor():
    text = "Amit Kumar used vehicle AS-01-XY-9821 near Dimapur Market Warehouse."
    entities = entity_extractor.extract(text)
    rels = relation_extractor.extract_relations_from_doc(text, entities, "DOC_TEST_01")
    assert len(rels) >= 1

def test_graph_and_analytics():
    data = generate_synthetic_investigation()
    graph_adapter.clear()
    
    for e in data["entities"]:
        graph_adapter.add_node(e["id"], e["name"], e["type"], e["metadata"])
    for r in data["relationships"]:
        graph_adapter.add_edge(r["id"], r["source"], r["target"], r["type"], r["confidence"], r["timestamp"], r["doc"])

    metrics = centrality_engine.compute_all_metrics()
    assert len(metrics["betweenness"]) > 0

    top_inf = centrality_engine.get_influential_entities(top_k=3)
    assert len(top_inf) == 3
    assert top_inf[0]["influence_score"] > 0

    comms = community_engine.detect_communities()
    assert comms["community_count"] >= 2

def test_shortest_path():
    path_res = investigation_tools.find_shortest_path("PER_001", "ORG_001")
    assert path_res["status"] == "PATH_FOUND"
    assert len(path_res["path_nodes"]) >= 2

def test_anomaly_detection():
    anomalies = anomaly_detector.scan_all_anomalies()
    assert len(anomalies) >= 2

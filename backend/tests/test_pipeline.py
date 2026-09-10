import pytest
from services.synthetic_generator import generate_synthetic_investigation
from services.db_service import db_service
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

def test_nlp_entity_extractor_standard():
    text = "Rahul Sharma contacted Amit Kumar using phone 9876543210 on 14 August near Dimapur Market. Vehicle NL-01-AB-1234 was observed."
    entities = entity_extractor.extract(text)
    names = [e["canonical_name"] for e in entities]
    types = [e["entity_type"] for e in entities]
    
    assert any("Amit Kumar" in n or "Rahul Sharma" in n for n in names)
    assert "PHONE" in types
    assert "VEHICLE" in types
    assert "LOCATION" in types

def test_nlp_entity_extractor_novel_ungazetted_entities():
    """
    Asserts that completely novel person, organization, and location names
    NOT part of any predefined list are correctly extracted via generalizable NER.
    """
    novel_text = (
        "Inspector Aarav Deshmukh arrested suspect Priya Nambiar near Oberoi Business Plaza. "
        "The suspect transferred funds through Zenith Logistics Pvt Ltd using account HDFC-CA-8877665544 "
        "and drove vehicle MH-02-ZZ-9999 to Mumbai Port Terminal."
    )
    entities = entity_extractor.extract(novel_text)
    names = [e["canonical_name"] for e in entities]
    types = [e["entity_type"] for e in entities]

    # Novel Persons
    assert any("Aarav Deshmukh" in n or "Priya Nambiar" in n for n in names)
    # Novel Organization
    assert any("Zenith Logistics" in n for n in names)
    assert "ORGANIZATION" in types
    # Novel Location
    assert any("Oberoi Business Plaza" in n or "Mumbai Port Terminal" in n for n in names)
    assert "LOCATION" in types
    # Structured identifiers
    assert "ACCOUNT" in types
    assert "VEHICLE" in types

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

def test_anomaly_detection_with_real_patterns():
    # Setup full scenario
    data = generate_synthetic_investigation()
    db_service.clear_all_data()
    graph_adapter.clear()
    
    for e in data["entities"]:
        db_service.insert_entity(e["id"], e["name"], e["type"], e["risk_score"], e["metadata"])
        graph_adapter.add_node(e["id"], e["name"], e["type"], e["metadata"])
    for r in data["relationships"]:
        db_service.insert_relationship(r["id"], r["source"], r["target"], r["type"], r["confidence"], r["timestamp"], r["doc"], r["snippet"])
        graph_adapter.add_edge(r["id"], r["source"], r["target"], r["type"], r["confidence"], r["timestamp"], r["doc"])

    anomalies = anomaly_detector.scan_all_anomalies()
    rule_names = [a["rule_name"] for a in anomalies]
    
    assert "CROSS_COMMUNITY_BRIDGE" in rule_names
    assert "SHARED_INFRASTRUCTURE" in rule_names
    assert "UNUSUAL_TRANSACTION_STRUCTURING" in rule_names
    assert "COMMUNICATION_BURST" in rule_names

def test_anomaly_detection_negative_case_no_false_positives():
    """
    Constructs a clean graph WITHOUT bursts or layering or shared assets
    and asserts that false alerts are NOT generated.
    """
    db_service.clear_all_data()
    graph_adapter.clear()

    # Add 2 disconnected nodes with 1 regular call
    db_service.insert_entity("PER_CLEAN_1", "Officer A", "PERSON")
    db_service.insert_entity("PER_CLEAN_2", "Officer B", "PERSON")
    graph_adapter.add_node("PER_CLEAN_1", "Officer A", "PERSON")
    graph_adapter.add_node("PER_CLEAN_2", "Officer B", "PERSON")

    db_service.insert_relationship(
        "REL_CLEAN_1", "PER_CLEAN_1", "PER_CLEAN_2", "CALLS",
        confidence=0.9, timestamp="2026-01-01", doc_id="DOC_CLEAN"
    )
    graph_adapter.add_edge(
        "REL_CLEAN_1", "PER_CLEAN_1", "PER_CLEAN_2", "CALLS",
        confidence=0.9, timestamp="2026-01-01", document_id="DOC_CLEAN"
    )

    anomalies = anomaly_detector.scan_all_anomalies()
    rule_names = [a["rule_name"] for a in anomalies]

    # No structuring or bridge alerts should fire
    assert "UNUSUAL_TRANSACTION_STRUCTURING" not in rule_names
    assert "CROSS_COMMUNITY_BRIDGE" not in rule_names
    assert "SHARED_INFRASTRUCTURE" not in rule_names

def test_nlp_sentence_extraction_isolation_regression():
    """
    Regression test ensuring sentence boundaries and entity types are strictly isolated:
    1. 'Amit Kumar met Rajesh Thapa at Guwahati Transit Yard.'
       -> 'Amit Kumar' (PERSON), 'Rajesh Thapa' (PERSON), 'Guwahati Transit Yard' (LOCATION).
       -> No greedy entity merging 'Amit Kumar met Rajesh Thapa'.
    2. 'Inspector S. K. Roy met Tariq Ahmed.'
       -> 'Inspector S. K. Roy' or 'S. K. Roy' (PERSON), 'Tariq Ahmed' (PERSON).
    3. 'Apex Logistics Pvt Ltd' -> ORGANIZATION.
    4. 'Amit Kumar used +91-98111-22334 and vehicle AS-01-XY-9821.'
       -> PHONE and VEHICLE properly extracted.
    """
    text1 = "Amit Kumar met Rajesh Thapa at Guwahati Transit Yard."
    ents1 = entity_extractor.extract(text1)
    names1 = [e["canonical_name"] for e in ents1]
    types1 = {e["canonical_name"]: e["entity_type"] for e in ents1}
    
    assert "Amit Kumar" in names1
    assert "Rajesh Thapa" in names1
    assert "Guwahati Transit Yard" in names1
    assert types1["Amit Kumar"] == "PERSON"
    assert types1["Rajesh Thapa"] == "PERSON"
    assert types1["Guwahati Transit Yard"] == "LOCATION"
    # Ensure no sentence-eating entity
    assert not any("met" in n for n in names1)

    text2 = "Inspector S. K. Roy met Tariq Ahmed."
    ents2 = entity_extractor.extract(text2)
    names2 = [e["canonical_name"] for e in ents2]
    assert any("S. K. Roy" in n or "Roy" in n for n in names2)
    assert any("Tariq Ahmed" in n for n in names2)

    text3 = "Consignment manifest referencing Apex Logistics Pvt Ltd."
    ents3 = entity_extractor.extract(text3)
    names3 = [e["canonical_name"] for e in ents3]
    types3 = {e["canonical_name"]: e["entity_type"] for e in ents3}
    assert "Apex Logistics Pvt Ltd" in names3
    assert types3["Apex Logistics Pvt Ltd"] == "ORGANIZATION"

    text4 = "Amit Kumar used +91-98111-22334 and vehicle AS-01-XY-9821."
    ents4 = entity_extractor.extract(text4)
    types4 = [e["entity_type"] for e in ents4]
    assert "PHONE" in types4
    assert "VEHICLE" in types4

def test_graph_node_risk_score_preservation():
    """
    Asserts that nodes added to the NetworkX graph retain their explicit risk_score attribute.
    """
    graph_adapter.clear()
    graph_adapter.add_node("TEST_PER_01", "Test Suspect", "PERSON", metadata={"risk_score": 85})
    
    node_data = graph_adapter.graph.nodes["TEST_PER_01"]
    assert node_data.get("risk_score") == 85

def test_entity_merge_graph_synchronization():
    """
    Asserts that merging an alias into a canonical entity updates the SQLite DB
    and rehydrates the in-memory graph so edges are re-routed.
    """
    db_service.clear_all_data()
    graph_adapter.clear()

    # Create canonical suspect and alias entity
    db_service.insert_entity("PER_CANONICAL", "Vikram Malhotra", "PERSON", risk_score=92)
    db_service.insert_entity("PER_ALIAS", "Vicky M.", "PERSON", risk_score=70)
    db_service.insert_entity("PER_ASSOCIATE", "Rajesh Thapa", "PERSON", risk_score=80)

    # Add initial edge to the alias
    db_service.insert_relationship("REL_01", "PER_ALIAS", "PER_ASSOCIATE", "CALLS", confidence=0.9, timestamp="2026-02-01")

    # Initial graph hydration
    graph_adapter.rehydrate(db_service.get_all_entities(), db_service.get_all_relationships())
    assert graph_adapter.graph.has_node("PER_ALIAS")
    assert graph_adapter.graph.has_node("PER_CANONICAL")

    # Perform DB merge
    db_service.merge_entities("PER_CANONICAL", "PER_ALIAS")
    # Rehydrate graph
    graph_adapter.rehydrate(db_service.get_all_entities(), db_service.get_all_relationships())

    # Alias node should now be removed from graph, and edge should connect canonical to associate
    assert not graph_adapter.graph.has_node("PER_ALIAS")
    assert graph_adapter.graph.has_node("PER_CANONICAL")
    assert graph_adapter.graph.has_edge("PER_CANONICAL", "PER_ASSOCIATE")


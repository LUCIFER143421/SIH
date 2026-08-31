import json
import uuid
from typing import Dict, Any, List
from datetime import datetime, timedelta

def generate_synthetic_investigation() -> Dict[str, Any]:
    """
    Generates a realistic, highly interconnected synthetic dataset
    representing 'Operation ShadowNet: The Dimapur-Kolkata Contraband & Hawala Network'.
    All names, numbers, accounts, and locations are strictly fictional.
    """
    
    # 1. ENTITIES
    entities = [
        # --- Persons: Core Ring ---
        {"id": "PER_001", "name": "Vikram Malhotra", "type": "PERSON", "risk_score": 0.94, "metadata": {"role": "Syndicate Coordinator / Kingpin", "aliases": ["Vicky M.", "V. Malhotra", "Malhotra Saab"]}},
        {"id": "PER_002", "name": "Rajesh Thapa", "type": "PERSON", "risk_score": 0.82, "metadata": {"role": "Logistics & Transport Head", "aliases": ["Rocky Thapa", "R. Thapa"]}},
        {"id": "PER_003", "name": "Amit Kumar", "type": "PERSON", "risk_score": 0.74, "metadata": {"role": "Logistics Driver & Smuggler", "aliases": ["Amit K."]}},
        {"id": "PER_004", "name": "Suresh Agarwal", "type": "PERSON", "risk_score": 0.88, "metadata": {"role": "Hawala Operator & Bullion Trader", "aliases": ["Suresh Babu", "Agarwal Ji"]}},
        {"id": "PER_005", "name": "Neha Sen", "type": "PERSON", "risk_score": 0.78, "metadata": {"role": "Front Company Director & Accountant", "aliases": ["N. Sen"]}},
        {"id": "PER_006", "name": "Mohit Verma", "type": "PERSON", "risk_score": 0.70, "metadata": {"role": "Burner SIM Vendor & Comms Tech", "aliases": ["Mohit V."]}},
        {"id": "PER_007", "name": "Tariq Ahmed", "type": "PERSON", "risk_score": 0.68, "metadata": {"role": "Hawala Courier & Drop Master", "aliases": ["Tariq Bhai"]}},
        {"id": "PER_008", "name": "Pradeep Joshi", "type": "PERSON", "risk_score": 0.60, "metadata": {"role": "Informant / Intermediary", "aliases": ["Munna Joshi"]}},
        {"id": "PER_009", "name": "Inspector S. K. Roy", "type": "PERSON", "risk_score": 0.65, "metadata": {"role": "Customs Port Official (Flagged)", "aliases": ["S. K. Roy"]}},
        {"id": "PER_010", "name": "Karan Singhania", "type": "PERSON", "risk_score": 0.55, "metadata": {"role": "Warehouse Supervisor", "aliases": ["Karan S."]}},
        {"id": "PER_011", "name": "R. Sharma", "type": "PERSON", "risk_score": 0.45, "metadata": {"role": "Transport Associate", "aliases": ["Rahul Sharma"]}},
        {"id": "PER_012", "name": "Sunil Mehta", "type": "PERSON", "risk_score": 0.50, "metadata": {"role": "Finance Clerk", "aliases": ["S. Mehta"]}},
        {"id": "PER_013", "name": "Deepak Chawla", "type": "PERSON", "risk_score": 0.42, "metadata": {"role": "Fleet Driver", "aliases": ["Deepak C."]}},
        {"id": "PER_014", "name": "Imran Khan", "type": "PERSON", "risk_score": 0.58, "metadata": {"role": "Cross-border Courier", "aliases": ["Imran Bhai"]}},
        {"id": "PER_015", "name": "Bikash Roy", "type": "PERSON", "risk_score": 0.48, "metadata": {"role": "Freight Handler", "aliases": ["B. Roy"]}},
        
        # --- Phone Numbers ---
        {"id": "PHO_001", "name": "+91-98765-43210", "type": "PHONE", "risk_score": 0.90, "metadata": {"carrier": "Airtel", "note": "Primary Burner Phone (Vikram)"}},
        {"id": "PHO_002", "name": "+91-98111-22334", "type": "PHONE", "risk_score": 0.80, "metadata": {"carrier": "Jio", "note": "Logistics Dispatch SIM (Rajesh)"}},
        {"id": "PHO_003", "name": "+91-98222-33445", "type": "PHONE", "risk_score": 0.75, "metadata": {"carrier": "Vodafone", "note": "Courier SIM (Amit)"}},
        {"id": "PHO_004", "name": "+91-98333-44556", "type": "PHONE", "risk_score": 0.85, "metadata": {"carrier": "Airtel", "note": "Hawala Desk SIM (Suresh)"}},
        {"id": "PHO_005", "name": "+91-98444-55667", "type": "PHONE", "risk_score": 0.70, "metadata": {"carrier": "Jio", "note": "Corporate Line (Neha Sen)"}},
        {"id": "PHO_006", "name": "+91-98555-66778", "type": "PHONE", "risk_score": 0.85, "metadata": {"carrier": "BSNL", "note": "Shared SIM Hardware"}},

        # --- Vehicles ---
        {"id": "VEH_001", "name": "NL-01-AB-1234", "type": "VEHICLE", "risk_score": 0.85, "metadata": {"make": "Toyota Fortuner (Black)", "owner": "Vikram Malhotra"}},
        {"id": "VEH_002", "name": "AS-01-XY-9821", "type": "VEHICLE", "risk_score": 0.80, "metadata": {"make": "Tata 407 Cargo Truck", "owner": "Rajesh Thapa"}},
        {"id": "VEH_003", "name": "WB-02-CD-5678", "type": "VEHICLE", "risk_score": 0.65, "metadata": {"make": "Mahindra Bolero", "owner": "Apex Logistics"}},
        {"id": "VEH_004", "name": "DL-08-MN-4321", "type": "VEHICLE", "risk_score": 0.60, "metadata": {"make": "Hyundai Creta", "owner": "Mohit Verma"}},

        # --- Locations ---
        {"id": "LOC_001", "name": "Dimapur Market Warehouse", "type": "LOCATION", "risk_score": 0.88, "metadata": {"city": "Dimapur, Nagaland", "category": "Contraband Stockpile"}},
        {"id": "LOC_002", "name": "Guwahati Transit Yard", "type": "LOCATION", "risk_score": 0.75, "metadata": {"city": "Guwahati, Assam", "category": "Logistics Hub"}},
        {"id": "LOC_003", "name": "Park Street Plaza Office", "type": "LOCATION", "risk_score": 0.80, "metadata": {"city": "Kolkata, WB", "category": "Hawala Front Office"}},
        {"id": "LOC_004", "name": "Karol Bagh Tech Arcade", "type": "LOCATION", "risk_score": 0.65, "metadata": {"city": "New Delhi", "category": "Burner Hardware Store"}},
        {"id": "LOC_005", "name": "Haldia Port Terminal 4", "type": "LOCATION", "risk_score": 0.70, "metadata": {"city": "Haldia, WB", "category": "Container Port"}},
        {"id": "LOC_006", "name": "Patna Safehouse Flat 3B", "type": "LOCATION", "risk_score": 0.72, "metadata": {"city": "Patna, Bihar", "category": "Cash Storage"}},

        # --- Organizations ---
        {"id": "ORG_001", "name": "Apex Logistics Pvt Ltd", "type": "ORGANIZATION", "risk_score": 0.90, "metadata": {"reg_no": "U60200WB2021PTC2401", "role": "Front Transport Company"}},
        {"id": "ORG_002", "name": "Horizon Gold Trading Co", "type": "ORGANIZATION", "risk_score": 0.85, "metadata": {"reg_no": "U51909WB2020PTC1982", "role": "Shell Bullion Importer"}},
        {"id": "ORG_003", "name": "Eastern Cargo Movers", "type": "ORGANIZATION", "risk_score": 0.60, "metadata": {"reg_no": "U63090AS2019PTC1123", "role": "Regional Carrier"}},
        {"id": "ORG_004", "name": "Metro Telecom Solutions", "type": "ORGANIZATION", "risk_score": 0.65, "metadata": {"reg_no": "U72900DL2022PTC4402", "role": "SIM Reseller Entity"}},

        # --- Accounts ---
        {"id": "ACC_001", "name": "HDFC-CA-9988221100", "type": "ACCOUNT", "risk_score": 0.88, "metadata": {"bank": "HDFC Bank", "holder": "Apex Logistics Pvt Ltd"}},
        {"id": "ACC_002", "name": "AXIS-SB-4455667788", "type": "ACCOUNT", "risk_score": 0.82, "metadata": {"bank": "Axis Bank", "holder": "Vikram Malhotra"}},
        {"id": "ACC_003", "name": "ICICI-CA-1122334455", "type": "ACCOUNT", "risk_score": 0.75, "metadata": {"bank": "ICICI Bank", "holder": "Horizon Gold Trading"}},
        {"id": "ACC_004", "name": "SBI-SB-7788990011", "type": "ACCOUNT", "risk_score": 0.60, "metadata": {"bank": "State Bank of India", "holder": "Tariq Ahmed"}}
    ]

    # 2. DOCUMENTS (FIRs, Intelligence Memos, Surveillance, Bank Logs, CDRs)
    documents = [
        {
            "id": "DOC_FIR_001",
            "title": "FIR #102/2026 - Dimapur PS: Contraband Interception",
            "source_type": "FIR",
            "content": "On 14 January 2026, Dimapur Police intercepted a Tata cargo truck registered AS-01-XY-9821 near Dimapur Market Warehouse. The driver identified as Amit Kumar stated he received dispatch orders from Rajesh Thapa. A black Toyota Fortuner NL-01-AB-1234 registered to Vikram Malhotra was observed escorting the vehicle. Phone number 9876543210 was repeatedly dialed during the transit.",
            "metadata": {"date": "2026-01-14", "station": "Dimapur PS", "case_officer": "SI T. Ao"}
        },
        {
            "id": "DOC_INTEL_002",
            "title": "Special Intelligence Memo #44: Hawala Corridor Kolkata",
            "source_type": "INTEL",
            "content": "Confidential source confirms Suresh Agarwal operating Hawala desk from Park Street Plaza Office, Kolkata. Suresh Agarwal has been transferring illicit funds to Apex Logistics Pvt Ltd directed by Neha Sen. Accounts HDFC-CA-9988221100 and AXIS-SB-4455667788 utilized for rapid layering transactions totaling over Rs 1.5 Crores.",
            "metadata": {"date": "2026-01-28", "agency": "Directorate of Revenue Intelligence"}
        },
        {
            "id": "DOC_SURV_003",
            "title": "Surveillance Log #19: Haldia Port Meeting",
            "source_type": "SURVEILLANCE",
            "content": "On 10 February 2026, Inspector S. K. Roy was observed meeting Tariq Ahmed and Rajesh Thapa at Haldia Port Terminal 4. Vehicle WB-02-CD-5678 owned by Apex Logistics was parked at the jetty. Tariq Ahmed delivered a sealed briefcase to Inspector S. K. Roy before departing.",
            "metadata": {"date": "2026-02-10", "team": "Field Surveillance Unit C"}
        },
        {
            "id": "DOC_CDR_004",
            "title": "CDR Intercept Analysis: Burner Phone Coordination",
            "source_type": "CDR",
            "content": "Analysis of CDR records from 12 Feb to 16 Feb shows intensive burst communication. Phone +91-98765-43210 (Vikram Malhotra) made 42 calls in 48 hours to +91-98111-22334 (Rajesh Thapa), +91-98333-44556 (Suresh Agarwal), and +91-98222-33445 (Amit Kumar). Also shared tower location at Karol Bagh Tech Arcade with Mohit Verma.",
            "metadata": {"date": "2026-02-16", "carrier": "Multi-Carrier CDR Dump"}
        },
        {
            "id": "DOC_BANK_005",
            "title": "Financial Intelligence Unit Suspicious Transaction Report (STR #882)",
            "source_type": "BANK",
            "content": "Account HDFC-CA-9988221100 (Apex Logistics Pvt Ltd) received 14 structured deposits of Rs 49,000 each followed by an immediate RTGS transfer of Rs 15,00,000 to AXIS-SB-4455667788 (Vikram Malhotra). Authorized signatory Neha Sen approved the transaction.",
            "metadata": {"date": "2026-02-22", "reporting_entity": "HDFC AML Unit"}
        },
        {
            "id": "DOC_FIR_006",
            "title": "FIR #214/2026 - Kolkata Cyber Cell: Counterfeit SIM Racket",
            "source_type": "FIR",
            "content": "Raids at Karol Bagh Tech Arcade and Patna Safehouse Flat 3B uncovered over 300 pre-activated SIM cards registered under fictitious names by Mohit Verma through Metro Telecom Solutions. Phone +91-98555-66778 was identified as a shared GSM gateway device used concurrently by Tariq Ahmed, Rajesh Thapa, and Vikram Malhotra.",
            "metadata": {"date": "2026-03-02", "station": "Cyber Cell HQ"}
        },
        {
            "id": "DOC_SURV_007",
            "title": "Surveillance Log #33: Guwahati-Patna Cash Transit",
            "source_type": "SURVEILLANCE",
            "content": "On 08 March 2026, Amit Kumar and Tariq Ahmed were sighted together at Guwahati Transit Yard loading cargo onto Mahindra Bolero WB-02-CD-5678. The vehicle subsequently traveled towards Patna Safehouse Flat 3B.",
            "metadata": {"date": "2026-03-08", "team": "Special Operations Group"}
        },
        {
            "id": "DOC_INTEL_008",
            "title": "Intel Assessment: Bridge Node Analysis on Vikram Malhotra",
            "source_type": "INTEL",
            "content": "Target Vikram Malhotra (aliases Vicky M., V. Malhotra) acts as the pivotal bridge connecting the North-East logistics wing (Rajesh Thapa, Amit Kumar) with the Kolkata Hawala syndicate (Suresh Agarwal, Neha Sen) and Delhi tech enabler Mohit Verma. Disruption of Vikram Malhotra will sever cross-community logistics and financial conduits.",
            "metadata": {"date": "2026-03-12", "agency": "Central Intelligence Wing"}
        }
    ]

    # 3. RELATIONSHIPS / EDGES
    relationships = [
        # Logistics Ring
        {"id": "REL_001", "source": "PER_001", "target": "PER_002", "type": "ASSOCIATED_WITH", "confidence": 0.95, "timestamp": "2026-01-10", "doc": "DOC_FIR_001", "snippet": "Vikram Malhotra coordinates logistics operations with Rajesh Thapa."},
        {"id": "REL_002", "source": "PER_002", "target": "PER_003", "type": "WORKS_FOR", "confidence": 0.92, "timestamp": "2026-01-14", "doc": "DOC_FIR_001", "snippet": "Amit Kumar received dispatch orders directly from Rajesh Thapa."},
        {"id": "REL_003", "source": "PER_001", "target": "VEH_001", "type": "OWNS", "confidence": 0.98, "timestamp": "2026-01-14", "doc": "DOC_FIR_001", "snippet": "Toyota Fortuner NL-01-AB-1234 registered to Vikram Malhotra."},
        {"id": "REL_004", "source": "PER_002", "target": "VEH_002", "type": "USES", "confidence": 0.90, "timestamp": "2026-01-14", "doc": "DOC_FIR_001", "snippet": "Tata cargo truck AS-01-XY-9821 operated by Rajesh Thapa."},
        {"id": "REL_005", "source": "PER_003", "target": "LOC_001", "type": "VISITED", "confidence": 0.95, "timestamp": "2026-01-14", "doc": "DOC_FIR_001", "snippet": "Amit Kumar intercepted near Dimapur Market Warehouse."},
        {"id": "REL_006", "source": "PER_001", "target": "PHO_001", "type": "USES", "confidence": 0.94, "timestamp": "2026-01-14", "doc": "DOC_FIR_001", "snippet": "Phone +91-98765-43210 used by Vikram Malhotra."},
        {"id": "REL_007", "source": "PER_002", "target": "PHO_002", "type": "USES", "confidence": 0.89, "timestamp": "2026-01-15", "doc": "DOC_CDR_004", "snippet": "Phone +91-98111-22334 registered to Rajesh Thapa."},
        {"id": "REL_008", "source": "PER_003", "target": "PHO_003", "type": "USES", "confidence": 0.88, "timestamp": "2026-01-15", "doc": "DOC_CDR_004", "snippet": "Phone +91-98222-33445 utilized by Amit Kumar."},
        {"id": "REL_009", "source": "PER_002", "target": "LOC_002", "type": "LOCATED_AT", "confidence": 0.85, "timestamp": "2026-02-01", "doc": "DOC_SURV_007", "snippet": "Rajesh Thapa maintains frequent dispatch at Guwahati Transit Yard."},

        # Hawala / Finance Ring
        {"id": "REL_010", "source": "PER_001", "target": "PER_004", "type": "COMMUNICATED_WITH", "confidence": 0.91, "timestamp": "2026-01-20", "doc": "DOC_INTEL_002", "snippet": "Direct communications between Vikram Malhotra and Suresh Agarwal."},
        {"id": "REL_011", "source": "PER_004", "target": "LOC_003", "type": "LOCATED_AT", "confidence": 0.92, "timestamp": "2026-01-28", "doc": "DOC_INTEL_002", "snippet": "Suresh Agarwal operating from Park Street Plaza Office, Kolkata."},
        {"id": "REL_012", "source": "PER_004", "target": "ORG_001", "type": "TRANSFERRED_MONEY_TO", "confidence": 0.94, "timestamp": "2026-01-28", "doc": "DOC_INTEL_002", "snippet": "Suresh Agarwal transfers hawala funds to Apex Logistics Pvt Ltd."},
        {"id": "REL_013", "source": "PER_005", "target": "ORG_001", "type": "WORKS_FOR", "confidence": 0.99, "timestamp": "2026-01-28", "doc": "DOC_INTEL_002", "snippet": "Neha Sen is the Director & authorized signatory for Apex Logistics."},
        {"id": "REL_014", "source": "ORG_001", "target": "ACC_001", "type": "OWNS", "confidence": 0.99, "timestamp": "2026-01-28", "doc": "DOC_INTEL_002", "snippet": "Apex Logistics operates HDFC Account HDFC-CA-9988221100."},
        {"id": "REL_015", "source": "PER_001", "target": "ACC_002", "type": "OWNS", "confidence": 0.98, "timestamp": "2026-02-22", "doc": "DOC_BANK_005", "snippet": "Vikram Malhotra holds Axis Bank Account AXIS-SB-4455667788."},
        {"id": "REL_016", "source": "ACC_001", "target": "ACC_002", "type": "TRANSFERRED_MONEY_TO", "confidence": 0.99, "timestamp": "2026-02-22", "doc": "DOC_BANK_005", "snippet": "RTGS transfer of Rs 15,00,000 from Apex Logistics to Vikram Malhotra."},
        {"id": "REL_017", "source": "PER_004", "target": "ORG_002", "type": "ASSOCIATED_WITH", "confidence": 0.88, "timestamp": "2026-02-05", "doc": "DOC_INTEL_002", "snippet": "Suresh Agarwal controls Horizon Gold Trading Co shell entity."},
        {"id": "REL_018", "source": "ORG_002", "target": "ACC_003", "type": "OWNS", "confidence": 0.95, "timestamp": "2026-02-05", "doc": "DOC_INTEL_002", "snippet": "Horizon Gold Trading maintains ICICI-CA-1122334455."},

        # Port & Customs Infiltration
        {"id": "REL_019", "source": "PER_009", "target": "LOC_005", "type": "LOCATED_AT", "confidence": 0.96, "timestamp": "2026-02-10", "doc": "DOC_SURV_003", "snippet": "Inspector S. K. Roy stationed at Haldia Port Terminal 4."},
        {"id": "REL_020", "source": "PER_007", "target": "PER_009", "type": "MEETS", "confidence": 0.94, "timestamp": "2026-02-10", "doc": "DOC_SURV_003", "snippet": "Tariq Ahmed met Inspector S. K. Roy and delivered sealed briefcase."},
        {"id": "REL_021", "source": "PER_002", "target": "PER_009", "type": "SEEN_WITH", "confidence": 0.88, "timestamp": "2026-02-10", "doc": "DOC_SURV_003", "snippet": "Rajesh Thapa observed alongside Inspector Roy at Haldia jetty."},
        {"id": "REL_022", "source": "ORG_001", "target": "VEH_003", "type": "OWNS", "confidence": 0.95, "timestamp": "2026-02-10", "doc": "DOC_SURV_003", "snippet": "Apex Logistics owns Mahindra Bolero WB-02-CD-5678."},
        {"id": "REL_023", "source": "PER_007", "target": "VEH_003", "type": "USES", "confidence": 0.90, "timestamp": "2026-02-10", "doc": "DOC_SURV_003", "snippet": "Tariq Ahmed traveled in Bolero WB-02-CD-5678 to Haldia Port."},

        # Cyber / Burner SIM Ring & Shared Infra
        {"id": "REL_024", "source": "PER_006", "target": "LOC_004", "type": "LOCATED_AT", "confidence": 0.92, "timestamp": "2026-02-16", "doc": "DOC_CDR_004", "snippet": "Mohit Verma operates Karol Bagh Tech Arcade tech shop."},
        {"id": "REL_025", "source": "PER_006", "target": "ORG_004", "type": "WORKS_FOR", "confidence": 0.90, "timestamp": "2026-03-02", "doc": "DOC_FIR_006", "snippet": "Mohit Verma ran SIM distribution through Metro Telecom Solutions."},
        {"id": "REL_026", "source": "PER_001", "target": "PER_006", "type": "COMMUNICATED_WITH", "confidence": 0.87, "timestamp": "2026-02-15", "doc": "DOC_CDR_004", "snippet": "Tower coincidence and calls between Vikram Malhotra and Mohit Verma."},
        {"id": "REL_027", "source": "PER_001", "target": "PHO_006", "type": "USES", "confidence": 0.89, "timestamp": "2026-03-02", "doc": "DOC_FIR_006", "snippet": "Shared SIM gateway +91-98555-66778 used by Vikram Malhotra."},
        {"id": "REL_028", "source": "PER_002", "target": "PHO_006", "type": "USES", "confidence": 0.89, "timestamp": "2026-03-02", "doc": "DOC_FIR_006", "snippet": "Shared SIM gateway +91-98555-66778 used by Rajesh Thapa."},
        {"id": "REL_029", "source": "PER_007", "target": "PHO_006", "type": "USES", "confidence": 0.89, "timestamp": "2026-03-02", "doc": "DOC_FIR_006", "snippet": "Shared SIM gateway +91-98555-66778 used by Tariq Ahmed."},

        # Cross-transit Connections & Informants
        {"id": "REL_030", "source": "PER_003", "target": "PER_007", "type": "SEEN_WITH", "confidence": 0.92, "timestamp": "2026-03-08", "doc": "DOC_SURV_007", "snippet": "Amit Kumar and Tariq Ahmed sighted loading cargo at Guwahati."},
        {"id": "REL_031", "source": "PER_007", "target": "LOC_006", "type": "VISITED", "confidence": 0.90, "timestamp": "2026-03-08", "doc": "DOC_SURV_007", "snippet": "Tariq Ahmed traveled to Patna Safehouse Flat 3B."},
        {"id": "REL_032", "source": "PER_008", "target": "PER_001", "type": "ASSOCIATED_WITH", "confidence": 0.72, "timestamp": "2026-02-18", "doc": "DOC_INTEL_008", "snippet": "Pradeep Joshi provides occasional intel tips to Vikram Malhotra."},
        {"id": "REL_033", "source": "PER_008", "target": "PER_002", "type": "COMMUNICATED_WITH", "confidence": 0.75, "timestamp": "2026-02-20", "doc": "DOC_INTEL_008", "snippet": "Calls logged between Pradeep Joshi and Rajesh Thapa."},
        {"id": "REL_034", "source": "PER_010", "target": "LOC_001", "type": "WORKS_FOR", "confidence": 0.85, "timestamp": "2026-01-14", "doc": "DOC_FIR_001", "snippet": "Karan Singhania oversees warehouse staff at Dimapur Market."},
        {"id": "REL_035", "source": "PER_010", "target": "PER_002", "type": "ASSOCIATED_WITH", "confidence": 0.81, "timestamp": "2026-01-14", "doc": "DOC_FIR_001", "snippet": "Karan Singhania reports stock movements to Rajesh Thapa."},
        {"id": "REL_036", "source": "PER_011", "target": "ORG_003", "type": "WORKS_FOR", "confidence": 0.78, "timestamp": "2026-01-18", "doc": "DOC_FIR_001", "snippet": "R. Sharma works as freight coordinator for Eastern Cargo Movers."},
        {"id": "REL_037", "source": "PER_011", "target": "PER_002", "type": "COMMUNICATED_WITH", "confidence": 0.80, "timestamp": "2026-01-20", "doc": "DOC_FIR_001", "snippet": "R. Sharma contacted Rajesh Thapa regarding consignment clearances."}
    ]

    # 4. RESOLUTION CANDIDATES (Aliases to detect & resolve)
    resolution_candidates = [
        {
            "id": "RES_001",
            "source_id": "PER_011",
            "target_id": "PER_001",
            "similarity": 0.75,
            "reason": "Name phonetic similarity ('R. Sharma' vs 'Rahul Sharma' / associate link to Vikram Malhotra)"
        }
    ]

    # 5. PRE-COMPILED EXPLAINABLE ALERTS (Suspicious Patterns)
    alerts = [
        {
            "id": "ALT_001",
            "rule_name": "CROSS_COMMUNITY_BRIDGE",
            "severity": "HIGH",
            "title": "Critical Cross-Community Bridge Entity Detected",
            "description": "Entity Vikram Malhotra (PER_001) exhibits top betweenness centrality (0.48) and connects 3 isolated clusters: North-East Logistics, Kolkata Hawala, and Delhi Cyber SIM Ring.",
            "entity_ids": ["PER_001", "PER_002", "PER_004", "PER_006"],
            "evidence_document_ids": ["DOC_FIR_001", "DOC_INTEL_002", "DOC_INTEL_008"],
            "confidence": 0.94,
            "metadata": {"betweenness_score": 0.48, "bridged_communities": [1, 2, 3]}
        },
        {
            "id": "ALT_002",
            "rule_name": "COMMUNICATION_BURST",
            "severity": "HIGH",
            "title": "Anomalous Call Frequency Surge Prior to Contraband Transit",
            "description": "Call volume between Vikram Malhotra, Rajesh Thapa, and Suresh Agarwal spiked by +340% between Feb 12 and Feb 16, coinciding with shipment clearance at Haldia Port.",
            "entity_ids": ["PER_001", "PER_002", "PER_004", "PHO_001"],
            "evidence_document_ids": ["DOC_CDR_004", "DOC_SURV_003"],
            "confidence": 0.91,
            "metadata": {"spike_percent": 340, "window": "2026-02-12 to 2026-02-16"}
        },
        {
            "id": "ALT_003",
            "rule_name": "UNUSUAL_TRANSACTION_STRUCTURING",
            "severity": "HIGH",
            "title": "Rapid Hawala Layering & Fund Structuring (Smurfing)",
            "description": "Multiple sub-threshold deposits into Apex Logistics account (HDFC-CA-9988221100) followed by immediate single RTGS transfer of Rs 15,00,000 to Vikram Malhotra.",
            "entity_ids": ["ORG_001", "ACC_001", "ACC_002", "PER_001", "PER_005"],
            "evidence_document_ids": ["DOC_BANK_005", "DOC_INTEL_002"],
            "confidence": 0.96,
            "metadata": {"transfer_amount": 1500000, "pattern": "Structuring / Smurfing"}
        },
        {
            "id": "ALT_004",
            "rule_name": "SHARED_INFRASTRUCTURE",
            "severity": "MEDIUM",
            "title": "Shared Burner Gateway Infrastructure Detected",
            "description": "Single GSM gateway (+91-98555-66778) utilized concurrently by multiple key suspects: Vikram Malhotra, Rajesh Thapa, and Tariq Ahmed.",
            "entity_ids": ["PHO_006", "PER_001", "PER_002", "PER_007"],
            "evidence_document_ids": ["DOC_FIR_006"],
            "confidence": 0.89,
            "metadata": {"shared_phone": "+91-98555-66778", "user_count": 3}
        },
        {
            "id": "ALT_005",
            "rule_name": "REPEATED_LOCATION_OVERLAP",
            "severity": "MEDIUM",
            "title": "Suspicious Port Meeting Co-occurrence",
            "description": "Customs Inspector S. K. Roy, courier Tariq Ahmed, and logistics head Rajesh Thapa repeatedly recorded at Haldia Port Terminal 4 with front company vehicle WB-02-CD-5678.",
            "entity_ids": ["PER_009", "PER_007", "PER_002", "LOC_005", "VEH_003"],
            "evidence_document_ids": ["DOC_SURV_003"],
            "confidence": 0.88,
            "metadata": {"location": "Haldia Port Terminal 4", "occurrences": 3}
        }
    ]

    return {
        "entities": entities,
        "documents": documents,
        "relationships": relationships,
        "resolution_candidates": resolution_candidates,
        "alerts": alerts
    }

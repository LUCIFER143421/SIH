import re
import uuid
from typing import List, Dict, Any

class RelationExtractor:
    def __init__(self):
        self.relation_triggers = [
            ("CALLS", [r"\bcall(?:ed|s)?\b", r"\bdial(?:ed|s)?\b", r"\bcontact(?:ed|s)?\b", r"\bcommunicat(?:ed|ion)\b"]),
            ("MEETS", [r"\bmet\b", r"\bmeet(?:s|ing)?\b", r"\bdeliver(?:ed|ing)?\b"]),
            ("SEEN_WITH", [r"\bsight(?:ed)?\b", r"\bseen with\b", r"\bobserved\b", r"\bescort(?:ed|ing)?\b"]),
            ("OWNS", [r"\bregister(?:ed)? to\b", r"\bowns?\b", r"\bowner\b", r"\boperat(?:ed|ing)?\b"]),
            ("USES", [r"\bused\b", r"\butiliz(?:ed)?\b", r"\bdriver\b"]),
            ("TRANSFERRED_MONEY_TO", [r"\btransfer(?:red|s)?\b", r"\bdeposit(?:ed|s)?\b", r"\bpaid\b", r"\blayering\b", r"\bRTGS\b", r"\bfunds?\b"]),
            ("LOCATED_AT", [r"\bwarehouse\b", r"\boffice\b", r"\bterminal\b", r"\boperating from\b", r"\bstationed at\b"]),
            ("VISITED", [r"\bintercepted near\b", r"\btravel(?:ed|led)? to\b", r"\bparked at\b"]),
            ("WORKS_FOR", [r"\bdirector\b", r"\bsignatory\b", r"\border(?:ed|s) from\b", r"\bemployee\b", r"\boversees\b"]),
            ("ASSOCIATED_WITH", [r"\bassociat(?:ed|ion)\b", r"\bcollaborat(?:ed)?\b", r"\bcoordinate(?:s|d)?\b", r"\bconnect(?:ed)?\b"])
        ]

    def extract_relations_from_doc(self, text: str, entities: List[Dict[str, Any]], doc_id: str) -> List[Dict[str, Any]]:
        relations = []
        if len(entities) < 2:
            return relations

        # Split text into sentences for localized co-occurrence relationship discovery
        sentences = re.split(r'[.\n;]+', text)
        char_cursor = 0

        for sentence in sentences:
            sentence_stripped = sentence.strip()
            if not sentence_stripped:
                char_cursor += len(sentence) + 1
                continue
            
            sent_start = text.find(sentence_stripped, char_cursor)
            sent_end = sent_start + len(sentence_stripped)
            char_cursor = sent_end

            # Find entities located in this sentence
            sent_entities = [e for e in entities if e["start_char"] >= sent_start and e["end_char"] <= sent_end]
            
            if len(sent_entities) >= 2:
                # Detect which trigger matched the sentence
                matched_rel_type = "ASSOCIATED_WITH"
                for rel_type, triggers in self.relation_triggers:
                    for trig in triggers:
                        if re.search(trig, sentence_stripped, re.IGNORECASE):
                            matched_rel_type = rel_type
                            break
                    if matched_rel_type != "ASSOCIATED_WITH":
                        break

                # Pair up adjacent entities
                for i in range(len(sent_entities)):
                    for j in range(i + 1, len(sent_entities)):
                        e1 = sent_entities[i]
                        e2 = sent_entities[j]

                        # Specialized edge logic based on entity types
                        final_type = matched_rel_type
                        if e1["entity_type"] == "PERSON" and e2["entity_type"] == "PHONE":
                            final_type = "USES"
                        elif e1["entity_type"] == "PERSON" and e2["entity_type"] == "VEHICLE":
                            final_type = "OWNS" if "registered" in sentence_stripped.lower() else "USES"
                        elif e1["entity_type"] == "PERSON" and e2["entity_type"] == "LOCATION":
                            final_type = "LOCATED_AT" if "office" in sentence_stripped.lower() else "VISITED"
                        elif e1["entity_type"] == "ORGANIZATION" and e2["entity_type"] == "ACCOUNT":
                            final_type = "OWNS"
                        elif e1["entity_type"] == "PERSON" and e2["entity_type"] == "ORGANIZATION":
                            final_type = "WORKS_FOR"

                        relations.append({
                            "id": f"EXT_REL_{uuid.uuid4().hex[:6]}",
                            "source_entity_name": e1["canonical_name"],
                            "target_entity_name": e2["canonical_name"],
                            "relationship_type": final_type,
                            "confidence": 0.89,
                            "document_id": doc_id,
                            "evidence_snippet": sentence_stripped
                        })

        return relations

relation_extractor = RelationExtractor()

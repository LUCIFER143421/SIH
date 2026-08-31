import uuid
from typing import List, Dict, Any

try:
    from rapidfuzz import fuzz
except ImportError:
    class FuzzFallback:
        @staticmethod
        def token_sort_ratio(s1: str, s2: str) -> float:
            s1_w = set(s1.lower().split())
            s2_w = set(s2.lower().split())
            if not s1_w or not s2_w:
                return 0.0
            intersection = s1_w.intersection(s2_w)
            return (2.0 * len(intersection) / (len(s1_w) + len(s2_w))) * 100.0
    fuzz = FuzzFallback()

class ResolutionEngine:
    def __init__(self, threshold: float = 75.0):
        self.threshold = threshold

    def find_alias_candidates(self, entities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        candidates = []
        person_entities = [e for e in entities if e.get("entity_type") == "PERSON"]
        
        for i in range(len(person_entities)):
            for j in range(i + 1, len(person_entities)):
                e1 = person_entities[i]
                e2 = person_entities[j]
                
                n1 = e1["canonical_name"].strip()
                n2 = e2["canonical_name"].strip()
                
                if n1.lower() == n2.lower():
                    continue

                # 1. Fuzzy token match
                score = fuzz.token_sort_ratio(n1, n2)

                # 2. Check initial matching (e.g. "V. Malhotra" vs "Vikram Malhotra")
                is_initial_match = False
                parts1 = n1.split()
                parts2 = n2.split()
                if len(parts1) == 2 and len(parts2) == 2:
                    if parts1[1].lower() == parts2[1].lower():
                        if parts1[0][0].lower() == parts2[0][0].lower():
                            is_initial_match = True
                            score = max(score, 88.0)

                # 3. Known aliases check
                aliases1 = e1.get("metadata", {}).get("aliases", [])
                aliases2 = e2.get("metadata", {}).get("aliases", [])
                if any(fuzz.token_sort_ratio(a, n2) > 85 for a in aliases1) or any(fuzz.token_sort_ratio(a, n1) > 85 for a in aliases2):
                    score = max(score, 92.0)

                if score >= self.threshold:
                    candidates.append({
                        "id": f"RES_{uuid.uuid4().hex[:6]}",
                        "source_entity_id": e1["id"],
                        "source_name": n1,
                        "source_type": e1["entity_type"],
                        "target_entity_id": e2["id"],
                        "target_name": n2,
                        "target_type": e2["entity_type"],
                        "similarity_score": round(score / 100.0, 2),
                        "status": "PENDING",
                        "reason": f"High lexical & structural similarity ({int(score)}%) between '{n1}' and '{n2}'"
                    })

        return candidates

resolution_engine = ResolutionEngine()

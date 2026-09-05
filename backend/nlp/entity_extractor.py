import re
import uuid
from typing import List, Dict, Any, Set, Tuple

# Try loading spaCy, else fallback gracefully
_nlp = None
try:
    import spacy
    try:
        _nlp = spacy.load("en_core_web_sm")
    except Exception:
        try:
            _nlp = spacy.blank("en")
        except Exception:
            _nlp = None
except ImportError:
    _nlp = None

class EntityExtractor:
    """
    Generalizable Hybrid Entity Extractor:
    1. Structured regex extractors for ACCOUNT, VEHICLE, PHONE, and DATE.
    2. spaCy statistical NER for PERSON, GPE/LOC/FAC (LOCATION), ORG (ORGANIZATION).
    3. Contextual disambiguation & heuristic normalization for locations, front orgs, and Indian names.
    """
    def __init__(self):
        # 1. High-precision structured patterns
        self.account_pattern = re.compile(r'\b(?:HDFC|AXIS|ICICI|SBI|PNB|BOB)[\-\s]?(?:CA|SB|AC)?[\-\s]?\d{8,12}\b', re.IGNORECASE)
        self.vehicle_pattern = re.compile(r'\b[A-Z]{2}[-\s]?\d{1,2}[-\s]?[A-Z]{1,2}[-\s]?\d{3,4}\b')
        self.phone_pattern = re.compile(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b')
        self.date_pattern = re.compile(r'\b(?:\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})\b', re.IGNORECASE)

        # Location keywords (facilities, plazas, terminals, markets, yards, ports, geographic terms)
        self.location_keywords = {
            "market", "warehouse", "yard", "plaza", "office", "arcade", "terminal",
            "port", "safehouse", "station", "airport", "road", "street", "lane",
            "nagar", "marg", "bagh", "chowk", "ghat", "dock", "depot", "tower",
            "towers", "complex", "building", "center", "centre", "hub", "jetty"
        }

        # Organization keywords
        self.org_keywords = {
            "pvt ltd", "ltd", "limited", "llp", "logistics", "trading", "enterprises",
            "movers", "telecom", "solutions", "corp", "corporation", "bank", "police",
            "cell", "group", "agency", "industries", "exports", "imports", "services"
        }

        # Suffix / structural regexes for Organizations and Locations
        self.org_indicators = re.compile(
            r'\b([A-Z][a-zA-Z0-9&.\-\']+(?:\s+[A-Z][a-zA-Z0-9&.\-\']+)*\s+'
            r'(?:Pvt\s+Ltd|Ltd|Limited|LLP|Trading(?:\s+Co)?|Logistics|Enterprises|Movers|Telecom|Solutions|Corp|Corporation|Bank|Police|Cell|Group|Agency|Industries|Exports|Imports))\b',
            re.IGNORECASE
        )

        self.loc_indicators = re.compile(
            r'\b([A-Z][a-zA-Z0-9.\-\']+(?:\s+[A-Z][a-zA-Z0-9.\-\']+)*\s+'
            r'(?:Market|Warehouse|Yard|Plaza|Office|Arcade|Terminal(?:\s+\d+)?|Port|Safehouse|Station|Airport|Road|Street|Lane|Nagar|Marg|Bagh|Chowk|Ghat|Dock|Depot|Tower|Towers|Complex|Jetty))\b',
            re.IGNORECASE
        )

        # Person honorifics and multi-word capitalized patterns
        self.honorific_person = re.compile(
            r'\b(?:Inspector|Officer|SI|ASI|Constable|Shri|Smt|Mr\.|Mrs\.|Dr\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b'
        )
        self.capitalized_name_seq = re.compile(
            r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b'
        )

        # Common stopwords to exclude from standalone person extraction
        self.stopwords = {
            "on", "in", "at", "after", "before", "during", "under", "while", "from", "with",
            "the", "a", "an", "this", "that", "these", "those", "special", "confidential",
            "analysis", "intelligence", "report", "investigation", "police", "cyber",
            "source", "case", "record", "fir", "cdr", "str", "bank", "account", "phone", "vehicle",
            "near", "drove", "arrested", "suspect", "transferred", "funds", "using"
        }

    def _classify_entity_text(self, text: str, default_type: str) -> str:
        """Disambiguates and normalizes entity types based on semantic keyword presence."""
        lower = text.lower().strip()
        words = lower.split()

        # Check if entity contains organization suffix
        if any(org_kw in lower for org_kw in self.org_keywords):
            return "ORGANIZATION"

        # Check if entity contains location keyword (e.g., "Oberoi Business Plaza", "Mumbai Port Terminal")
        if any(w in self.location_keywords for w in words):
            return "LOCATION"

        return default_type

    def extract(self, text: str) -> List[Dict[str, Any]]:
        extracted = []
        seen_spans: Set[Tuple[int, int]] = set()

        def is_overlapping(start: int, end: int) -> bool:
            for s, e in seen_spans:
                if not (end <= s or start >= e):
                    return True
            return False

        # 1. Extract Bank Accounts First (Prevents account digits from being misclassified as Phone)
        for match in self.account_pattern.finditer(text):
            val = match.group().strip().upper()
            span = (match.start(), match.end())
            if not is_overlapping(span[0], span[1]):
                seen_spans.add(span)
                extracted.append({
                    "id": f"EXT_ACC_{uuid.uuid4().hex[:6]}",
                    "canonical_name": val,
                    "entity_type": "ACCOUNT",
                    "raw_text": val,
                    "start_char": match.start(),
                    "end_char": match.end(),
                    "confidence": 0.95
                })

        # 2. Extract Vehicles Second
        for match in self.vehicle_pattern.finditer(text):
            val = match.group().strip().upper()
            span = (match.start(), match.end())
            if not is_overlapping(span[0], span[1]):
                seen_spans.add(span)
                extracted.append({
                    "id": f"EXT_VEH_{uuid.uuid4().hex[:6]}",
                    "canonical_name": val,
                    "entity_type": "VEHICLE",
                    "raw_text": val,
                    "start_char": match.start(),
                    "end_char": match.end(),
                    "confidence": 0.93
                })

        # 3. Extract Standalone Phone Numbers Third
        for match in self.phone_pattern.finditer(text):
            val = match.group().strip()
            span = (match.start(), match.end())
            if not is_overlapping(span[0], span[1]):
                seen_spans.add(span)
                cleaned = re.sub(r'[\s\-]', '', val)
                if not cleaned.startswith("+91"):
                    cleaned = "+91-" + cleaned[-10:-5] + "-" + cleaned[-5:]
                else:
                    cleaned = "+91-" + cleaned[3:8] + "-" + cleaned[8:]
                extracted.append({
                    "id": f"EXT_PHO_{uuid.uuid4().hex[:6]}",
                    "canonical_name": cleaned,
                    "entity_type": "PHONE",
                    "raw_text": val,
                    "start_char": match.start(),
                    "end_char": match.end(),
                    "confidence": 0.95
                })

        # 4. Extract Explicit Location Indicators (Plaza, Port, Terminal, Warehouse, Market, etc.)
        for match in self.loc_indicators.finditer(text):
            span = (match.start(), match.end())
            if not is_overlapping(span[0], span[1]):
                val = match.group().strip()
                seen_spans.add(span)
                extracted.append({
                    "id": f"EXT_LOC_{uuid.uuid4().hex[:6]}",
                    "canonical_name": val,
                    "entity_type": "LOCATION",
                    "raw_text": val,
                    "start_char": match.start(),
                    "end_char": match.end(),
                    "confidence": 0.92
                })

        # 5. Extract Explicit Organization Indicators (Pvt Ltd, Logistics, Trading, etc.)
        for match in self.org_indicators.finditer(text):
            span = (match.start(), match.end())
            if not is_overlapping(span[0], span[1]):
                val = match.group().strip()
                seen_spans.add(span)
                extracted.append({
                    "id": f"EXT_ORG_{uuid.uuid4().hex[:6]}",
                    "canonical_name": val,
                    "entity_type": "ORGANIZATION",
                    "raw_text": val,
                    "start_char": match.start(),
                    "end_char": match.end(),
                    "confidence": 0.91
                })

        # 6. Extract via spaCy NER with Contextual Disambiguation
        if _nlp is not None and hasattr(_nlp, "pipe_names") and "ner" in _nlp.pipe_names:
            try:
                doc = _nlp(text)
                for ent in doc.ents:
                    start, end = ent.start_char, ent.end_char
                    if is_overlapping(start, end):
                        continue

                    raw_label = ent.label_
                    base_type = None
                    if raw_label in ("PERSON", "PER"):
                        base_type = "PERSON"
                    elif raw_label in ("GPE", "LOC", "FAC"):
                        base_type = "LOCATION"
                    elif raw_label in ("ORG", "NORP"):
                        base_type = "ORGANIZATION"

                    if base_type:
                        name = ent.text.strip()
                        if len(name) > 1 and name.lower() not in self.stopwords:
                            final_type = self._classify_entity_text(name, base_type)
                            seen_spans.add((start, end))
                            extracted.append({
                                "id": f"EXT_{final_type[:3]}_{uuid.uuid4().hex[:6]}",
                                "canonical_name": name,
                                "entity_type": final_type,
                                "raw_text": ent.text,
                                "start_char": start,
                                "end_char": end,
                                "confidence": 0.90
                            })
            except Exception:
                pass

        # 7. Extract Persons with Honorifics (e.g. "Inspector Aarav Deshmukh")
        for match in self.honorific_person.finditer(text):
            span = (match.start(), match.end())
            if not is_overlapping(span[0], span[1]):
                val = match.group().strip()
                seen_spans.add(span)
                extracted.append({
                    "id": f"EXT_PER_{uuid.uuid4().hex[:6]}",
                    "canonical_name": val,
                    "entity_type": "PERSON",
                    "raw_text": val,
                    "start_char": match.start(),
                    "end_char": match.end(),
                    "confidence": 0.91
                })

        # 8. Extract General Capitalized Multi-word Sequences
        for match in self.capitalized_name_seq.finditer(text):
            span = (match.start(), match.end())
            if not is_overlapping(span[0], span[1]):
                val = match.group().strip()
                first_word = val.split()[0].lower()
                last_word = val.split()[-1].lower()
                if first_word not in self.stopwords and len(val) >= 4:
                    ent_type = self._classify_entity_text(val, "PERSON")
                    seen_spans.add(span)
                    extracted.append({
                        "id": f"EXT_{ent_type[:3]}_{uuid.uuid4().hex[:6]}",
                        "canonical_name": val,
                        "entity_type": ent_type,
                        "raw_text": val,
                        "start_char": match.start(),
                        "end_char": match.end(),
                        "confidence": 0.86
                    })

        return sorted(extracted, key=lambda x: x["start_char"])

entity_extractor = EntityExtractor()

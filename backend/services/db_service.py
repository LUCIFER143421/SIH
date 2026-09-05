import sqlite3
import json
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from config import DB_PATH

class DatabaseService:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self.init_db()

    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode = WAL;")
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def init_db(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Documents table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                source_type TEXT NOT NULL,
                content TEXT NOT NULL,
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # Entities table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS entities (
                id TEXT PRIMARY KEY,
                canonical_name TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                risk_score REAL DEFAULT 0.0,
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # Entity mentions table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS entity_mentions (
                id TEXT PRIMARY KEY,
                entity_id TEXT NOT NULL,
                raw_text TEXT NOT NULL,
                document_id TEXT NOT NULL,
                start_char INTEGER,
                end_char INTEGER,
                confidence REAL DEFAULT 1.0,
                FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE CASCADE,
                FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
            );
            """)

            # Entity resolution candidates
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS resolution_candidates (
                id TEXT PRIMARY KEY,
                source_entity_id TEXT NOT NULL,
                target_entity_id TEXT NOT NULL,
                similarity_score REAL NOT NULL,
                status TEXT DEFAULT 'PENDING',
                reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(source_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
                FOREIGN KEY(target_entity_id) REFERENCES entities(id) ON DELETE CASCADE
            );
            """)

            # Relationships table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS relationships (
                id TEXT PRIMARY KEY,
                source_entity_id TEXT NOT NULL,
                target_entity_id TEXT NOT NULL,
                relationship_type TEXT NOT NULL,
                confidence REAL DEFAULT 1.0,
                timestamp TEXT,
                document_id TEXT,
                evidence_snippet TEXT,
                metadata TEXT,
                FOREIGN KEY(source_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
                FOREIGN KEY(target_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
                FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
            );
            """)

            # Alerts table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS alerts (
                id TEXT PRIMARY KEY,
                rule_name TEXT NOT NULL,
                severity TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                entity_ids TEXT NOT NULL,
                evidence_document_ids TEXT NOT NULL,
                confidence REAL DEFAULT 0.9,
                status TEXT DEFAULT 'UNRESOLVED',
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # Investigation audit logs
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS investigation_logs (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                user_query TEXT NOT NULL,
                tool_calls TEXT,
                response TEXT NOT NULL,
                citations TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)
            conn.commit()

    def clear_all_data(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM investigation_logs;")
            cursor.execute("DELETE FROM alerts;")
            cursor.execute("DELETE FROM resolution_candidates;")
            cursor.execute("DELETE FROM relationships;")
            cursor.execute("DELETE FROM entity_mentions;")
            cursor.execute("DELETE FROM entities;")
            cursor.execute("DELETE FROM documents;")
            conn.commit()

    # --- Document Operations ---
    def insert_document(self, doc_id: str, title: str, source_type: str, content: str, metadata: Optional[Dict] = None) -> str:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT OR REPLACE INTO documents (id, title, source_type, content, metadata) VALUES (?, ?, ?, ?, ?)",
                (doc_id, title, source_type, content, json.dumps(metadata or {}))
            )
            conn.commit()
        return doc_id

    def get_documents(self, limit: int = 100) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM documents ORDER BY created_at DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            return [
                {
                    "id": r["id"],
                    "title": r["title"],
                    "source_type": r["source_type"],
                    "content": r["content"],
                    "metadata": json.loads(r["metadata"]) if r["metadata"] else {},
                    "created_at": r["created_at"]
                }
                for r in rows
            ]

    def get_document_by_id(self, doc_id: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
            row = cursor.fetchone()
            if not row:
                return None
            return {
                "id": row["id"],
                "title": row["title"],
                "source_type": row["source_type"],
                "content": row["content"],
                "metadata": json.loads(row["metadata"]) if row["metadata"] else {},
                "created_at": row["created_at"]
            }

    # --- Entity Operations ---
    def insert_entity(self, entity_id: str, canonical_name: str, entity_type: str, risk_score: float = 0.0, metadata: Optional[Dict] = None) -> str:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT OR REPLACE INTO entities (id, canonical_name, entity_type, risk_score, metadata) VALUES (?, ?, ?, ?, ?)",
                (entity_id, canonical_name.strip(), entity_type.upper(), risk_score, json.dumps(metadata or {}))
            )
            conn.commit()
        return entity_id

    def get_entities(self, entity_type: Optional[str] = None) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            if entity_type:
                cursor.execute("SELECT * FROM entities WHERE entity_type = ?", (entity_type.upper(),))
            else:
                cursor.execute("SELECT * FROM entities ORDER BY canonical_name ASC")
            rows = cursor.fetchall()
            return [
                {
                    "id": r["id"],
                    "canonical_name": r["canonical_name"],
                    "entity_type": r["entity_type"],
                    "risk_score": r["risk_score"],
                    "metadata": json.loads(r["metadata"]) if r["metadata"] else {},
                    "created_at": r["created_at"]
                }
                for r in rows
            ]

    def get_entity_by_id(self, entity_id: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM entities WHERE id = ?", (entity_id,))
            r = cursor.fetchone()
            if not r:
                return None
            return {
                "id": r["id"],
                "canonical_name": r["canonical_name"],
                "entity_type": r["entity_type"],
                "risk_score": r["risk_score"],
                "metadata": json.loads(r["metadata"]) if r["metadata"] else {},
                "created_at": r["created_at"]
            }

    def search_entities_by_name(self, query: str) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            pattern = f"%{query.strip()}%"
            cursor.execute("SELECT * FROM entities WHERE canonical_name LIKE ? OR id LIKE ? LIMIT 20", (pattern, pattern))
            rows = cursor.fetchall()
            return [
                {
                    "id": r["id"],
                    "canonical_name": r["canonical_name"],
                    "entity_type": r["entity_type"],
                    "risk_score": r["risk_score"],
                    "metadata": json.loads(r["metadata"]) if r["metadata"] else {},
                    "created_at": r["created_at"]
                }
                for r in rows
            ]

    # --- Relationship Operations ---
    def insert_relationship(self, rel_id: str, source_id: str, target_id: str, rel_type: str,
                            confidence: float = 1.0, timestamp: Optional[str] = None,
                            doc_id: str = "", evidence_snippet: Optional[str] = None,
                            metadata: Optional[Dict] = None) -> str:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Ensure referenced document exists in documents table to satisfy foreign key constraint
            clean_doc_id = doc_id.strip() if doc_id and isinstance(doc_id, str) else None
            if clean_doc_id:
                cursor.execute(
                    "INSERT OR IGNORE INTO documents (id, title, source_type, content, metadata) VALUES (?, ?, 'INTEL', '', '{}')",
                    (clean_doc_id, f"Document {clean_doc_id}")
                )

            cursor.execute(
                """INSERT OR REPLACE INTO relationships 
                   (id, source_entity_id, target_entity_id, relationship_type, confidence, timestamp, document_id, evidence_snippet, metadata)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (rel_id, source_id, target_id, rel_type.upper(), confidence, timestamp, clean_doc_id, evidence_snippet, json.dumps(metadata or {}))
            )
            conn.commit()
        return rel_id

    def get_relationships(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM relationships")
            rows = cursor.fetchall()
            return [
                {
                    "id": r["id"],
                    "source_entity_id": r["source_entity_id"],
                    "target_entity_id": r["target_entity_id"],
                    "relationship_type": r["relationship_type"],
                    "confidence": r["confidence"],
                    "timestamp": r["timestamp"],
                    "document_id": r["document_id"] or "",
                    "evidence_snippet": r["evidence_snippet"],
                    "metadata": json.loads(r["metadata"]) if r["metadata"] else {}
                }
                for r in rows
            ]

    def get_entity_relationships(self, entity_id: str) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """SELECT r.*, e1.canonical_name as source_name, e1.entity_type as source_type,
                          e2.canonical_name as target_name, e2.entity_type as target_type
                   FROM relationships r
                   JOIN entities e1 ON r.source_entity_id = e1.id
                   JOIN entities e2 ON r.target_entity_id = e2.id
                   WHERE r.source_entity_id = ? OR r.target_entity_id = ?""",
                (entity_id, entity_id)
            )
            rows = cursor.fetchall()
            return [
                {
                    "id": r["id"],
                    "source_entity_id": r["source_entity_id"],
                    "source_name": r["source_name"],
                    "source_type": r["source_type"],
                    "target_entity_id": r["target_entity_id"],
                    "target_name": r["target_name"],
                    "target_type": r["target_type"],
                    "relationship_type": r["relationship_type"],
                    "confidence": r["confidence"],
                    "timestamp": r["timestamp"],
                    "document_id": r["document_id"] or "",
                    "evidence_snippet": r["evidence_snippet"],
                    "metadata": json.loads(r["metadata"]) if r["metadata"] else {}
                }
                for r in rows
            ]

    # --- Alerts Operations ---
    def insert_alert(self, alert_id: str, rule_name: str, severity: str, title: str, description: str,
                     entity_ids: List[str], evidence_doc_ids: List[str], confidence: float = 0.9,
                     metadata: Optional[Dict] = None) -> str:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT OR REPLACE INTO alerts 
                   (id, rule_name, severity, title, description, entity_ids, evidence_document_ids, confidence, metadata)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (alert_id, rule_name, severity.upper(), title, description,
                 json.dumps(entity_ids), json.dumps(evidence_doc_ids), confidence, json.dumps(metadata or {}))
            )
            conn.commit()
        return alert_id

    def get_alerts(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            if status:
                cursor.execute("SELECT * FROM alerts WHERE status = ? ORDER BY created_at DESC", (status.upper(),))
            else:
                cursor.execute("SELECT * FROM alerts ORDER BY created_at DESC")
            rows = cursor.fetchall()
            return [
                {
                    "id": r["id"],
                    "rule_name": r["rule_name"],
                    "severity": r["severity"],
                    "title": r["title"],
                    "description": r["description"],
                    "entity_ids": json.loads(r["entity_ids"]),
                    "evidence_document_ids": json.loads(r["evidence_document_ids"]),
                    "confidence": r["confidence"],
                    "status": r["status"],
                    "metadata": json.loads(r["metadata"]) if r["metadata"] else {},
                    "created_at": r["created_at"]
                }
                for r in rows
            ]

    def update_alert_status(self, alert_id: str, status: str, notes: Optional[str] = None):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE alerts SET status = ? WHERE id = ?", (status.upper(), alert_id))
            conn.commit()

    # --- Resolution Candidates Operations ---
    def insert_resolution_candidate(self, candidate_id: str, src_id: str, tgt_id: str, sim_score: float, reason: str):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT OR REPLACE INTO resolution_candidates (id, source_entity_id, target_entity_id, similarity_score, reason) VALUES (?, ?, ?, ?, ?)",
                (candidate_id, src_id, tgt_id, sim_score, reason)
            )
            conn.commit()

    def get_resolution_candidates(self, status: str = "PENDING") -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """SELECT rc.*, e1.canonical_name as source_name, e1.entity_type as source_type,
                          e2.canonical_name as target_name, e2.entity_type as target_type
                   FROM resolution_candidates rc
                   JOIN entities e1 ON rc.source_entity_id = e1.id
                   JOIN entities e2 ON rc.target_entity_id = e2.id
                   WHERE rc.status = ?""",
                (status.upper(),)
            )
            rows = cursor.fetchall()
            return [
                {
                    "id": r["id"],
                    "source_entity_id": r["source_entity_id"],
                    "source_name": r["source_name"],
                    "source_type": r["source_type"],
                    "target_entity_id": r["target_entity_id"],
                    "target_name": r["target_name"],
                    "target_type": r["target_type"],
                    "similarity_score": r["similarity_score"],
                    "status": r["status"],
                    "reason": r["reason"],
                    "created_at": r["created_at"]
                }
                for r in rows
            ]

    def merge_entities(self, primary_id: str, secondary_id: str, candidate_id: Optional[str] = None):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            # Update all relationships pointing to secondary_id to point to primary_id
            cursor.execute("UPDATE relationships SET source_entity_id = ? WHERE source_entity_id = ?", (primary_id, secondary_id))
            cursor.execute("UPDATE relationships SET target_entity_id = ? WHERE target_entity_id = ?", (primary_id, secondary_id))
            
            # Fetch secondary entity info to preserve alias
            cursor.execute("SELECT canonical_name, metadata FROM entities WHERE id = ?", (secondary_id,))
            sec = cursor.fetchone()
            if sec:
                sec_name = sec["canonical_name"]
                cursor.execute("SELECT metadata FROM entities WHERE id = ?", (primary_id,))
                prim = cursor.fetchone()
                prim_meta = json.loads(prim["metadata"]) if prim and prim["metadata"] else {}
                aliases = prim_meta.get("aliases", [])
                if sec_name not in aliases:
                    aliases.append(sec_name)
                prim_meta["aliases"] = aliases
                cursor.execute("UPDATE entities SET metadata = ? WHERE id = ?", (json.dumps(prim_meta), primary_id))
                
            # Delete secondary entity
            cursor.execute("DELETE FROM entities WHERE id = ?", (secondary_id,))
            if candidate_id:
                cursor.execute("UPDATE resolution_candidates SET status = 'CONFIRMED' WHERE id = ?", (candidate_id,))
            conn.commit()

    def dismiss_candidate(self, candidate_id: str):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE resolution_candidates SET status = 'REJECTED' WHERE id = ?", (candidate_id,))
            conn.commit()

db_service = DatabaseService()

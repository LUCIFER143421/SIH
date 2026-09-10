import copy
from typing import Optional, List
from fastapi import APIRouter
from models.schemas import AlertVerifyRequest, Alert
from services.db_service import db_service
from analytics.anomaly_detector import anomaly_detector

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

def sync_and_get_all_alerts(status: Optional[str] = None) -> List[dict]:
    """
    Synchronizes real-time anomaly detection into the SQLite alerts store
    so that alerts have stable IDs and persistent VERIFIED / DISMISSED status.
    """
    # 1. Run live anomaly scanner
    dyn_alerts = anomaly_detector.scan_all_anomalies()
    
    # 2. Persist any newly discovered dynamic anomalies with UNRESOLVED status
    existing_alerts = {a["id"]: a for a in db_service.get_alerts()}
    
    for dyn in dyn_alerts:
        aid = dyn["id"]
        if aid not in existing_alerts:
            db_service.insert_alert(
                alert_id=aid,
                rule_name=dyn["rule_name"],
                severity=dyn["severity"],
                title=dyn["title"],
                description=dyn["description"],
                entity_ids=dyn["entity_ids"],
                evidence_doc_ids=dyn["evidence_document_ids"],
                confidence=dyn.get("confidence", 0.90),
                metadata={**dyn.get("metadata", {}), "source": "live_detection"}
            )
            existing_alerts[aid] = {
                "id": aid,
                "rule_name": dyn["rule_name"],
                "severity": dyn["severity"],
                "title": dyn["title"],
                "description": dyn["description"],
                "entity_ids": dyn["entity_ids"],
                "evidence_document_ids": dyn["evidence_document_ids"],
                "confidence": dyn.get("confidence", 0.90),
                "status": "UNRESOLVED",
                "metadata": {**dyn.get("metadata", {}), "source": "live_detection"}
            }

    # 3. Retrieve all alerts from SQLite
    all_db_alerts = db_service.get_alerts(status=status)
    results = []
    for a in all_db_alerts:
        ac = copy.deepcopy(a)
        meta = ac.get("metadata", {})
        if "source" not in ac:
            ac["source"] = meta.get("source", "case_file")
        results.append(ac)

    return results

@router.get("")
def get_alerts(status: Optional[str] = None):
    """
    Fetches all suspicious pattern alerts combining seeded case-file alerts
    and real-time live anomaly detector results, persisted in SQLite.
    """
    return sync_and_get_all_alerts(status=status)

@router.post("/{alert_id}/verify")
def verify_alert(alert_id: str, req: AlertVerifyRequest):
    """Allows investigator to mark alert as VERIFIED, DISMISSED, or UNDER_REVIEW with persistent SQLite storage."""
    db_service.update_alert_status(alert_id, req.status, req.notes)
    return {"status": "SUCCESS", "alert_id": alert_id, "updated_status": req.status}

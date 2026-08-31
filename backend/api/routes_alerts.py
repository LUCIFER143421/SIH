from typing import Optional
from fastapi import APIRouter
from models.schemas import AlertVerifyRequest
from services.db_service import db_service
from analytics.anomaly_detector import anomaly_detector

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("")
def get_alerts(status: Optional[str] = None):
    """Fetches all system-generated and dynamic suspicious pattern alerts."""
    db_alerts = db_service.get_alerts(status=status)
    if not db_alerts:
        # Run dynamic scanner if DB alerts are empty
        dyn_alerts = anomaly_detector.scan_all_anomalies()
        return dyn_alerts
    return db_alerts

@router.post("/{alert_id}/verify")
def verify_alert(alert_id: str, req: AlertVerifyRequest):
    """Allows investigator to mark alert as VERIFIED, DISMISSED, or UNDER_REVIEW."""
    db_service.update_alert_status(alert_id, req.status, req.notes)
    return {"status": "SUCCESS", "alert_id": alert_id, "updated_status": req.status}

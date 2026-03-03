"""
Reconciliation Engine — decides action based on anomaly score and applies it.
Actions: auto_remediate (<0.3), flag_for_review (0.3-0.7), escalate_alert (>0.7)
"""
import datetime
from dataclasses import dataclass
from typing import Optional, List

from core.anomaly import classify_drift


@dataclass
class ReconcileAction:
    node_id: str
    category: str
    action_type: str          # "auto_remediate" | "flag_for_review" | "escalate_alert"
    anomaly_score: float
    classification: str
    baseline_hash: str
    current_hash: str
    timestamp: str
    details: dict

    def to_dict(self) -> dict:
        return {
            "node_id": self.node_id,
            "category": self.category,
            "action_type": self.action_type,
            "anomaly_score": self.anomaly_score,
            "classification": self.classification,
            "baseline_hash": self.baseline_hash,
            "current_hash": self.current_hash,
            "timestamp": self.timestamp,
            "details": self.details,
        }


# Action descriptions for audit logging
ACTION_DETAILS = {
    "auto_remediate": {
        "description": "Automatically restored policy to baseline configuration.",
        "severity": "low",
        "requires_human": False,
        "sla_minutes": 0,
    },
    "flag_for_review": {
        "description": "Drift flagged for security team review within 4 hours.",
        "severity": "medium",
        "requires_human": True,
        "sla_minutes": 240,
    },
    "escalate_alert": {
        "description": "Critical anomaly escalated to SOC. Immediate response required.",
        "severity": "critical",
        "requires_human": True,
        "sla_minutes": 15,
    },
}


def reconcile(
    node_id: str,
    category: str,
    anomaly_score: float,
    baseline_hash: str,
    current_hash: str,
    extra_details: Optional[dict] = None,
) -> ReconcileAction:
    """
    Determine reconciliation action based on anomaly score.
    Returns a ReconcileAction describing what should be done.
    """
    classification = classify_drift(anomaly_score)

    if anomaly_score < 0.3:
        action_type = "auto_remediate"
    elif anomaly_score <= 0.7:
        action_type = "flag_for_review"
    else:
        action_type = "escalate_alert"

    details = dict(ACTION_DETAILS[action_type])
    details["anomaly_score"] = anomaly_score
    if extra_details:
        details.update(extra_details)

    return ReconcileAction(
        node_id=node_id,
        category=category,
        action_type=action_type,
        anomaly_score=anomaly_score,
        classification=classification,
        baseline_hash=baseline_hash,
        current_hash=current_hash,
        timestamp=datetime.datetime.utcnow().isoformat(),
        details=details,
    )


def apply_remediation(
    node_id: str,
    category: str,
    baseline_hash: str,
) -> dict:
    """
    Simulate applying remediation — restores policy category to baseline hash.
    In a real system this would push the config back to the node.
    Returns a remediation result dict.
    """
    return {
        "node_id": node_id,
        "category": category,
        "action": "restore_to_baseline",
        "baseline_hash": baseline_hash,
        "applied_at": datetime.datetime.utcnow().isoformat(),
        "success": True,
        "message": f"Policy '{category}' restored to baseline on node {node_id}",
    }


def batch_reconcile(
    node_id: str,
    drift_records: list,
    anomaly_scores: dict,
    baseline_hashes: dict,
) -> List[ReconcileAction]:
    """
    Reconcile all drifted categories for a node.
    drift_records: list of DriftRecord objects
    anomaly_scores: dict of category -> float
    baseline_hashes: dict of category -> str
    """
    actions = []
    for record in drift_records:
        cat = record.category
        score = anomaly_scores.get(cat, 0.0)
        baseline_hash = baseline_hashes.get(cat, record.old_hash)
        action = reconcile(
            node_id=node_id,
            category=cat,
            anomaly_score=score,
            baseline_hash=baseline_hash,
            current_hash=record.new_hash,
        )
        actions.append(action)
    return actions

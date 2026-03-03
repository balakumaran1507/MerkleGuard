"""
Temporal Anomaly Scoring Engine.
Produces a 0.0-1.0 score from 5 weighted factors:
  - Time-of-day deviation      (0.25)
  - Drift magnitude             (0.20)
  - Multi-node correlation      (0.25)
  - Category sensitivity        (0.15)
  - Historical drift frequency  (0.15)
"""
import datetime
from dataclasses import dataclass
from typing import List, Optional

from core.snapshot import CATEGORY_SENSITIVITY

# Weights (must sum to 1.0)
W_TIME      = 0.25
W_MAGNITUDE = 0.20
W_CORRELATION = 0.25
W_SENSITIVITY = 0.15
W_FREQUENCY = 0.15


@dataclass
class DriftEvent:
    node_id: str
    timestamp: str           # ISO 8601
    category: str
    old_hash: str
    new_hash: str
    delta_magnitude: int     # |new_rule_count - old_rule_count|
    correlated_nodes: int = 1  # how many nodes drifted in same cycle


def _time_of_day_score(timestamp: str) -> float:
    """
    Score drift based on when it happened.
    Business hours (09:00-17:00): 0.0
    Evening (17:00-22:00): 0.35
    Early morning (06:00-09:00): 0.45
    Night (22:00-24:00 / 00:00-06:00): 0.85
    """
    try:
        dt = datetime.datetime.fromisoformat(timestamp)
        hour = dt.hour
    except (ValueError, TypeError):
        hour = 12  # default to business hours if parse fails

    if 9 <= hour < 17:
        return 0.0
    elif 17 <= hour < 22:
        return 0.35
    elif 6 <= hour < 9:
        return 0.45
    else:
        return 0.85


def _magnitude_score(delta: int) -> float:
    """
    Normalized rule-change magnitude.
    0 changes: 0.0
    1-5: 0.25
    6-15: 0.55
    16-30: 0.80
    31+: 1.0
    """
    if delta == 0:
        return 0.0
    elif delta <= 5:
        return 0.25
    elif delta <= 15:
        return 0.55
    elif delta <= 30:
        return 0.80
    else:
        return 1.0


def _correlation_score(correlated_nodes: int) -> float:
    """
    Higher score when multiple nodes drift simultaneously.
    1 node: 0.0
    2-3 nodes: 0.45
    4-6 nodes: 0.75
    7+ nodes: 1.0
    """
    if correlated_nodes <= 1:
        return 0.0
    elif correlated_nodes <= 3:
        return 0.45
    elif correlated_nodes <= 6:
        return 0.75
    else:
        return 1.0


def _sensitivity_score(category: str) -> float:
    """Returns the pre-defined sensitivity for a policy category."""
    return CATEGORY_SENSITIVITY.get(category, 0.5)


def _frequency_score(node_id: str, category: str, history: List[DriftEvent]) -> float:
    """
    Drift frequency for this node/category in the last 24 hours.
    0 prior drifts: 0.0
    1 drift: 0.20
    2-3 drifts: 0.55
    4+: 1.0
    """
    now = datetime.datetime.utcnow()
    window = datetime.timedelta(hours=24)
    recent = [
        e for e in history
        if e.node_id == node_id
        and e.category == category
        and _within_window(e.timestamp, now, window)
    ]
    count = len(recent)
    if count == 0:
        return 0.0
    elif count == 1:
        return 0.20
    elif count <= 3:
        return 0.55
    else:
        return 1.0


def _within_window(ts: str, now: datetime.datetime, window: datetime.timedelta) -> bool:
    try:
        dt = datetime.datetime.fromisoformat(ts)
        return (now - dt) <= window
    except (ValueError, TypeError):
        return False


def calculate_anomaly_score(event: DriftEvent, history: List[DriftEvent]) -> float:
    """
    Compute a 0.0-1.0 anomaly score from 5 weighted factors.
    Higher = more suspicious / anomalous.
    """
    t_score = _time_of_day_score(event.timestamp)
    m_score = _magnitude_score(event.delta_magnitude)
    c_score = _correlation_score(event.correlated_nodes)
    s_score = _sensitivity_score(event.category)
    f_score = _frequency_score(event.node_id, event.category, history)

    total = (
        W_TIME * t_score
        + W_MAGNITUDE * m_score
        + W_CORRELATION * c_score
        + W_SENSITIVITY * s_score
        + W_FREQUENCY * f_score
    )
    return round(min(1.0, max(0.0, total)), 4)


def classify_drift(score: float) -> str:
    """Classify anomaly score into severity bucket."""
    if score < 0.3:
        return "routine"
    elif score <= 0.7:
        return "suspicious"
    else:
        return "critical"


def score_breakdown(event: DriftEvent, history: List[DriftEvent]) -> dict:
    """Return per-factor breakdown for UI display."""
    t = _time_of_day_score(event.timestamp)
    m = _magnitude_score(event.delta_magnitude)
    c = _correlation_score(event.correlated_nodes)
    s = _sensitivity_score(event.category)
    f = _frequency_score(event.node_id, event.category, history)
    total = round(W_TIME * t + W_MAGNITUDE * m + W_CORRELATION * c + W_SENSITIVITY * s + W_FREQUENCY * f, 4)
    return {
        "total": min(1.0, max(0.0, total)),
        "factors": {
            "time_of_day":    {"raw": round(t, 4), "weighted": round(W_TIME * t, 4),      "weight": W_TIME},
            "magnitude":      {"raw": round(m, 4), "weighted": round(W_MAGNITUDE * m, 4), "weight": W_MAGNITUDE},
            "correlation":    {"raw": round(c, 4), "weighted": round(W_CORRELATION * c, 4),"weight": W_CORRELATION},
            "sensitivity":    {"raw": round(s, 4), "weighted": round(W_SENSITIVITY * s, 4),"weight": W_SENSITIVITY},
            "frequency":      {"raw": round(f, 4), "weighted": round(W_FREQUENCY * f, 4), "weight": W_FREQUENCY},
        },
    }

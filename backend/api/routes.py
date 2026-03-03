"""
FastAPI REST + WebSocket routes for MerkleGuard.
"""
import asyncio
import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from sqlalchemy.orm import Session

from models.database import (
    get_db, NodeDB, SnapshotDB, DriftEventDB, ReconcileActionDB,
    AuditLogDB, ConsensusRoundDB, SignedBaselineDB,
)
from core.simulator import engine, ATTACK_CONFIGS
from core.anomaly import calculate_anomaly_score, classify_drift, score_breakdown, DriftEvent as AnomalyEvent
from core.threat_model import THREAT_MODEL
from core.consensus import PROTOCOL_SPEC
from core.baseline_authority import authority as baseline_authority, BaselineTamperAlert
from core.network_analysis import calculate_gossip_overhead, generate_scalability_table
from core.metrics_tracker import tracker as metrics_tracker

router = APIRouter()


# ─── WebSocket Connection Manager ────────────────────────────────────────────

class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, data: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()


# Wire the broadcast function into the simulation engine
async def _broadcast_wrapper(event: dict):
    await manager.broadcast(event)

engine.set_broadcast(_broadcast_wrapper)


# ─── Pydantic request models ──────────────────────────────────────────────────

class DriftInjectRequest(BaseModel):
    node_ids: List[str]
    categories: Optional[List[str]] = None

class AttackInjectRequest(BaseModel):
    attack_type: str
    target_node_ids: List[str]

class ReconcileRequest(BaseModel):
    node_ids: Optional[List[str]] = None  # None = all drifted nodes

class BaselineUpdateRequest(BaseModel):
    policy_state: dict
    approvers: List[str]
    signed_by: Optional[str] = None


# ─── Nodes ────────────────────────────────────────────────────────────────────

@router.get("/nodes")
async def list_nodes():
    return [n.to_dict() for n in engine.get_all_nodes()]


@router.get("/nodes/{node_id}")
async def get_node(node_id: str):
    node = engine.get_node(node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node.to_dict()


@router.get("/nodes/{node_id}/merkle")
async def get_node_merkle(node_id: str):
    node = engine.get_node(node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return {
        "node_id": node_id,
        "merkle_root": node.current_root,
        "baseline_root": node.baseline_root,
        "tree": node.current_snapshot.merkle_tree.to_dict(),
        "baseline_tree": node.baseline_snapshot.merkle_tree.to_dict(),
        "drifted_categories": list(node.drifted_categories.keys()),
        "drifted_leaf_indices": [
            i for i, cat in enumerate(["firewall_rules","acl","encryption",
                                        "network_segmentation","auth_protocols","audit_logging"])
            if cat in node.drifted_categories
        ],
    }


@router.get("/nodes/{node_id}/history")
async def get_node_history(node_id: str, db: Session = Depends(get_db)):
    rows = (
        db.query(SnapshotDB)
        .filter(SnapshotDB.node_id == node_id)
        .order_by(SnapshotDB.captured_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": r.id,
            "node_id": r.node_id,
            "merkle_root": r.merkle_root,
            "captured_at": r.captured_at.isoformat() if r.captured_at else None,
        }
        for r in rows
    ]


# ─── Snapshots ────────────────────────────────────────────────────────────────

@router.get("/snapshots/latest")
async def latest_snapshots():
    return {
        "round": engine.round_number,
        "nodes": [
            {
                "node_id": n.node_id,
                "name": n.name,
                "merkle_root": n.current_root,
                "status": n.status,
                "snapshot_count": n.snapshot_count,
            }
            for n in engine.get_all_nodes()
        ],
    }


# ─── Stats ────────────────────────────────────────────────────────────────────

@router.get("/stats")
async def get_stats():
    return engine.get_stats()


# ─── Timeline & Audit ─────────────────────────────────────────────────────────

@router.get("/timeline")
async def get_timeline(limit: int = 50):
    return engine.get_timeline(limit=limit)


@router.get("/audit-log")
async def get_audit_log(db: Session = Depends(get_db), limit: int = 100):
    rows = (
        db.query(AuditLogDB)
        .order_by(AuditLogDB.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "event_type": r.event_type,
            "node_id": r.node_id,
            "before_root": r.before_root,
            "after_root": r.after_root,
            "meta": r.meta,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


# ─── Consensus ────────────────────────────────────────────────────────────────

@router.get("/consensus/history")
async def consensus_history(limit: int = 20):
    return engine.consensus_history[-limit:]


# ─── Reconciliation ───────────────────────────────────────────────────────────

@router.post("/reconcile")
async def manual_reconcile(req: ReconcileRequest, db: Session = Depends(get_db)):
    # Verify signed baseline before every reconciliation cycle (IEEE requirement)
    current_baseline = baseline_authority.current
    if current_baseline:
        try:
            baseline_authority.verify_or_raise(current_baseline)
            metrics_tracker.record_baseline_verification(True)
        except BaselineTamperAlert as e:
            metrics_tracker.record_baseline_verification(False)
            log = AuditLogDB(
                event_type="baseline_tamper_alert",
                node_id=None,
                before_root=current_baseline.root_hash,
                after_root=None,
                meta=e.to_dict(),
                created_at=datetime.datetime.utcnow(),
            )
            db.add(log)
            db.commit()
            await manager.broadcast({"type": "baseline_tamper_alert", **e.to_dict()})
            raise HTTPException(status_code=409, detail=e.to_dict())

    node_ids = req.node_ids or [n.node_id for n in engine.get_all_nodes() if n.status != "compliant"]
    results = []
    for node_id in node_ids:
        node = engine.get_node(node_id)
        if not node:
            continue
        before_root = node.current_root
        node.remediate()
        after_root = node.current_root

        # Persist audit log
        log = AuditLogDB(
            event_type="manual_reconcile",
            node_id=node_id,
            before_root=before_root,
            after_root=after_root,
            meta={"triggered_by": "api"},
            created_at=datetime.datetime.utcnow(),
        )
        db.add(log)

        await manager.broadcast({
            "type": "manual_reconcile",
            "node_id": node_id,
            "node_name": node.name,
            "before_root": before_root[:16],
            "after_root": after_root[:16],
            "timestamp": datetime.datetime.utcnow().isoformat(),
        })

        results.append({"node_id": node_id, "status": "remediated", "new_root": after_root})

    db.commit()
    return {"remediated": results}


# ─── Simulation ───────────────────────────────────────────────────────────────

@router.post("/simulate/drift")
async def simulate_drift(req: DriftInjectRequest):
    results = []
    for node_id in req.node_ids:
        result = engine.inject_natural_drift(node_id)
        if result:
            results.append(result)
            await manager.broadcast({
                "type": "drift_injected",
                "node_id": node_id,
                "categories": result["categories"],
                "drift_type": "natural",
                "timestamp": datetime.datetime.utcnow().isoformat(),
            })
    return {"injected": results}


@router.post("/simulate/attack")
async def simulate_attack(req: AttackInjectRequest):
    if req.attack_type not in ATTACK_CONFIGS:
        raise HTTPException(status_code=400, detail=f"Unknown attack type: {req.attack_type}")
    if not req.target_node_ids:
        raise HTTPException(status_code=400, detail="target_node_ids must not be empty")

    # Record injection timestamps for MTTD calculation
    attack_cats = ATTACK_CONFIGS[req.attack_type]["categories"]
    for node_id in req.target_node_ids:
        for cat in attack_cats:
            metrics_tracker.record_injection(node_id, cat, attack_type=req.attack_type)
    metrics_tracker.record_attack()

    results = engine.inject_attack(req.attack_type, req.target_node_ids)

    await manager.broadcast({
        "type": "attack_injected",
        "attack_type": req.attack_type,
        "targets": req.target_node_ids,
        "description": ATTACK_CONFIGS[req.attack_type]["description"],
        "timestamp": datetime.datetime.utcnow().isoformat(),
    })

    # Immediately run a detection cycle and record detections
    cycle_result = await engine.run_cycle()
    for node_id in req.target_node_ids:
        for cat in attack_cats:
            metrics_tracker.record_detection(node_id, cat, attack_type=req.attack_type)

    return {
        "attack": results,
        "detection_cycle": cycle_result,
    }


@router.post("/simulate/run-cycle")
async def trigger_cycle():
    result = await engine.run_cycle()
    return result


# ─── Analytics ────────────────────────────────────────────────────────────────

@router.get("/analytics/drift-frequency")
async def drift_frequency():
    """Per-node drift counts from in-memory history."""
    counts: dict = {}
    for e in engine.drift_history:
        counts[e.node_id] = counts.get(e.node_id, 0) + 1
    return [{"node_id": k, "count": v} for k, v in sorted(counts.items(), key=lambda x: -x[1])]


@router.get("/analytics/category-heatmap")
async def category_heatmap():
    """Drift count per (node, category) pair."""
    matrix: dict = {}
    for e in engine.drift_history:
        key = f"{e.node_id}:{e.category}"
        matrix[key] = matrix.get(key, 0) + 1
    return [
        {"node_id": k.split(":")[0], "category": k.split(":")[1], "count": v}
        for k, v in matrix.items()
    ]


@router.get("/analytics/anomaly-scores")
async def anomaly_scores():
    """Recent anomaly scores for histogram."""
    scores = []
    hist = engine.drift_history[-200:]
    for e in hist:
        s = calculate_anomaly_score(e, hist)
        scores.append({
            "node_id": e.node_id,
            "category": e.category,
            "score": s,
            "classification": classify_drift(s),
            "timestamp": e.timestamp,
        })
    return scores


# ─── Threat Model ─────────────────────────────────────────────────────────────

@router.get("/threat-model")
async def get_threat_model():
    """Formal adversary model and system scope for IEEE reviewer transparency."""
    return THREAT_MODEL


# ─── Consensus Protocol Spec ──────────────────────────────────────────────────

@router.get("/consensus/spec")
async def get_consensus_spec():
    """Formal MLSC protocol specification with complexity and property proofs."""
    return PROTOCOL_SPEC


# ─── Baseline Authority ───────────────────────────────────────────────────────

@router.get("/baseline/current")
async def get_current_baseline():
    """Return the currently active signed baseline."""
    b = baseline_authority.current
    if not b:
        raise HTTPException(status_code=404, detail="No baseline has been signed yet")
    return b.to_dict()


@router.get("/baseline/verify")
async def verify_current_baseline():
    """Verify the RSA-PSS signature on the current baseline. Returns {valid: bool}."""
    b = baseline_authority.current
    if not b:
        raise HTTPException(status_code=404, detail="No baseline to verify")
    valid = baseline_authority.verify_baseline(b)
    metrics_tracker.record_baseline_verification(valid)
    return {"valid": valid, "checked_at": datetime.datetime.utcnow().isoformat(), "root_hash": b.root_hash}


@router.get("/baseline/history")
async def get_baseline_history(db: Session = Depends(get_db)):
    """Return all historical baselines from both memory and DB."""
    memory_history = [b.to_dict() for b in baseline_authority.history]
    db_rows = db.query(SignedBaselineDB).order_by(SignedBaselineDB.signed_at.desc()).all()
    db_history = [
        {
            "id": r.id,
            "root_hash": r.root_hash,
            "signature": r.signature[:32] + "…",
            "signed_by": r.signed_by,
            "signed_at": r.signed_at.isoformat() if r.signed_at else None,
            "approvers": r.approvers_json,
            "is_current": bool(r.is_current),
        }
        for r in db_rows
    ]
    return {"baselines": db_history or memory_history}


@router.post("/baseline/update")
async def update_baseline(req: BaselineUpdateRequest, db: Session = Depends(get_db)):
    """
    Sign and store a new baseline. Requires >= 2 approvers (2-of-3 threshold simulation).
    """
    try:
        new_baseline = baseline_authority.update_baseline(
            new_policy_state=req.policy_state,
            approvers=req.approvers,
            signed_by=req.signed_by,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Persist to DB
    db_row = SignedBaselineDB(
        root_hash=new_baseline.root_hash,
        signature=new_baseline.signature,
        public_key_pem=new_baseline.public_key_pem,
        signed_at=datetime.datetime.utcnow(),
        signed_by=new_baseline.signed_by,
        approvers_json=new_baseline.approvers,
        is_current=1,
    )
    # Mark previous as archived
    db.query(SignedBaselineDB).filter(SignedBaselineDB.is_current == 1).update({"is_current": 0})
    db.add(db_row)

    log = AuditLogDB(
        event_type="baseline_updated",
        node_id=None,
        before_root=baseline_authority.history[-1].root_hash if baseline_authority.history else None,
        after_root=new_baseline.root_hash,
        meta={"approvers": req.approvers, "signed_by": new_baseline.signed_by},
        created_at=datetime.datetime.utcnow(),
    )
    db.add(log)
    db.commit()

    await manager.broadcast({
        "type": "baseline_updated",
        "root_hash": new_baseline.root_hash[:16] + "…",
        "signed_by": new_baseline.signed_by,
        "approvers": new_baseline.approvers,
        "timestamp": new_baseline.signed_at,
    })

    return new_baseline.to_dict()


# ─── Network Analysis ─────────────────────────────────────────────────────────

@router.get("/analysis/overhead")
async def get_gossip_overhead(nodes: int = 16, k: int = 3, rounds: int = 1):
    """
    Calculate gossip communication overhead and detection probability.
    Query params: nodes (int), k (int), rounds (int)
    """
    if nodes < 2:
        raise HTTPException(status_code=400, detail="nodes must be >= 2")
    if k < 1 or k >= nodes:
        raise HTTPException(status_code=400, detail="k must be >= 1 and < nodes")
    return calculate_gossip_overhead(nodes, k, rounds)


@router.get("/analysis/scalability")
async def get_scalability_table():
    """Full scalability benchmark table across fleet sizes and k values."""
    return {"table": generate_scalability_table()}


# ─── Metrics ──────────────────────────────────────────────────────────────────

@router.get("/metrics")
async def get_metrics():
    """
    Real performance metrics computed from live simulation data.
    Includes MTTD, MTTR, false positive/negative rates, traversal efficiency,
    and Merkle vs naive comparison.
    """
    return metrics_tracker.get_metrics()


# ─── WebSocket ────────────────────────────────────────────────────────────────

@router.websocket("/ws/events")
async def websocket_events(ws: WebSocket):
    await manager.connect(ws)
    # Send initial state snapshot
    await ws.send_json({
        "type": "connected",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "stats": engine.get_stats(),
        "nodes": [n.to_dict() for n in engine.get_all_nodes()],
    })
    try:
        while True:
            # Keep connection alive; engine broadcasts events independently
            try:
                data = await asyncio.wait_for(ws.receive_text(), timeout=30.0)
                # Handle ping
                if data == "ping":
                    await ws.send_json({"type": "pong"})
            except asyncio.TimeoutError:
                await ws.send_json({"type": "heartbeat", "timestamp": datetime.datetime.utcnow().isoformat()})
    except WebSocketDisconnect:
        manager.disconnect(ws)

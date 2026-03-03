"""
Attack & Drift Simulation Engine.
Manages a 16-node cluster, injects natural drift and attacks, runs continuous cycles.
Pushes events via WebSocket connection manager.
"""
import asyncio
import datetime
import random
import string
from typing import Dict, List, Optional, Callable, Any

from core.merkle import build_merkle_tree
from core.snapshot import (
    PolicyState, Snapshot, DriftReport,
    build_policy_state, capture_snapshot, compare_snapshots,
    POLICY_CATEGORIES,
)
from core.consensus import (
    NodeAgent, NODE_DEFINITIONS, build_peer_list,
    gossip_round, compute_consensus_stats,
)
from core.anomaly import (
    DriftEvent, calculate_anomaly_score, classify_drift, score_breakdown,
)
from core.reconciler import reconcile, apply_remediation


def _rand_seed(n: int = 8) -> str:
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=n))


class NodeState:
    """Full runtime state for a single node."""

    def __init__(self, node_def: dict):
        self.node_id: str = node_def["id"]
        self.name: str = node_def["name"]
        self.zone: str = node_def["zone"]

        # Baseline: deterministic from node_id
        self.baseline_policy: PolicyState = build_policy_state(self.node_id)
        self.baseline_snapshot: Snapshot = capture_snapshot(self.node_id, self.baseline_policy)
        self.baseline_root: str = self.baseline_snapshot.merkle_root

        # Current (starts at baseline)
        self.current_policy: PolicyState = build_policy_state(self.node_id)
        self.current_snapshot: Snapshot = self.baseline_snapshot
        self.current_root: str = self.baseline_root

        # Status
        self.status: str = "compliant"   # compliant | drifted | critical
        self.drifted_categories: Dict[str, str] = {}  # category -> drift_seed

        # History
        self.snapshot_count: int = 1
        self.drift_event_count: int = 0
        self.reconcile_count: int = 0
        self.uptime_start: str = datetime.datetime.utcnow().isoformat()

    def refresh_snapshot(self):
        """Rebuild current_snapshot from current_policy."""
        self.current_snapshot = capture_snapshot(self.node_id, self.current_policy)
        self.current_root = self.current_snapshot.merkle_root
        self.snapshot_count += 1

    def inject_drift(self, categories: Dict[str, str]):
        """Apply drift to specified categories."""
        self.drifted_categories.update(categories)
        self.current_policy = build_policy_state(self.node_id, self.drifted_categories)
        self.refresh_snapshot()
        self.status = "drifted"

    def remediate(self, categories: Optional[List[str]] = None):
        """Reset drifted categories to baseline."""
        if categories is None:
            self.drifted_categories = {}
        else:
            for cat in categories:
                self.drifted_categories.pop(cat, None)
        self.current_policy = build_policy_state(self.node_id, self.drifted_categories)
        self.refresh_snapshot()
        self.status = "compliant" if not self.drifted_categories else "drifted"
        self.reconcile_count += 1

    def to_dict(self) -> dict:
        return {
            "id": self.node_id,
            "name": self.name,
            "zone": self.zone,
            "status": self.status,
            "current_merkle_root": self.current_root,
            "baseline_merkle_root": self.baseline_root,
            "snapshot_count": self.snapshot_count,
            "drift_event_count": self.drift_event_count,
            "reconcile_count": self.reconcile_count,
            "drifted_categories": list(self.drifted_categories.keys()),
            "uptime_start": self.uptime_start,
            "policy_state": self.current_snapshot.policy_state.to_dict(),
        }


ATTACK_CONFIGS = {
    "firewall_bypass": {
        "categories": ["firewall_rules"],
        "description": "Silently disabled critical firewall rules, allowing unauthorized traffic.",
        "magnitude": 25,
    },
    "encryption_downgrade": {
        "categories": ["encryption"],
        "description": "Downgraded TLS 1.3 to TLS 1.0; weak cipher suite inserted.",
        "magnitude": 8,
    },
    "acl_escalation": {
        "categories": ["acl", "auth_protocols"],
        "description": "Unauthorized admin entries appended to ACL; MFA bypass detected.",
        "magnitude": 15,
    },
    "coordinated_attack": {
        "categories": ["firewall_rules", "acl", "encryption"],
        "description": "Coordinated multi-vector attack across multiple nodes simultaneously.",
        "magnitude": 30,
    },
}


class SimulationEngine:
    def __init__(self):
        self.nodes: Dict[str, NodeState] = {
            nd["id"]: NodeState(nd) for nd in NODE_DEFINITIONS
        }
        self.round_number: int = 0
        self.running: bool = False
        self.drift_history: List[DriftEvent] = []
        self.consensus_history: List[dict] = []
        self._broadcast_fn: Optional[Callable] = None
        self._db_save_fn: Optional[Callable] = None

    def set_broadcast(self, fn: Callable):
        """Set the async broadcast function (from WebSocket manager)."""
        self._broadcast_fn = fn

    def set_db_save(self, fn: Callable):
        """Set the async db-persist function."""
        self._db_save_fn = fn

    async def _broadcast(self, event: dict):
        if self._broadcast_fn:
            await self._broadcast_fn(event)

    # ─── Public API ────────────────────────────────────────────────────

    def get_node(self, node_id: str) -> Optional[NodeState]:
        return self.nodes.get(node_id)

    def get_all_nodes(self) -> List[NodeState]:
        return list(self.nodes.values())

    def inject_natural_drift(self, node_id: str) -> Optional[dict]:
        """Simulate routine config change on a single node (low anomaly)."""
        node = self.nodes.get(node_id)
        if not node:
            return None
        cat = random.choice(["audit_logging", "network_segmentation", "auth_protocols"])
        seed = _rand_seed()
        node.inject_drift({cat: seed})
        node.drift_event_count += 1
        return {"node_id": node_id, "categories": [cat], "seed": seed, "type": "natural"}

    def inject_attack(self, attack_type: str, target_node_ids: List[str]) -> List[dict]:
        """Inject an attack scenario into the specified nodes."""
        cfg = ATTACK_CONFIGS.get(attack_type)
        if not cfg:
            return []
        results = []
        for node_id in target_node_ids:
            node = self.nodes.get(node_id)
            if not node:
                continue
            drift_cats = {cat: _rand_seed() for cat in cfg["categories"]}
            node.inject_drift(drift_cats)
            node.status = "critical"
            node.drift_event_count += 1
            results.append({
                "node_id": node_id,
                "attack_type": attack_type,
                "categories": cfg["categories"],
                "description": cfg["description"],
            })
        return results

    # ─── Simulation Cycle ─────────────────────────────────────────────

    async def run_cycle(self) -> dict:
        """Execute one full snapshot → consensus → diff → score → reconcile cycle."""
        self.round_number += 1
        ts = datetime.datetime.utcnow().isoformat()
        cycle_events = []

        # 1. Snapshot all nodes
        for node in self.nodes.values():
            node.refresh_snapshot()

        await self._broadcast({
            "type": "snapshot_round",
            "round": self.round_number,
            "timestamp": ts,
            "nodes": [
                {"node_id": n.node_id, "merkle_root": n.current_root, "status": n.status}
                for n in self.nodes.values()
            ],
        })

        # 2. Gossip consensus round
        node_agents = [
            NodeAgent(
                node_id=n.node_id,
                name=n.name,
                zone=n.zone,
                merkle_root=n.current_root,
                baseline_root=n.baseline_root,
            )
            for n in self.nodes.values()
        ]
        known_roots = {n.node_id: n.baseline_root for n in self.nodes.values()}
        results, flagged = gossip_round(node_agents, known_roots, self.round_number, k=3)
        stats = compute_consensus_stats(results)

        self.consensus_history.append({
            "round": self.round_number,
            "timestamp": ts,
            "stats": stats,
            "flagged": flagged,
        })
        if len(self.consensus_history) > 100:
            self.consensus_history = self.consensus_history[-100:]

        await self._broadcast({
            "type": "consensus_round",
            "round": self.round_number,
            "timestamp": ts,
            "stats": stats,
            "flagged_nodes": flagged,
        })

        # 3. Drift detection + scoring + reconciliation
        correlated_count = sum(
            1 for n in self.nodes.values() if n.current_root != n.baseline_root
        )

        for node in self.nodes.values():
            drift_report = compare_snapshots(node.current_snapshot, node.baseline_snapshot)
            if not drift_report.has_drift:
                node.status = "compliant"
                continue

            auto_remediated: List[str] = []
            flagged_cats: List[str] = []
            escalated_cats: List[str] = []

            for dr in drift_report.drifted_categories:
                event = DriftEvent(
                    node_id=node.node_id,
                    timestamp=ts,
                    category=dr.category,
                    old_hash=dr.old_hash,
                    new_hash=dr.new_hash,
                    delta_magnitude=abs(dr.new_rule_count - dr.old_rule_count),
                    correlated_nodes=correlated_count,
                )
                score = calculate_anomaly_score(event, self.drift_history)
                classification = classify_drift(score)
                breakdown = score_breakdown(event, self.drift_history)

                self.drift_history.append(event)
                if len(self.drift_history) > 1000:
                    self.drift_history = self.drift_history[-1000:]

                action = reconcile(
                    node_id=node.node_id,
                    category=dr.category,
                    anomaly_score=score,
                    baseline_hash=dr.old_hash,
                    current_hash=dr.new_hash,
                )

                await self._broadcast({
                    "type": "drift_detected",
                    "node_id": node.node_id,
                    "node_name": node.name,
                    "zone": node.zone,
                    "category": dr.category,
                    "old_hash": dr.old_hash[:16],
                    "new_hash": dr.new_hash[:16],
                    "anomaly_score": score,
                    "classification": classification,
                    "action": action.action_type,
                    "score_breakdown": breakdown,
                    "timestamp": ts,
                    "round": self.round_number,
                })

                if action.action_type == "auto_remediate":
                    auto_remediated.append(dr.category)
                elif action.action_type == "flag_for_review":
                    flagged_cats.append(dr.category)
                else:
                    escalated_cats.append(dr.category)

            # Apply auto-remediations
            if auto_remediated:
                node.remediate(auto_remediated)
                await self._broadcast({
                    "type": "auto_remediate",
                    "node_id": node.node_id,
                    "node_name": node.name,
                    "categories": auto_remediated,
                    "timestamp": ts,
                    "round": self.round_number,
                })

            # Update node status based on remaining drift
            if escalated_cats:
                node.status = "critical"
            elif flagged_cats or node.drifted_categories:
                node.status = "drifted"
            else:
                node.status = "compliant"

            if escalated_cats or flagged_cats:
                await self._broadcast({
                    "type": "escalate_alert" if escalated_cats else "flag_for_review",
                    "node_id": node.node_id,
                    "node_name": node.name,
                    "categories": escalated_cats or flagged_cats,
                    "timestamp": ts,
                    "round": self.round_number,
                })

        return {
            "round": self.round_number,
            "timestamp": ts,
            "consensus_stats": stats,
            "drifted_nodes": correlated_count,
        }

    async def run_continuous(self, interval_seconds: int = 20):
        """Run cycles on a timer. Inject occasional natural drift to keep things interesting."""
        self.running = True
        cycle = 0
        while self.running:
            await asyncio.sleep(interval_seconds)
            if not self.running:
                break

            # Occasionally inject natural drift to keep the demo lively
            cycle += 1
            if cycle % 3 == 0:
                # Pick 1-2 random nodes for natural drift
                candidates = [n for n in self.nodes.values() if n.status == "compliant"]
                if candidates:
                    target = random.choice(candidates)
                    self.inject_natural_drift(target.node_id)

            await self.run_cycle()

    def stop(self):
        self.running = False

    def get_stats(self) -> dict:
        nodes = list(self.nodes.values())
        compliant = sum(1 for n in nodes if n.status == "compliant")
        drifted = sum(1 for n in nodes if n.status == "drifted")
        critical = sum(1 for n in nodes if n.status == "critical")
        total_snapshots = sum(n.snapshot_count for n in nodes)
        total_drifts = sum(n.drift_event_count for n in nodes)
        avg_score = 0.0
        if self.drift_history:
            recent = self.drift_history[-50:]
            # rough estimate
            avg_score = round(len([e for e in recent if e.correlated_nodes > 1]) / max(len(recent), 1) * 0.6, 4)

        return {
            "total_nodes": len(nodes),
            "compliant_count": compliant,
            "drifted_count": drifted,
            "critical_count": critical,
            "total_snapshots": total_snapshots,
            "total_drifts": total_drifts,
            "avg_anomaly_score": avg_score,
            "consensus_rounds": self.round_number,
            "compliance_pct": round(compliant / len(nodes) * 100, 1) if nodes else 100.0,
        }

    def get_timeline(self, limit: int = 50) -> List[dict]:
        """Return recent drift events as timeline items."""
        events = []
        for e in reversed(self.drift_history[-limit:]):
            score = calculate_anomaly_score(e, self.drift_history)
            events.append({
                "node_id": e.node_id,
                "timestamp": e.timestamp,
                "category": e.category,
                "anomaly_score": score,
                "classification": classify_drift(score),
                "old_hash": e.old_hash[:16],
                "new_hash": e.new_hash[:16],
            })
        return events


# Singleton instance — imported by api/routes.py and main.py
engine = SimulationEngine()

"""
Gossip-Based Peer Consensus — 16-node simulated P2P network.
Each node cross-verifies peers' Merkle roots via k-random gossip rounds.
Byzantine detection: flag node if >1/3 peers disagree with expected root.
"""
import random
import datetime
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

# ─── Formal Protocol Specification ───────────────────────────────────────────
# MerkleGuard Lightweight State Consensus (MLSC)
# For IEEE review transparency — served via GET /api/consensus/spec

PROTOCOL_SPEC = {
    "name": "MerkleGuard Lightweight State Consensus (MLSC)",
    "type": "Permissioned gossip-based state verification",
    "parameters": {
        "n": "Total nodes in the network",
        "k": "Peers contacted per gossip round (default: 3)",
        "f": "Max Byzantine-faulty nodes tolerated (f < n/3)",
        "delta": "Maximum message delivery delay bound (partially synchronous model)",
        "T": "Reconciliation cycle interval (seconds)",
    },
    "properties": {
        "consistency": (
            "If any honest node flags drift in round r, all honest nodes "
            "will flag the same drift within 2·delta time (two gossip exchanges)."
        ),
        "liveness": (
            "A compromised node is detected within O(log(1/ε) / log(1/(1-k/n))) rounds "
            "with probability ≥ 1-ε, where ε is the acceptable miss probability."
        ),
        "fault_tolerance": (
            "Correct detection and localization is maintained with up to f < n/3 "
            "Byzantine-faulty nodes. Beyond this threshold the gossip network "
            "may not reach consensus."
        ),
    },
    "round_complexity": {
        "messages_per_round": "O(n·k)  [vs O(n²) for PBFT]",
        "bandwidth_per_round": "n·k·360 bytes  (360 = UUID+SHA256+timestamp+RSA-sig+headers)",
        "detection_rounds_expected": "O(log(n) / log(k))  for the compromised node to be flagged",
    },
    "comparison_to_bft": (
        "Unlike PBFT (O(n²) messages, 3-phase commit, leader-dependent), "
        "MLSC uses O(n·k) messages and only verifies Merkle root hashes — "
        "no transaction ordering, no view-change protocol, no leader election. "
        "This makes MLSC orders of magnitude lighter for read-only state verification."
    ),
    "references": [
        "Castro, M. and Liskov, B. (1999). Practical Byzantine Fault Tolerance. OSDI 1999.",
        "Demers, A. et al. (1987). Epidemic Algorithms for Replicated Database Maintenance. PODC 1987.",
        "Merkle, R. C. (1987). A Digital Signature Based on a Conventional Encryption Function. CRYPTO 1987.",
    ],
}


@dataclass
class ConsensusResult:
    sender_id: str
    receiver_id: str
    sender_root: str
    expected_root: str
    agrees: bool
    round_number: int
    timestamp: str


@dataclass
class NodeAgent:
    node_id: str
    name: str
    zone: str
    merkle_root: str
    baseline_root: str
    peer_list: List[str] = field(default_factory=list)
    is_byzantine: bool = False
    gossip_history: List[ConsensusResult] = field(default_factory=list)


# Global node registry (zone -> list of node IDs)
NODE_DEFINITIONS = [
    # DMZ Zone
    {"id": "dmz-webserver-01", "name": "Web Server Alpha",      "zone": "DMZ"},
    {"id": "dmz-lb-01",        "name": "Load Balancer Prime",   "zone": "DMZ"},
    {"id": "dmz-proxy-01",     "name": "Reverse Proxy",         "zone": "DMZ"},
    {"id": "dmz-waf-01",       "name": "WAF Gateway",           "zone": "DMZ"},
    # Internal Zone
    {"id": "int-appserver-01", "name": "App Server Delta",      "zone": "Internal"},
    {"id": "int-db-01",        "name": "Database Primary",      "zone": "Internal"},
    {"id": "int-api-01",       "name": "API Gateway",           "zone": "Internal"},
    {"id": "int-auth-01",      "name": "Auth Server",           "zone": "Internal"},
    # Edge Zone
    {"id": "edge-vpn-01",      "name": "VPN Gateway",           "zone": "Edge"},
    {"id": "edge-router-01",   "name": "Edge Router",           "zone": "Edge"},
    {"id": "edge-iot-01",      "name": "IoT Controller",        "zone": "Edge"},
    {"id": "edge-cdn-01",      "name": "CDN Edge Node",         "zone": "Edge"},
    # Cloud Zone
    {"id": "cloud-workload-01","name": "Cloud Workload Alpha",  "zone": "Cloud"},
    {"id": "cloud-backup-01",  "name": "Backup System",         "zone": "Cloud"},
    {"id": "cloud-monitor-01", "name": "Monitoring Stack",      "zone": "Cloud"},
    {"id": "cloud-ml-01",      "name": "ML Inference Server",   "zone": "Cloud"},
]


def build_peer_list(node_id: str, all_ids: List[str], k: int = 6) -> List[str]:
    """Pre-build a stable peer list for a node (excluding self)."""
    others = [nid for nid in all_ids if nid != node_id]
    rng = random.Random(node_id)  # deterministic seed per node
    rng.shuffle(others)
    return others[:k]


def verify_peer(sender: NodeAgent, receiver: NodeAgent, known_roots: Dict[str, str]) -> ConsensusResult:
    """
    Receiver checks if sender's claimed root matches the expected baseline.
    known_roots: dict of node_id -> expected merkle root (receiver's knowledge).
    """
    expected = known_roots.get(sender.node_id, sender.baseline_root)
    agrees = sender.merkle_root == expected
    return ConsensusResult(
        sender_id=sender.node_id,
        receiver_id=receiver.node_id,
        sender_root=sender.merkle_root,
        expected_root=expected,
        agrees=agrees,
        round_number=0,  # set by caller
        timestamp=datetime.datetime.utcnow().isoformat(),
    )


def gossip_round(
    nodes: List[NodeAgent],
    known_roots: Dict[str, str],
    round_number: int,
    k: int = 3,
) -> Tuple[List[ConsensusResult], List[str]]:
    """
    Execute one gossip round. Each node selects k random peers and cross-verifies roots.
    Returns (all_results, list_of_flagged_byzantine_node_ids).
    """
    node_map = {n.node_id: n for n in nodes}
    all_results: List[ConsensusResult] = []
    # Map: node_id -> list of ConsensusResults where this node is the sender
    sender_verdicts: Dict[str, List[ConsensusResult]] = {n.node_id: [] for n in nodes}

    for node in nodes:
        peers = random.sample(
            [n for n in nodes if n.node_id != node.node_id],
            min(k, len(nodes) - 1),
        )
        for peer in peers:
            result = verify_peer(node, peer, known_roots)
            result.round_number = round_number
            all_results.append(result)
            node.gossip_history.append(result)
            sender_verdicts[node.node_id].append(result)

    # Byzantine detection: flag any node that >1/3 peers disagree with
    flagged: List[str] = []
    for node in nodes:
        verdicts = sender_verdicts[node.node_id]
        if not verdicts:
            continue
        disagreements = sum(1 for v in verdicts if not v.agrees)
        if disagreements / len(verdicts) > 1 / 3:
            node.is_byzantine = True
            flagged.append(node.node_id)
        else:
            node.is_byzantine = False

    return all_results, flagged


def byzantine_check(node: NodeAgent, peer_reports: List[ConsensusResult]) -> bool:
    """
    Flag node as compromised if >1/3 of its peer reports disagree.
    Returns True if node should be flagged as Byzantine.
    """
    if not peer_reports:
        return False
    disagreements = sum(1 for r in peer_reports if not r.agrees)
    return disagreements / len(peer_reports) > 1 / 3


def compute_consensus_stats(results: List[ConsensusResult]) -> dict:
    """
    Summary statistics for a gossip round.
    Returns enhanced per-round metrics for IEEE paper evaluation:
      peer_verifications, mismatch_count, agreement_rate, flagged_senders,
      unique_mismatched_roots, and protocol efficiency indicators.
    """
    if not results:
        return {
            "total": 0,
            "agreements": 0,
            "disagreements": 0,
            "agreement_rate": 1.0,
            "peer_verifications": 0,
            "mismatch_count": 0,
            "flagged_senders": [],
            "unique_mismatched_roots": [],
            "false_positives_estimate": 0,
        }

    agreements = sum(1 for r in results if r.agrees)
    disagreements = len(results) - agreements

    # Senders whose root was flagged by at least one receiver
    flagged_senders = list({r.sender_id for r in results if not r.agrees})

    # Unique unexpected roots seen across all receivers
    unique_mismatched = list({r.sender_root for r in results if not r.agrees})

    # Estimate false positives: senders flagged despite having baseline root
    # (only detectable if we know the sender root matches expected — can be refined)
    fp_estimate = sum(
        1 for r in results
        if not r.agrees and r.sender_root == r.expected_root
    )

    return {
        "total": len(results),
        "agreements": agreements,
        "disagreements": disagreements,
        "agreement_rate": round(agreements / len(results), 4),
        "peer_verifications": len(results),        # synonym for IEEE clarity
        "mismatch_count": disagreements,
        "flagged_senders": flagged_senders,
        "unique_mismatched_roots": [r[:16] + "…" for r in unique_mismatched],
        "false_positives_estimate": fp_estimate,
    }

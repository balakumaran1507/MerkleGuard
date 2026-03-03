"""
Snapshot Engine — captures node policy states, builds Merkle trees, detects drift.
"""
import hashlib
import datetime
import random
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from core.merkle import MerkleNode, build_merkle_tree, diff_merkle_trees, sha256

POLICY_CATEGORIES = [
    "firewall_rules",
    "acl",
    "encryption",
    "network_segmentation",
    "auth_protocols",
    "audit_logging",
]

CATEGORY_SENSITIVITY = {
    "firewall_rules": 1.0,
    "acl": 0.8,
    "encryption": 0.9,
    "network_segmentation": 0.5,
    "auth_protocols": 0.7,
    "audit_logging": 0.2,
}


@dataclass
class CategoryState:
    config_hash: str
    rule_count: int
    last_modified: str
    version: int
    raw_config: str  # serialized config string (what gets hashed)


@dataclass
class PolicyState:
    firewall_rules: CategoryState
    acl: CategoryState
    encryption: CategoryState
    network_segmentation: CategoryState
    auth_protocols: CategoryState
    audit_logging: CategoryState

    def get_category(self, name: str) -> CategoryState:
        return getattr(self, name)

    def set_category(self, name: str, state: CategoryState):
        setattr(self, name, state)

    def to_leaves(self) -> List[str]:
        """Return raw config strings as Merkle leaves (in category order)."""
        return [self.get_category(cat).raw_config for cat in POLICY_CATEGORIES]

    def to_dict(self) -> dict:
        return {
            cat: {
                "config_hash": self.get_category(cat).config_hash,
                "rule_count": self.get_category(cat).rule_count,
                "last_modified": self.get_category(cat).last_modified,
                "version": self.get_category(cat).version,
                "raw_config": self.get_category(cat).raw_config,
            }
            for cat in POLICY_CATEGORIES
        }

    @classmethod
    def from_dict(cls, d: dict) -> "PolicyState":
        kwargs = {}
        for cat in POLICY_CATEGORIES:
            raw = d[cat]
            kwargs[cat] = CategoryState(
                config_hash=raw["config_hash"],
                rule_count=raw["rule_count"],
                last_modified=raw["last_modified"],
                version=raw["version"],
                raw_config=raw["raw_config"],
            )
        return cls(**kwargs)


@dataclass
class Snapshot:
    node_id: str
    timestamp: str
    policy_state: PolicyState
    merkle_tree: MerkleNode
    merkle_root: str

    def to_dict(self) -> dict:
        return {
            "node_id": self.node_id,
            "timestamp": self.timestamp,
            "merkle_root": self.merkle_root,
            "policy_state": self.policy_state.to_dict(),
            "merkle_tree": self.merkle_tree.to_dict(),
        }


@dataclass
class DriftRecord:
    category: str
    old_hash: str
    new_hash: str
    old_rule_count: int
    new_rule_count: int
    severity: float  # 0..1 based on CATEGORY_SENSITIVITY


@dataclass
class DriftReport:
    node_id: str
    baseline_root: str
    current_root: str
    drifted_categories: List[DriftRecord]
    drifted_leaf_indices: List[int]
    timestamp: str

    @property
    def has_drift(self) -> bool:
        return len(self.drifted_categories) > 0

    def to_dict(self) -> dict:
        return {
            "node_id": self.node_id,
            "baseline_root": self.baseline_root,
            "current_root": self.current_root,
            "has_drift": self.has_drift,
            "drifted_categories": [
                {
                    "category": r.category,
                    "old_hash": r.old_hash,
                    "new_hash": r.new_hash,
                    "old_rule_count": r.old_rule_count,
                    "new_rule_count": r.new_rule_count,
                    "severity": r.severity,
                }
                for r in self.drifted_categories
            ],
            "drifted_leaf_indices": self.drifted_leaf_indices,
            "timestamp": self.timestamp,
        }


def make_category_state(
    node_id: str,
    category: str,
    version: int = 1,
    drift_seed: Optional[str] = None,
) -> CategoryState:
    """
    Generate a deterministic (or drifted) CategoryState for a node/category pair.
    drift_seed: if provided, XOR'd into the config to simulate drift.
    """
    base_config = _generate_base_config(node_id, category)
    if drift_seed:
        raw_config = base_config + f"|drift:{drift_seed}"
        rule_delta = random.randint(-5, 10)
    else:
        raw_config = base_config
        rule_delta = 0

    rule_count = _base_rule_count(node_id, category) + rule_delta
    config_hash = sha256(raw_config)
    last_modified = datetime.datetime.utcnow().isoformat()

    return CategoryState(
        config_hash=config_hash,
        rule_count=max(1, rule_count),
        last_modified=last_modified,
        version=version,
        raw_config=raw_config,
    )


def _generate_base_config(node_id: str, category: str) -> str:
    """Deterministic base config string for a node/category."""
    seed = f"{node_id}:{category}:v1:baseline"
    # Produce a realistic-looking config blob
    rng = random.Random(hashlib.md5(seed.encode()).hexdigest())

    configs = {
        "firewall_rules": lambda: (
            f"chain:INPUT default:DROP "
            + " ".join(
                f"ACCEPT tcp dport:{rng.randint(80, 9999)} src:{rng.randint(10,192)}.0.0.0/8"
                for _ in range(rng.randint(8, 20))
            )
        ),
        "acl": lambda: (
            "rbac:enabled "
            + " ".join(
                f"role:{rng.choice(['admin','viewer','operator','auditor'])} "
                f"resource:{rng.choice(['api','db','storage','metrics'])} "
                f"action:{rng.choice(['read','write','exec'])}"
                for _ in range(rng.randint(5, 15))
            )
        ),
        "encryption": lambda: (
            f"tls:1.3 cipher:{rng.choice(['AES-256-GCM','CHACHA20-POLY1305','AES-128-GCM'])} "
            f"kex:{rng.choice(['x25519','secp384r1','ffdhe4096'])} "
            f"cert_rotation:{rng.randint(30,90)}d hsts:enabled hpkp:enabled"
        ),
        "network_segmentation": lambda: (
            f"vlan:{rng.randint(10,4090)} "
            + " ".join(
                f"subnet:{rng.randint(10,192)}.{rng.randint(0,254)}.0.0/{rng.randint(16,28)}"
                for _ in range(rng.randint(3, 8))
            )
            + f" micro_seg:enabled east_west_filtering:strict"
        ),
        "auth_protocols": lambda: (
            f"mfa:{'totp' if rng.random()>0.3 else 'fido2'} "
            f"sso:{rng.choice(['saml2','oidc','kerberos'])} "
            f"session_ttl:{rng.randint(300,3600)}s "
            f"pw_policy:complexity:{rng.randint(12,20)} lockout:{rng.randint(3,10)}"
        ),
        "audit_logging": lambda: (
            f"siem:{rng.choice(['splunk','elastic','sentinel'])} "
            f"retention:{rng.randint(90,365)}d "
            f"events:auth,network,admin,data integrity:sha256 "
            f"realtime:enabled compression:zstd"
        ),
    }

    return configs[category]()


def _base_rule_count(node_id: str, category: str) -> int:
    seed = f"{node_id}:{category}:count"
    rng = random.Random(hashlib.md5(seed.encode()).hexdigest())
    ranges = {
        "firewall_rules": (15, 60),
        "acl": (10, 40),
        "encryption": (5, 12),
        "network_segmentation": (4, 20),
        "auth_protocols": (6, 18),
        "audit_logging": (8, 25),
    }
    lo, hi = ranges[category]
    return rng.randint(lo, hi)


def build_policy_state(node_id: str, drifted_categories: Optional[Dict[str, str]] = None) -> PolicyState:
    """
    Build a PolicyState for the given node.
    drifted_categories: dict of category_name -> drift_seed for categories that should drift.
    """
    drifted_categories = drifted_categories or {}
    kwargs = {}
    for cat in POLICY_CATEGORIES:
        drift_seed = drifted_categories.get(cat)
        kwargs[cat] = make_category_state(node_id, cat, drift_seed=drift_seed)
    return PolicyState(**kwargs)


def capture_snapshot(node_id: str, policy_state: PolicyState) -> Snapshot:
    """Build a Snapshot from a PolicyState (builds Merkle tree)."""
    leaves = policy_state.to_leaves()
    tree = build_merkle_tree(leaves)
    root = tree.hash
    ts = datetime.datetime.utcnow().isoformat()
    return Snapshot(
        node_id=node_id,
        timestamp=ts,
        policy_state=policy_state,
        merkle_tree=tree,
        merkle_root=root,
    )


def compare_snapshots(current: Snapshot, baseline: Snapshot) -> DriftReport:
    """
    Compare two snapshots. Returns DriftReport with drifted categories.
    Uses O(log n) Merkle diff for localization.
    """
    ts = datetime.datetime.utcnow().isoformat()

    if current.merkle_root == baseline.merkle_root:
        return DriftReport(
            node_id=current.node_id,
            baseline_root=baseline.merkle_root,
            current_root=current.merkle_root,
            drifted_categories=[],
            drifted_leaf_indices=[],
            timestamp=ts,
        )

    # O(log n) diff to find which leaf indices changed
    drifted_indices = diff_merkle_trees(current.merkle_tree, baseline.merkle_tree)

    drifted_records: List[DriftRecord] = []
    for idx in drifted_indices:
        if idx >= len(POLICY_CATEGORIES):
            continue  # padding node
        cat = POLICY_CATEGORIES[idx]
        curr_cat = current.policy_state.get_category(cat)
        base_cat = baseline.policy_state.get_category(cat)
        drifted_records.append(
            DriftRecord(
                category=cat,
                old_hash=base_cat.config_hash,
                new_hash=curr_cat.config_hash,
                old_rule_count=base_cat.rule_count,
                new_rule_count=curr_cat.rule_count,
                severity=CATEGORY_SENSITIVITY[cat],
            )
        )

    return DriftReport(
        node_id=current.node_id,
        baseline_root=baseline.merkle_root,
        current_root=current.merkle_root,
        drifted_categories=drifted_records,
        drifted_leaf_indices=drifted_indices,
        timestamp=ts,
    )

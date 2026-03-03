"""
Formal Threat Model for MerkleGuard.
Served as JSON via GET /api/threat-model for IEEE reviewer transparency.
"""

THREAT_MODEL = {
    "system": "MerkleGuard — Merkle-Tree Based State Snapshot Reconciliation Engine",
    "version": "1.0",
    "adversary_capability": (
        "Can compromise up to f < n/3 nodes. "
        "Can modify local policy configurations AND local snapshot agents on compromised nodes. "
        "Can collude across compromised nodes and fabricate arbitrary local state."
    ),
    "adversary_limitation": (
        "Cannot forge a policy authority signature without the private key. "
        "Cannot compromise more than floor(n/3) nodes simultaneously (Byzantine threshold). "
        "Cannot prevent honest nodes from communicating with each other."
    ),
    "network_model": (
        "Partially synchronous: messages are eventually delivered within a bounded delay delta. "
        "Network partitions are transient. No adversarial control over routing."
    ),
    "trust_assumptions": [
        (
            "Snapshot integrity on non-compromised nodes is enforced via TEE/TPM attestation "
            "(e.g., Intel SGX, ARM TrustZone). This is orthogonal to MerkleGuard's contribution "
            "and consistent with the threat models of OSSEC, Tripwire, and Wazuh."
        ),
        (
            "The policy baseline is signed by a policy authority using threshold signatures "
            "(m-of-n scheme, default 2-of-3). MerkleGuard verifies the signature before "
            "every reconciliation cycle, refusing to reconcile against a tampered baseline."
        ),
        (
            "SHA-256 is computationally collision-resistant under standard cryptographic "
            "assumptions (random oracle model). No length-extension attack surface exists "
            "since we use SHA-256(left || right) without truncation."
        ),
    ],
    "scope": (
        "MerkleGuard solves drift DETECTION and LOCALIZATION only. "
        "It does NOT claim to solve: (1) snapshot integrity on a fully compromised host, "
        "(2) baseline provisioning security, or (3) network-layer attacks. "
        "Cross-node gossip consensus serves as a second detection layer independent of "
        "per-node snapshot integrity."
    ),
    "out_of_scope": (
        "Snapshot agent integrity on a compromised host is assumed to be provided by "
        "Intel SGX / ARM TrustZone / TPM. This limitation is shared by OSSEC, Tripwire, "
        "and Wazuh. MerkleGuard's cross-node Merkle-root consensus is designed as a "
        "complementary second layer of detection that operates even when individual "
        "snapshot agents are partially compromised."
    ),
    "security_properties": {
        "soundness": (
            "If a node's Merkle root deviates from the signed baseline, "
            "at least one honest peer will detect the mismatch within one gossip round."
        ),
        "completeness": (
            "If no drift occurred, the Merkle roots are identical and no false positive "
            "is raised by any honest node."
        ),
        "localization": (
            "The O(log n) tree traversal identifies the exact drifted policy category "
            "without full policy comparison. Localization complexity is O(log k) where "
            "k is the number of policy leaf categories."
        ),
        "fault_tolerance": (
            "Correct operation is maintained with up to f < n/3 Byzantine-faulty nodes. "
            "Flagging threshold: node is Byzantine if >1/3 of its reporting peers disagree."
        ),
    },
    "comparison_to_prior_art": {
        "OSSEC": "Hash-based file integrity monitoring — no Merkle tree, no gossip consensus, no O(log n) localization.",
        "Tripwire": "Centralized diff — single point of failure, no distributed consensus.",
        "Wazuh": "Rule-based anomaly — no cryptographic proof of state, no peer verification.",
        "MerkleGuard_advantage": (
            "Combines Merkle-tree O(log n) drift localization with gossip-based peer consensus "
            "and temporal anomaly scoring — providing detection, localization, and attribution "
            "in a single unified pipeline without a trusted central authority."
        ),
    },
}

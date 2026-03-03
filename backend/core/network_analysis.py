"""
Communication Cost & Scalability Analysis for MerkleGuard's gossip protocol.
Computes bandwidth overhead and detection probability across fleet sizes.
"""

# ─── Message payload breakdown ────────────────────────────────────────────────

MESSAGE_PAYLOAD = {
    "node_id_bytes":    16,   # UUID v4
    "merkle_root_bytes": 32,  # SHA-256 digest
    "timestamp_bytes":   8,   # 64-bit Unix epoch ms
    "signature_bytes":  256,  # RSA-2048 signature
    "headers_bytes":    48,   # protocol overhead
}
MESSAGE_SIZE_BYTES = sum(MESSAGE_PAYLOAD.values())  # = 360


def _format_bytes(n: int) -> str:
    """Human-readable byte size."""
    if n < 1024:
        return f"{n} B"
    elif n < 1024 ** 2:
        return f"{n / 1024:.2f} KB"
    elif n < 1024 ** 3:
        return f"{n / 1024**2:.2f} MB"
    else:
        return f"{n / 1024**3:.2f} GB"


def calculate_gossip_overhead(n_nodes: int, k_peers: int, rounds: int = 1) -> dict:
    """
    Calculate communication cost and detection probability for one gossip configuration.

    Detection probability model:
      f = floor(n/3)              # max Byzantine nodes (threshold)
      p_not = ((n - k - 1) / (n - 1))^(n - f - 1)
                                  # prob. a compromised node is NOT contacted by
                                  # any honest node in one round
      p_single = 1 - p_not       # prob. detected in one round
      p_multi   = 1 - (1 - p_single)^rounds
                                  # prob. detected within `rounds` rounds

    Message complexity: O(n * k) per round (vs O(n^2) for all-to-all PBFT).
    """
    messages_per_round = n_nodes * k_peers
    bandwidth_bytes = messages_per_round * MESSAGE_SIZE_BYTES

    f = n_nodes // 3  # Byzantine threshold

    # Detection probability
    denom = max(n_nodes - 1, 1)
    p_not = ((n_nodes - k_peers - 1) / denom) ** max(n_nodes - f - 1, 0)
    p_single = 1.0 - p_not
    p_multi = 1.0 - (1.0 - p_single) ** rounds

    return {
        "nodes": n_nodes,
        "k_peers": k_peers,
        "rounds": rounds,
        "messages_per_round": messages_per_round,
        "bandwidth_bytes": bandwidth_bytes,
        "bandwidth_human": _format_bytes(bandwidth_bytes * rounds),
        "detection_probability": round(max(0.0, min(1.0, p_multi)), 4),
        "max_compromised_f": f,
        "message_complexity": f"O(n·k) = O({n_nodes}·{k_peers}) = {messages_per_round} msgs/round",
        "message_payload_breakdown": MESSAGE_PAYLOAD,
        "message_size_bytes": MESSAGE_SIZE_BYTES,
        "vs_pbft_messages": n_nodes * (n_nodes - 1),  # PBFT O(n^2)
        "savings_over_pbft_pct": round(
            (1 - messages_per_round / max(n_nodes * (n_nodes - 1), 1)) * 100, 1
        ),
    }


# Configurations to benchmark: (n_nodes, k_peers, rounds)
_SCALABILITY_CONFIGS = [
    (16,    3, 1),
    (16,    3, 3),
    (50,    3, 1),
    (50,    3, 3),
    (100,   3, 1),
    (100,   5, 1),
    (500,   5, 1),
    (500,   5, 3),
    (1000,  5, 1),
    (1000,  5, 5),
]


def generate_scalability_table() -> list:
    """
    Run calculate_gossip_overhead across the standard benchmark configurations.
    Returns a list of result dicts suitable for tabular display.
    """
    table = []
    for n, k, r in _SCALABILITY_CONFIGS:
        row = calculate_gossip_overhead(n, k, r)
        table.append(row)
    return table


def get_protocol_overhead_summary() -> dict:
    """High-level summary comparing MerkleGuard gossip vs naive and PBFT."""
    n = 16  # default fleet size
    k = 3
    r = 1
    our = calculate_gossip_overhead(n, k, r)
    return {
        "fleet_size": n,
        "merkleguard_gossip": {
            "messages_per_round": our["messages_per_round"],
            "bandwidth_per_round": our["bandwidth_human"],
            "complexity": f"O(n·k) = O({n}·{k})",
        },
        "naive_full_comparison": {
            "messages_per_round": n * (n - 1),
            "bandwidth_per_round": _format_bytes(n * (n - 1) * MESSAGE_SIZE_BYTES),
            "complexity": f"O(n²) = O({n}²) = {n*(n-1)}",
        },
        "pbft": {
            "messages_per_round": n * (n - 1),
            "complexity": f"O(n²)",
            "note": "PBFT includes 3-phase commit; MerkleGuard only verifies state hashes.",
        },
        "reduction_factor": round(n * (n - 1) / max(our["messages_per_round"], 1), 2),
    }

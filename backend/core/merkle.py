"""
Merkle Tree Engine — SHA-256 based Merkle tree with O(log n) diff traversal.
"""
import hashlib
from dataclasses import dataclass, field
from typing import Optional, List, Tuple


def sha256(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


@dataclass
class MerkleNode:
    hash: str
    left: Optional["MerkleNode"] = field(default=None, repr=False)
    right: Optional["MerkleNode"] = field(default=None, repr=False)
    data: Optional[str] = None
    level: int = 0       # depth from root (0 = root)
    position: int = 0    # horizontal index at this level

    def is_leaf(self) -> bool:
        return self.left is None and self.right is None

    def to_dict(self) -> dict:
        return {
            "hash": self.hash,
            "left": self.left.to_dict() if self.left else None,
            "right": self.right.to_dict() if self.right else None,
            "data": self.data,
            "level": self.level,
            "position": self.position,
            "is_leaf": self.is_leaf(),
        }

    @classmethod
    def from_dict(cls, d: dict) -> "MerkleNode":
        node = cls(
            hash=d["hash"],
            data=d.get("data"),
            level=d.get("level", 0),
            position=d.get("position", 0),
        )
        if d.get("left"):
            node.left = cls.from_dict(d["left"])
        if d.get("right"):
            node.right = cls.from_dict(d["right"])
        return node


def build_merkle_tree(leaves: List[str]) -> MerkleNode:
    """
    Build a Merkle tree from a list of leaf data strings.
    Returns the root MerkleNode.
    Each leaf is SHA-256 hashed; parent = SHA256(left.hash + right.hash).
    """
    if not leaves:
        return MerkleNode(hash=sha256("empty_tree"), level=0, position=0)

    # Create leaf nodes
    current: List[MerkleNode] = []
    for i, leaf_data in enumerate(leaves):
        node = MerkleNode(hash=sha256(leaf_data), data=leaf_data, level=0, position=i)
        current.append(node)

    max_depth = 0
    while len(current) > 1:
        max_depth += 1
        if len(current) % 2 == 1:
            # Duplicate last leaf to make even count (standard Merkle padding)
            dup = MerkleNode(
                hash=current[-1].hash,
                data=current[-1].data,
                level=current[-1].level,
                position=len(current),
            )
            current.append(dup)

        next_level: List[MerkleNode] = []
        for i in range(0, len(current), 2):
            left = current[i]
            right = current[i + 1]
            parent_hash = sha256(left.hash + right.hash)
            parent = MerkleNode(
                hash=parent_hash,
                left=left,
                right=right,
                level=0,        # placeholder, will be set below
                position=i // 2,
            )
            next_level.append(parent)
        current = next_level

    root = current[0]
    # Assign level (depth from root) with DFS
    _assign_levels(root, 0)
    return root


def _assign_levels(node: MerkleNode, depth: int) -> None:
    """Assign depth-from-root to every node in the tree."""
    node.level = depth
    if node.left:
        _assign_levels(node.left, depth + 1)
    if node.right:
        _assign_levels(node.right, depth + 1)


def get_merkle_root(tree: MerkleNode) -> str:
    return tree.hash


def _count_leaves(node: Optional[MerkleNode]) -> int:
    if node is None:
        return 0
    if node.is_leaf():
        return 1
    return _count_leaves(node.left) + _count_leaves(node.right)


def get_merkle_proof(
    tree: MerkleNode, leaf_index: int
) -> List[Tuple[str, str]]:
    """
    Returns the Merkle proof (sibling path) for the leaf at leaf_index.
    Each tuple: (sibling_hash, direction) where direction = 'L' | 'R'.
    """
    proof: List[Tuple[str, str]] = []
    _collect_proof(tree, leaf_index, 0, proof)
    return proof


def _collect_proof(
    node: MerkleNode,
    target_index: int,
    current_offset: int,
    proof: List[Tuple[str, str]],
) -> bool:
    """Returns True if target was found in this subtree."""
    if node.is_leaf():
        return current_offset == target_index

    left_leaves = _count_leaves(node.left)
    if target_index < current_offset + left_leaves:
        # Target is in the left subtree
        found = _collect_proof(node.left, target_index, current_offset, proof)
        if found and node.right:
            proof.append((node.right.hash, "R"))
        return found
    else:
        # Target is in the right subtree
        found = _collect_proof(
            node.right, target_index, current_offset + left_leaves, proof
        )
        if found and node.left:
            proof.append((node.left.hash, "L"))
        return found


def verify_merkle_proof(root: str, leaf_data: str, proof: List[Tuple[str, str]]) -> bool:
    """
    Verify a Merkle inclusion proof.
    leaf_data: original leaf content (will be SHA-256 hashed).
    proof: list of (sibling_hash, direction) from leaf to root.
    """
    current_hash = sha256(leaf_data)
    for sibling_hash, direction in proof:
        if direction == "R":
            # current node is left child
            current_hash = sha256(current_hash + sibling_hash)
        else:
            # current node is right child
            current_hash = sha256(sibling_hash + current_hash)
    return current_hash == root


def tree_to_levels(root: MerkleNode) -> List[List[str]]:
    """
    Convert a Merkle tree to a levels array format.
    Returns [[leaf_hashes...], [parent_hashes...], ..., [root_hash]]
    """
    if not root:
        return []

    levels_dict = {}

    def collect_levels(node: MerkleNode):
        if node is None:
            return
        if node.level not in levels_dict:
            levels_dict[node.level] = []
        levels_dict[node.level].append(node.hash)
        if node.left:
            collect_levels(node.left)
        if node.right:
            collect_levels(node.right)

    collect_levels(root)

    # Convert to list of lists, ordered from leaves to root
    max_level = max(levels_dict.keys())
    return [levels_dict.get(i, []) for i in range(max_level, -1, -1)]


def diff_merkle_trees(tree_a: MerkleNode, tree_b: MerkleNode) -> List[int]:
    """
    O(log n) drift localization: returns leaf indices where trees differ.
    Only descends into subtrees where hashes diverge.
    """
    diffs: List[int] = []
    _diff_recursive(tree_a, tree_b, 0, diffs)
    return diffs


def _diff_recursive(
    node_a: MerkleNode,
    node_b: MerkleNode,
    leaf_offset: int,
    diffs: List[int],
) -> None:
    if node_a.hash == node_b.hash:
        return  # Subtrees identical — skip entirely (key O(log n) property)

    if node_a.is_leaf() or node_b.is_leaf():
        diffs.append(leaf_offset)
        return

    left_leaves = _count_leaves(node_a.left)
    if node_a.left and node_b.left:
        _diff_recursive(node_a.left, node_b.left, leaf_offset, diffs)
    if node_a.right and node_b.right:
        _diff_recursive(node_a.right, node_b.right, leaf_offset + left_leaves, diffs)

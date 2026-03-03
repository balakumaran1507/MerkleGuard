"""
Signed Baseline Authority for MerkleGuard.
Uses RSA-2048 to sign Merkle roots of golden policy states.
Simulates a 2-of-3 threshold approval scheme for baseline updates.
"""
import datetime
import hashlib
from dataclasses import dataclass, field
from typing import List, Optional

from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.exceptions import InvalidSignature

from core.merkle import build_merkle_tree


# ─── Exceptions ───────────────────────────────────────────────────────────────

class BaselineTamperAlert(Exception):
    """Raised when baseline signature verification fails."""
    def __init__(self, msg: str = "Baseline signature verification failed — possible tampering"):
        super().__init__(msg)
        self.msg = msg
        self.timestamp = datetime.datetime.utcnow().isoformat()

    def to_dict(self) -> dict:
        return {"alert": "BaselineTamperAlert", "message": self.msg, "timestamp": self.timestamp}


# ─── Models ───────────────────────────────────────────────────────────────────

@dataclass
class SignedBaseline:
    root_hash: str
    signature: str          # hex-encoded RSA signature
    public_key_pem: str
    signed_at: str          # ISO 8601
    signed_by: str          # authority identifier
    approvers: List[str] = field(default_factory=list)
    is_current: bool = True

    def to_dict(self) -> dict:
        return {
            "root_hash": self.root_hash,
            "signature": self.signature,
            "public_key_pem": self.public_key_pem,
            "signed_at": self.signed_at,
            "signed_by": self.signed_by,
            "approvers": self.approvers,
            "is_current": self.is_current,
        }


# ─── Authority ────────────────────────────────────────────────────────────────

class BaselineAuthority:
    """
    Manages signed baselines for MerkleGuard.
    Generates an RSA-2048 keypair at init.
    Maintains history of all signed baselines.
    """

    REQUIRED_APPROVERS = 2   # simulated 2-of-3 threshold
    AUTHORITY_ID = "merkleguard-policy-authority-v1"

    def __init__(self):
        self._private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        self._public_key = self._private_key.public_key()
        self._public_key_pem: str = self._public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        ).decode("utf-8")

        self._history: List[SignedBaseline] = []
        self._current: Optional[SignedBaseline] = None
        self._tamper_log: List[dict] = []

    # ── Core signing ─────────────────────────────────────────────────────────

    def _compute_root_hash(self, policy_state: dict) -> str:
        """
        Build a Merkle tree from the policy state values and return the root hash.
        Leaves are SHA-256 of each category's raw_config (in sorted key order).
        """
        categories = sorted(policy_state.keys())
        leaves = []
        for cat in categories:
            cat_data = policy_state[cat]
            if isinstance(cat_data, dict):
                raw = cat_data.get("raw_config") or str(cat_data)
            else:
                raw = str(cat_data)
            leaves.append(raw)
        tree = build_merkle_tree(leaves)
        return tree.hash

    def _sign(self, message: str) -> str:
        """Sign a message string with RSA-PSS SHA-256. Returns hex-encoded signature."""
        sig_bytes = self._private_key.sign(
            message.encode("utf-8"),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH,
            ),
            hashes.SHA256(),
        )
        return sig_bytes.hex()

    def _verify_sig(self, message: str, signature_hex: str, public_key_pem: str) -> bool:
        """Verify an RSA-PSS signature. Returns True if valid."""
        try:
            pub_key = serialization.load_pem_public_key(public_key_pem.encode("utf-8"))
            pub_key.verify(
                bytes.fromhex(signature_hex),
                message.encode("utf-8"),
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH,
                ),
                hashes.SHA256(),
            )
            return True
        except (InvalidSignature, ValueError, Exception):
            return False

    # ── Public API ────────────────────────────────────────────────────────────

    def sign_baseline(
        self,
        policy_state: dict,
        signed_by: str = None,
        approvers: List[str] = None,
    ) -> SignedBaseline:
        """
        Build Merkle tree of the golden policy state, sign the root hash.
        Returns a SignedBaseline.
        """
        root_hash = self._compute_root_hash(policy_state)
        signature = self._sign(root_hash)
        ts = datetime.datetime.utcnow().isoformat()

        sb = SignedBaseline(
            root_hash=root_hash,
            signature=signature,
            public_key_pem=self._public_key_pem,
            signed_at=ts,
            signed_by=signed_by or self.AUTHORITY_ID,
            approvers=approvers or [],
            is_current=True,
        )
        return sb

    def verify_baseline(self, signed_baseline: SignedBaseline) -> bool:
        """
        Verify the RSA-PSS signature on the baseline root hash.
        Returns True if valid. On failure, logs the tamper attempt.
        Raises BaselineTamperAlert if called in strict mode (use verify_or_raise).
        """
        valid = self._verify_sig(
            signed_baseline.root_hash,
            signed_baseline.signature,
            signed_baseline.public_key_pem,
        )
        if not valid:
            self._tamper_log.append({
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "root_hash": signed_baseline.root_hash,
                "signed_by": signed_baseline.signed_by,
                "result": "TAMPER_DETECTED",
            })
        return valid

    def verify_or_raise(self, signed_baseline: SignedBaseline) -> None:
        """Verify baseline and raise BaselineTamperAlert if invalid."""
        if not self.verify_baseline(signed_baseline):
            raise BaselineTamperAlert(
                f"Baseline root {signed_baseline.root_hash[:16]}… signature invalid — "
                f"signed by {signed_baseline.signed_by} at {signed_baseline.signed_at}"
            )

    def update_baseline(
        self,
        new_policy_state: dict,
        approvers: List[str],
        signed_by: str = None,
    ) -> SignedBaseline:
        """
        Update the signed baseline. Requires >= REQUIRED_APPROVERS approvers.
        Archives the previous baseline before signing the new one.
        """
        if len(approvers) < self.REQUIRED_APPROVERS:
            raise ValueError(
                f"Baseline update requires at least {self.REQUIRED_APPROVERS} approvers, "
                f"got {len(approvers)}: {approvers}"
            )

        # Archive current
        if self._current:
            self._current.is_current = False
            self._history.append(self._current)

        new_baseline = self.sign_baseline(
            new_policy_state,
            signed_by=signed_by or self.AUTHORITY_ID,
            approvers=approvers,
        )
        self._current = new_baseline
        return new_baseline

    def set_current(self, signed_baseline: SignedBaseline) -> None:
        """Replace the current baseline (called at startup)."""
        if self._current:
            self._current.is_current = False
            self._history.append(self._current)
        self._current = signed_baseline

    @property
    def current(self) -> Optional[SignedBaseline]:
        return self._current

    @property
    def history(self) -> List[SignedBaseline]:
        return list(self._history)

    @property
    def tamper_log(self) -> List[dict]:
        return list(self._tamper_log)

    def public_key_pem(self) -> str:
        return self._public_key_pem


# ─── Singleton ────────────────────────────────────────────────────────────────

# Module-level singleton — imported by main.py for initialization and routes.py for verification
authority = BaselineAuthority()

"""
MerkleGuard — FastAPI Application Entry Point.
Initializes DB, seeds nodes, signs baseline, starts background simulation, mounts routes.
"""
import asyncio
import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models.database import init_db, SessionLocal, NodeDB, SignedBaselineDB
from core.simulator import engine
from core.baseline_authority import authority as baseline_authority
from core.metrics_tracker import tracker as metrics_tracker
from api.routes import router


def seed_nodes(db):
    """Seed the 16 nodes into SQLite if not already present."""
    from core.consensus import NODE_DEFINITIONS
    existing = {row.id for row in db.query(NodeDB).all()}
    for nd in NODE_DEFINITIONS:
        if nd["id"] not in existing:
            node = engine.get_node(nd["id"])
            db_node = NodeDB(
                id=nd["id"],
                name=nd["name"],
                zone=nd["zone"],
                status="compliant",
                current_merkle_root=node.baseline_root if node else "",
                created_at=datetime.datetime.utcnow(),
            )
            db.add(db_node)
    db.commit()


def sign_initial_baseline(db):
    """
    Generate and persist the initial signed baseline from node policy states.
    Called at startup if no baseline exists in the DB.
    """
    existing = db.query(SignedBaselineDB).filter(SignedBaselineDB.is_current == 1).first()
    if existing:
        # Reload baseline from DB into authority memory
        from core.baseline_authority import SignedBaseline
        sb = SignedBaseline(
            root_hash=existing.root_hash,
            signature=existing.signature,
            public_key_pem=existing.public_key_pem,
            signed_at=existing.signed_at.isoformat() if existing.signed_at else datetime.datetime.utcnow().isoformat(),
            signed_by=existing.signed_by,
            approvers=existing.approvers_json or [],
            is_current=True,
        )
        baseline_authority.set_current(sb)
        return

    # Build aggregate policy state from all nodes' baselines
    all_nodes = engine.get_all_nodes()
    aggregate_state = {
        node.node_id: node.baseline_policy.to_dict()
        for node in all_nodes
    }

    signed = baseline_authority.sign_baseline(
        policy_state=aggregate_state,
        signed_by="merkleguard-policy-authority-v1",
        approvers=["authority-key-01", "authority-key-02"],
    )
    baseline_authority.set_current(signed)

    # Persist to DB
    db_row = SignedBaselineDB(
        root_hash=signed.root_hash,
        signature=signed.signature,
        public_key_pem=signed.public_key_pem,
        signed_at=datetime.datetime.utcnow(),
        signed_by=signed.signed_by,
        approvers_json=signed.approvers,
        is_current=1,
    )
    db.add(db_row)
    db.commit()


async def _instrumented_run_continuous(interval_seconds: int = 10):
    """Wrapper around engine.run_continuous that records metrics per cycle."""
    engine.running = True
    cycle = 0
    import random
    while engine.running:
        await asyncio.sleep(interval_seconds)
        if not engine.running:
            break

        cycle += 1
        # Occasionally inject natural drift to keep the demo lively
        if cycle % 3 == 0:
            candidates = [n for n in engine.get_all_nodes() if n.status == "compliant"]
            if candidates:
                target = random.choice(candidates)
                result = engine.inject_natural_drift(target.node_id)
                if result:
                    for cat in result["categories"]:
                        metrics_tracker.record_injection(target.node_id, cat)

        cycle_result = await engine.run_cycle()
        metrics_tracker.record_cycle()

        # Record consensus stats into metrics_tracker
        if engine.consensus_history:
            last_round = engine.consensus_history[-1]
            stats = last_round.get("stats", {})
            flagged = last_round.get("flagged", [])
            metrics_tracker.record_consensus_round(
                round_number=last_round.get("round", 0),
                total_checks=stats.get("total", 0),
                agreements=stats.get("agreements", 0),
                disagreements=stats.get("disagreements", 0),
                flagged_nodes=flagged,
                honest_nodes_flagged=0,   # refined in detection loop
                compromised_nodes_missed=0,
            )

        # Record baseline verification
        current_baseline = baseline_authority.current
        if current_baseline:
            valid = baseline_authority.verify_baseline(current_baseline)
            metrics_tracker.record_baseline_verification(valid)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ───────────────────────────────────────────────────────
    init_db()
    db = SessionLocal()
    try:
        seed_nodes(db)
        sign_initial_baseline(db)
    finally:
        db.close()

    # Start instrumented continuous simulation (10s interval per spec)
    task = asyncio.create_task(_instrumented_run_continuous(interval_seconds=10))
    yield

    # ── Shutdown ──────────────────────────────────────────────────────
    engine.stop()
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="MerkleGuard API",
    description="Merkle-Tree Based State Snapshot Reconciliation Engine for Zero-Trust Policy Compliance",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=False, log_level="info")

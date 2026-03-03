import datetime
from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.types import JSON

SQLALCHEMY_DATABASE_URL = "sqlite:///./merkleguard.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    json_serializer=lambda obj: __import__("json").dumps(obj),
    json_deserializer=lambda s: __import__("json").loads(s),
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


class NodeDB(Base):
    __tablename__ = "nodes"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    zone = Column(String, nullable=False)
    status = Column(String, default="compliant")
    current_merkle_root = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class SnapshotDB(Base):
    __tablename__ = "snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    node_id = Column(String, nullable=False, index=True)
    merkle_root = Column(String)
    policy_state = Column(JSON)
    captured_at = Column(DateTime, default=datetime.datetime.utcnow)


class DriftEventDB(Base):
    __tablename__ = "drift_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    node_id = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False)
    old_hash = Column(String)
    new_hash = Column(String)
    anomaly_score = Column(Float, default=0.0)
    classification = Column(String, default="routine")
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)


class ReconcileActionDB(Base):
    __tablename__ = "reconcile_actions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    drift_event_id = Column(Integer)
    action_type = Column(String)
    details = Column(JSON)
    executed_at = Column(DateTime, default=datetime.datetime.utcnow)


class AuditLogDB(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_type = Column(String, nullable=False)
    node_id = Column(String)
    before_root = Column(String)
    after_root = Column(String)
    meta = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ConsensusRoundDB(Base):
    __tablename__ = "consensus_rounds"

    id = Column(Integer, primary_key=True, autoincrement=True)
    round_number = Column(Integer)
    participating_nodes = Column(JSON)
    results = Column(JSON)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)


class SignedBaselineDB(Base):
    """Persists signed baseline records including RSA signature and approver list."""
    __tablename__ = "signed_baselines"

    id = Column(Integer, primary_key=True, autoincrement=True)
    root_hash = Column(String, nullable=False)
    signature = Column(String, nullable=False)       # hex-encoded RSA-PSS sig
    public_key_pem = Column(String, nullable=False)
    signed_at = Column(DateTime, default=datetime.datetime.utcnow)
    signed_by = Column(String, nullable=False)
    approvers_json = Column(JSON)                    # list[str]
    is_current = Column(Integer, default=1)          # 1=current, 0=archived


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

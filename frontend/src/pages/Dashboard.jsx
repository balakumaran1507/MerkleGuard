import React from "react"
import { StatCard } from "../components/StatCard"
import { ComplianceDonut } from "../components/ComplianceDonut"
import { TimelineItem } from "../components/TimelineItem"
import { useEvents } from "../context/EventContext"
import {
  Server,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Database,
  Fingerprint,
} from "lucide-react"

export function Dashboard() {
  const { stats, nodes, events, nodeStatuses } = useEvents()

  const now = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric"
  })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── Page heading ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              marginBottom: "6px",
            }}
          >
            Security Operations
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
            }}
          >
            Merkle-Tree Consensus · Real-Time
          </p>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--color-text-dim)",
          }}
        >
          {now}
        </span>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        <StatCard label="Total Nodes" value={stats?.total_nodes || 0} subtitle="Enterprise Infrastructure" color="white" icon={Server} />
        <StatCard label="Compliant" value={stats?.compliant_count || 0} subtitle="Verified Baseline" color="green" icon={ShieldCheck} />
        <StatCard label="Drifted" value={stats?.drifted_count || 0} subtitle="Non-Critical Drift" color="amber" icon={TrendingUp} />
        <StatCard label="Critical" value={stats?.critical_count || 0} subtitle="High-Severity Policy Breach" color="red" icon={AlertTriangle} />
        <StatCard label="Snapshots" value={stats?.total_snapshots || 0} subtitle="Platform State Captures" color="cyan" icon={Database} />
        <StatCard label="Avg Anomaly" value={(stats?.avg_anomaly_score || 0).toFixed(3)} subtitle="Global Integrity Variance" color="purple" icon={Fingerprint} />
      </div>

      {/* ── Middle row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

        {/* Compliance Donut */}
        <div className="mg-card" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="flex items-center justify-between">
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
              }}
            >
              Compliance Distribution
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 0" }}>
            <ComplianceDonut stats={stats} />
          </div>
        </div>

        {/* Merkle Root Registry */}
        <div className="mg-card" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="flex items-center justify-between">
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
              }}
            >
              Merkle Root Registry
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                fontWeight: 600,
                padding: "2px 6px",
                borderRadius: "4px",
                background: "var(--color-cyan-dim)",
                border: "1px solid rgba(0,210,255,0.2)",
                color: "var(--color-cyan-500)",
                letterSpacing: "0.08em",
              }}
            >
              AUTO-SYNC
            </span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", maxHeight: "280px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {nodes.map(node => {
              const status = nodeStatuses?.[node.id] || node.status
              const root = node.current_merkle_root || node.merkle_root || ""
              const isOk = status === "compliant"
              const isCrit = status === "critical"

              return (
                <div
                  key={node.id}
                  className="flex items-center justify-between"
                  style={{
                    padding: "8px 10px",
                    borderRadius: "6px",
                    background: isCrit
                      ? "var(--color-status-crit-dim)"
                      : !isOk
                        ? "var(--color-status-warn-dim)"
                        : "var(--color-bg-elevated)",
                    border: `1px solid ${isCrit ? "rgba(240,75,75,0.2)" : !isOk ? "rgba(245,158,11,0.2)" : "var(--color-border-subtle)"}`,
                    transition: "background 0.15s",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {node.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: isOk
                        ? "var(--color-cyan-500)"
                        : isCrit
                          ? "var(--color-status-crit)"
                          : "var(--color-status-warn)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {root.substring(0, 14)}…
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

        {/* Zone Integrity */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
            }}
          >
            Network Zone Integrity
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {["DMZ", "Internal", "Edge", "Cloud"].map(zone => {
              const zoneNodes = nodes.filter(n => n.zone === zone)
              const compliantCount = zoneNodes.filter(n => n.status === "compliant").length
              const total = zoneNodes.length || 1
              const pct = (compliantCount / total) * 100
              const barColor = pct === 100 ? "var(--color-status-ok)" : pct >= 50 ? "var(--color-status-warn)" : "var(--color-status-crit)"

              return (
                <div
                  key={zone}
                  className="mg-card"
                  style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {zone}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "9px",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {compliantCount}/{zoneNodes.length}
                    </span>
                  </div>

                  <div>
                    <div
                      className="flex items-center justify-between mb-1"
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "10px",
                          fontWeight: 700,
                          color: barColor,
                        }}
                      >
                        {Math.round(pct)}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: "3px",
                        borderRadius: "2px",
                        background: "var(--color-bg-elevated)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: barColor,
                          boxShadow: `0 0 8px ${barColor}80`,
                          borderRadius: "2px",
                          transition: "width 1s cubic-bezier(.16,1,.3,1)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Live Event Feed */}
        <div
          className="mg-card"
          style={{
            display: "flex",
            flexDirection: "column",
            height: "380px",
            overflow: "hidden",
          }}
        >
          <div
            className="flex items-center justify-between flex-shrink-0"
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--color-border-default)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
              }}
            >
              Live Event Feed
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="animate-mg-pulse"
                style={{
                  display: "block",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--color-status-ok)",
                  boxShadow: "0 0 6px var(--color-status-ok)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "var(--color-status-ok)",
                }}
              >
                STREAMING
              </span>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {events.length > 0 ? (
              events.map((ev, i) => <TimelineItem key={i} event={ev} />)
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  opacity: 0.3,
                }}
              >
                <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--color-text-dim)" }}>
                  Awaiting Merkle Proofs…
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

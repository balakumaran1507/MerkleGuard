import React, { useState } from "react"
import { useApi } from "../hooks/useApi"
import { useEvents } from "../context/EventContext"
import { AttackCard } from "../components/AttackCard"
import { AnomalyGauge } from "../components/AnomalyGauge"
import { client } from "../api/client"
import { Zap, CheckCircle2, Loader2 } from "lucide-react"

const ATTACKS = [
  { id: "firewall_bypass", name: "Firewall Bypass", description: "Silently disable firewall rules and security groups to allow unauthorized traffic.", severity: "HIGH" },
  { id: "encryption_downgrade", name: "Encryption Downgrade", description: "Downgrade TLS 1.3/1.2 to vulnerable versions (1.0/1.1) to intercept data in transit.", severity: "CRITICAL" },
  { id: "acl_escalation", name: "ACL Escalation", description: "Inject unauthorized admin entries into access control lists on critical network segments.", severity: "HIGH" },
  { id: "coordinated_attack", name: "Coordinated Attack", description: "Multi-node simultaneous drift attempt designed to overwhelm the consensus engine detection layer.", severity: "CRITICAL" },
]

const STEPS = [
  { label: "Snapshot Capture", sub: "Capturing live state snapshots across target nodes" },
  { label: "Merkle Root Comparison", sub: "Comparing against cryptographically-signed baseline" },
  { label: "Tree Traversal", sub: "Localizing policy drift via binary tree walk" },
  { label: "Anomaly Scoring", sub: "Computing weighted integrity variance score" },
  { label: "Reconciliation", sub: "Executing automated remediation action" },
]

const monoLabel = { fontFamily: "var(--font-mono)", fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)" }

export function AttackSimulator() {
  const { data: nodesData } = useApi("/api/nodes")
  const { nodes: contextNodes } = useEvents()
  const nodes = Array.isArray(nodesData) ? nodesData : (nodesData?.nodes || contextNodes || [])

  const [selectedAttackId, setSelectedAttackId] = useState(ATTACKS[0].id)
  const [selectedNodes, setSelectedNodes] = useState([])
  const [isSimulating, setIsSimulating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [simulationResults, setSimulationResults] = useState(null)

  const toggleNode = (id) => setSelectedNodes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleLaunch = async () => {
    setIsSimulating(true)
    setCurrentStep(1)
    try {
      const response = await client.post("/api/simulate/attack", { attack_type: selectedAttackId, target_node_ids: selectedNodes })
      setSimulationResults(response)
      setTimeout(() => setCurrentStep(2), 1500)
      setTimeout(() => setCurrentStep(3), 2500)
      setTimeout(() => setCurrentStep(4), 4500)
      setTimeout(() => setCurrentStep(5), 6000)
      setTimeout(() => setIsSimulating(false), 7500)
    } catch (err) {
      console.error(err)
      setIsSimulating(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Heading */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "22px", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "6px" }}>
            Adversary Simulator
          </h1>
          <p style={{ ...monoLabel }}>Stress-test zero-trust policies with synthetic drift vectors</p>
        </div>
        <button
          onClick={handleLaunch}
          disabled={isSimulating || selectedNodes.length === 0}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
            fontFamily: "var(--font-sans)", cursor: isSimulating || selectedNodes.length === 0 ? "not-allowed" : "pointer",
            background: isSimulating || selectedNodes.length === 0 ? "var(--color-bg-elevated)" : "var(--color-status-crit)",
            color: isSimulating || selectedNodes.length === 0 ? "var(--color-text-muted)" : "#0a0b0f",
            border: "1px solid transparent",
            opacity: selectedNodes.length === 0 ? 0.5 : 1,
            transition: "all 0.2s",
          }}
        >
          <Zap size={13} strokeWidth={2} fill="currentColor" />
          {isSimulating ? "Simulating…" : "Launch Attack"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "16px" }}>
        {/* Attack selection */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ ...monoLabel, display: "block", marginBottom: "6px" }}>Attack Vector</span>
          {ATTACKS.map(attack => (
            <AttackCard
              key={attack.id}
              attack={attack}
              isSelected={selectedAttackId === attack.id}
              onClick={() => !isSimulating && setSelectedAttackId(attack.id)}
            />
          ))}
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Target selector */}
          <div className="mg-card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ ...monoLabel }}>Target Infrastructure</span>
              <button
                onClick={() => setSelectedNodes(nodes.map(n => n.id))}
                style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-cyan-500)", background: "none", border: "none", cursor: "pointer" }}
              >
                SELECT ALL
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {nodes.map(node => {
                const sel = selectedNodes.includes(node.id)
                return (
                  <button
                    key={node.id}
                    onClick={() => !isSimulating && toggleNode(node.id)}
                    style={{
                      padding: "8px 6px", borderRadius: "6px", cursor: "pointer",
                      fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700,
                      letterSpacing: "0.04em",
                      background: sel ? "var(--color-cyan-dim)" : "var(--color-bg-elevated)",
                      border: `1px solid ${sel ? "rgba(0,210,255,0.3)" : "var(--color-border-default)"}`,
                      color: sel ? "var(--color-cyan-500)" : "var(--color-text-muted)",
                      boxShadow: sel ? "0 0 10px rgba(0,210,255,0.15)" : "none",
                      transition: "all 0.15s",
                    }}
                  >
                    {node.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Pipeline */}
          {(isSimulating || simulationResults) && (
            <div className="mg-card animate-mg-fadeIn" style={{ padding: "20px 24px" }}>
              <span style={{ ...monoLabel, display: "block", marginBottom: "20px" }}>Detection Pipeline</span>

              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {STEPS.map((step, idx) => {
                  const stepIdx = idx + 1
                  const isCompleted = currentStep > stepIdx
                  const isActive = currentStep === stepIdx
                  const isPending = currentStep < stepIdx

                  return (
                    <div
                      key={idx}
                      style={{ display: "flex", gap: "14px", opacity: isPending ? 0.3 : 1, transition: "opacity 0.4s" }}
                    >
                      {/* Track */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          background: isCompleted ? "var(--color-status-ok)" : isActive ? "var(--color-cyan-dim)" : "var(--color-bg-elevated)",
                          border: `1.5px solid ${isCompleted ? "var(--color-status-ok)" : isActive ? "var(--color-cyan-500)" : "var(--color-border-default)"}`,
                          color: isCompleted ? "#04050a" : isActive ? "var(--color-cyan-500)" : "var(--color-text-muted)",
                          transition: "all 0.3s",
                        }}>
                          {isCompleted
                            ? <CheckCircle2 size={14} strokeWidth={2.5} />
                            : isActive
                              ? <Loader2 size={13} strokeWidth={2} style={{ animation: "mg-spin-slow 1s linear infinite" }} />
                              : <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700 }}>{stepIdx}</span>
                          }
                        </div>
                        {idx < STEPS.length - 1 && (
                          <div style={{
                            width: "1.5px", flex: 1, minHeight: 20,
                            background: isCompleted ? "var(--color-status-ok)" : "var(--color-border-default)",
                            transition: "background 0.4s",
                            margin: "3px 0",
                          }} />
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, paddingBottom: idx < STEPS.length - 1 ? "16px" : "0" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                          <span style={{ fontFamily: "var(--font-sans)", fontSize: "12.5px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                            {step.label}
                          </span>
                          {isActive && idx === 3 && <AnomalyGauge score={0.842} />}
                        </div>
                        <p style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "var(--color-text-muted)" }}>{step.sub}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {!isSimulating && simulationResults && (
                <div
                  className="animate-mg-fadeIn"
                  style={{
                    marginTop: "16px", padding: "14px 16px",
                    borderRadius: "8px",
                    background: "var(--color-status-ok-dim)",
                    border: "1px solid rgba(16,212,140,0.2)",
                    display: "flex", gap: "12px", alignItems: "flex-start",
                  }}
                >
                  <div style={{ color: "var(--color-status-ok)", marginTop: "1px" }}>
                    <CheckCircle2 size={16} strokeWidth={2} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: 700, color: "var(--color-status-ok)", marginBottom: "4px" }}>
                      Threat Neutralized
                    </p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                      Consensus engine localized drift to {selectedNodes.length} node(s). Automated reconciliation restored baseline state within 1.4s.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

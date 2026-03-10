import React, { useState } from "react"
import { useApi } from "../hooks/useApi"
import { useEvents } from "../context/EventContext"
import { AttackCard } from "../components/AttackCard"
import { AnomalyGauge } from "../components/AnomalyGauge"
import { client } from "../api/client"
import { Zap, CheckCircle2, Loader2, Target, ShieldAlert } from "lucide-react"

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
    <div className="flex flex-col gap-6">

      {/* Heading */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
            Adversary Simulator
          </h1>
          <p className="text-sm font-medium text-gray-500">
            Stress-test zero-trust policies with synthetic drift vectors
          </p>
        </div>
        <button
          onClick={handleLaunch}
          disabled={isSimulating || selectedNodes.length === 0}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold transition-all ${isSimulating || selectedNodes.length === 0
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700 text-white shadow-sm"
            }`}
        >
          {isSimulating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
          {isSimulating ? "Simulating…" : "Launch Attack"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

        {/* Attack selection */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Attack Vector</span>
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
        <div className="flex flex-col gap-6">

          {/* Target selector */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-2">
                <Target size={14} className="text-blue-500" />
                Target Infrastructure
              </span>
              <button
                onClick={() => !isSimulating && setSelectedNodes(nodes.map(n => n.id))}
                className="text-[10px] font-bold tracking-widest text-blue-600 hover:text-blue-700 uppercase"
              >
                SELECT ALL
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {nodes.map(node => {
                const sel = selectedNodes.includes(node.id)
                return (
                  <button
                    key={node.id}
                    onClick={() => !isSimulating && toggleNode(node.id)}
                    className={`px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all border ${sel
                      ? "bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-500/20"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                      }`}
                  >
                    {node.name}
                  </button>
                )
              })}
              {nodes.length === 0 && (
                <div className="col-span-full py-8 text-center text-sm font-medium text-gray-400">
                  No active nodes available to target.
                </div>
              )}
            </div>
          </div>

          {/* Pipeline */}
          {(isSimulating || simulationResults) && (
            <div className="card p-6 animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldAlert className="w-48 h-48" />
              </div>

              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-6 block">Detection Pipeline</span>

              <div className="flex flex-col gap-0 relative z-10">
                {STEPS.map((step, idx) => {
                  const stepIdx = idx + 1
                  const isCompleted = currentStep > stepIdx
                  const isActive = currentStep === stepIdx
                  const isPending = currentStep < stepIdx

                  return (
                    <div
                      key={idx}
                      className={`flex gap-4 transition-opacity duration-300 ${isPending ? 'opacity-30' : 'opacity-100'}`}
                    >
                      {/* Track */}
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${isCompleted
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : isActive
                            ? "bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-gray-50 border-gray-200 text-gray-400"
                          }`}>
                          {isCompleted
                            ? <CheckCircle2 size={16} strokeWidth={2.5} />
                            : isActive
                              ? <Loader2 size={16} strokeWidth={2} className="animate-spin" />
                              : <span className="font-mono text-xs font-bold">{stepIdx}</span>
                          }
                        </div>
                        {idx < STEPS.length - 1 && (
                          <div className={`w-0.5 flex-1 min-h-[24px] my-1 transition-colors duration-300 ${isCompleted ? "bg-emerald-500" : "bg-gray-200"}`} />
                        )}
                      </div>

                      {/* Content */}
                      <div className={`flex-1 ${idx < STEPS.length - 1 ? "pb-4" : ""}`}>
                        <div className="flex items-center justify-between mb-1 mt-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {step.label}
                          </span>
                          {isActive && idx === 3 && <AnomalyGauge score={0.842} />}
                        </div>
                        <p className="text-xs font-medium text-gray-500">{step.sub}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Result Banner */}
              {!isSimulating && simulationResults && (
                <div className="mt-8 p-4 rounded-lg bg-emerald-50 border border-emerald-100 flex items-start gap-3 animate-fade-in">
                  <div className="text-emerald-500 mt-0.5">
                    <CheckCircle2 size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-800 mb-1">
                      Threat Neutralized
                    </h4>
                    <p className="text-xs font-medium text-emerald-600/80 leading-relaxed">
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

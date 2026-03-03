import React, { useState, useEffect } from "react"
import { useApi } from "../hooks/useApi"
import { AttackCard } from "../components/AttackCard"
import { AnomalyGauge } from "../components/AnomalyGauge"
import { client } from "../api/client"
import { clsx } from "clsx"
import { Zap, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

const ATTACKS = [
  { id: "firewall_bypass", name: "Firewall Bypass", description: "Silently disable firewall rules and security groups to allow unauthorized traffic.", severity: "HIGH" },
  { id: "encryption_downgrade", name: "Encryption Downgrade", description: "Downgrade TLS 1.3/1.2 protocols to vulnerable versions (1.0/1.1) to intercept data.", severity: "CRITICAL" },
  { id: "acl_escalation", name: "ACL Escalation", description: "Add unauthorized administrative entries to access control lists on critical segments.", severity: "HIGH" },
  { id: "coordinated_attack", name: "Coordinated Attack", description: "Multi-node simultaneous drift attempt to overwhelm the consensus engine detection.", severity: "CRITICAL" },
]

export function AttackSimulator() {
  const { data: nodesData } = useApi("/api/nodes")
  const [selectedAttackId, setSelectedAttackId] = useState(ATTACKS[0].id)
  const [selectedNodes, setSelectedNodes] = useState([])
  const [isSimulating, setIsSimulating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [simulationResults, setSimulationResults] = useState(null)

  const nodes = nodesData?.nodes || []

  const toggleNode = (id) => {
    setSelectedNodes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleLaunch = async () => {
    setIsSimulating(true)
    setCurrentStep(1)
    
    try {
      const response = await client.post("/api/simulate/attack", {
        attack_type: selectedAttackId,
        target_nodes: selectedNodes
      })
      
      setSimulationResults(response)
      
      // Step animations
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

  const STEPS = [
    { label: "Snapshot Capture", sub: "Capturing state snapshots..." },
    { label: "Merkle Root Comparison", sub: "Comparing Merkle roots..." },
    { label: "Tree Traversal", sub: "Localizing drift via tree traversal..." },
    { label: "Anomaly Scoring", sub: "Calculating anomaly score..." },
    { label: "Reconciliation", sub: "Executing reconciliation action..." },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Adversary Simulator</h1>
          <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Stress-test Zero-Trust Policies with Synthetic Drift Vectors</p>
        </div>
        <button 
          onClick={handleLaunch}
          disabled={isSimulating || selectedNodes.length === 0}
          className="mg-btn-primary bg-mg-red text-white hover:bg-mg-red-dim flex items-center gap-2"
        >
          <Zap size={16} fill="currentColor" />
          <span>Launch Attack Simulation</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Attack Selection */}
        <div className="flex flex-col gap-4">
           <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">Select Attack Vector</h3>
           <div className="grid grid-cols-1 gap-3">
              {ATTACKS.map(attack => (
                <AttackCard 
                  key={attack.id}
                  attack={attack}
                  isSelected={selectedAttackId === attack.id}
                  onClick={() => !isSimulating && setSelectedAttackId(attack.id)}
                />
              ))}
           </div>
        </div>

        {/* Right: Target Selection */}
        <div className="lg:col-span-2 flex flex-col gap-4">
           <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Target Infrastructure</h3>
              <button 
                onClick={() => setSelectedNodes(nodes.map(n => n.id))}
                className="text-[10px] font-bold text-accent-cyan hover:underline"
              >
                SELECT ALL NODES
              </button>
           </div>
           
           <div className="mg-card p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {nodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => !isSimulating && toggleNode(node.id)}
                  className={clsx(
                    "p-3 rounded-lg border text-xs font-mono font-bold transition-all",
                    selectedNodes.includes(node.id)
                      ? "bg-accent-cyan/10 border-accent-cyan text-accent-cyan shadow-sm shadow-accent-cyan/20"
                      : "bg-bg-surface-alt border-border-default text-text-muted hover:border-border-light"
                  )}
                >
                  {node.name}
                </button>
              ))}
           </div>

           {/* Detection Pipeline Visualization */}
           {(isSimulating || simulationResults) && (
             <div className="mg-card p-6 flex flex-col gap-6 animate-mg-fadeIn">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Real-time Detection Pipeline</h3>
                
                <div className="space-y-6">
                   {STEPS.map((step, idx) => {
                     const stepIdx = idx + 1
                     const isCompleted = currentStep > stepIdx
                     const isActive = currentStep === stepIdx
                     const isPending = currentStep < stepIdx

                     return (
                       <div key={idx} className={clsx("flex gap-4 transition-all duration-500", isPending && "opacity-30 grayscale")}>
                          <div className="flex flex-col items-center">
                             <div className={clsx(
                               "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                               isCompleted ? "bg-mg-green border-mg-green text-bg-primary" : 
                               (isActive ? "border-accent-cyan text-accent-cyan" : "border-border-default text-text-muted")
                             )}>
                                {isCompleted ? <CheckCircle2 size={16} /> : (isActive ? <Loader2 size={16} className="animate-spin" /> : <span className="text-[10px]">{stepIdx}</span>)}
                             </div>
                             {idx < STEPS.length - 1 && (
                               <div className={clsx("w-0.5 h-full min-h-[20px] bg-border-default", isCompleted && "bg-mg-green")} />
                             )}
                          </div>
                          
                          <div className="flex-1 pb-4">
                             <div className="flex justify-between items-start">
                                <div>
                                   <h4 className="text-sm font-bold text-text-primary">{step.label}</h4>
                                   <p className="text-xs text-text-dim mt-0.5">{step.sub}</p>
                                </div>
                                {isActive && idx === 3 && (
                                   <div className="animate-mg-fadeIn">
                                      <AnomalyGauge score={0.842} />
                                   </div>
                                )}
                             </div>
                          </div>
                       </div>
                     )
                   })}
                </div>

                {!isSimulating && simulationResults && (
                  <div className="mt-4 p-4 rounded-lg bg-mg-green/5 border border-mg-green/20 flex gap-4 animate-mg-fadeIn">
                     <div className="p-2 rounded bg-mg-green/10 text-mg-green h-fit">
                        <CheckCircle2 size={20} />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-mg-green">Threat Neutralized</h4>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                          Consensus engine successfully localized drift to {selectedNodes.length} nodes. 
                          Automated reconciliation restored state snapshots to verified baseline within 1.4s.
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

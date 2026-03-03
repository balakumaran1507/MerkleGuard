import React from "react"
import { useApi } from "../hooks/useApi"
import { Shield, BookOpen, Lock, Server, Target, Zap, Layers, BarChart4 } from "lucide-react"

export function ThreatModel() {
  const { data: threatData } = useApi("/api/threat-model")
  const { data: specData } = useApi("/api/consensus/spec")

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-12 py-8 animate-mg-fadeIn">
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-4xl font-bold text-text-primary tracking-tight font-serif">Security Architecture & Threat Model</h1>
        <p className="text-sm text-text-muted max-w-2xl mx-auto leading-relaxed italic">
          Formalizing the trust assumptions, adversary capabilities, and cryptographic bounds of the MerkleGuard reconciliation protocol.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Core Model */}
        <div className="lg:col-span-2 flex flex-col gap-12">
          {/* Adversary Model Section */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-border-default pb-4">
                <div className="p-2 bg-mg-red/10 text-mg-red rounded-lg">
                  <Shield size={24} />
                </div>
                <h2 className="text-xl font-bold text-text-primary uppercase tracking-widest text-sm">Section 1: Adversary Model</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  <h3 className="text-[10px] font-bold text-accent-cyan uppercase tracking-widest">Adversary Capabilities</h3>
                  <p className="text-xs text-text-primary leading-relaxed bg-bg-surface-alt/30 p-4 rounded-xl border border-border-default min-h-[100px]">
                    {threatData?.adversary_capability}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-[10px] font-bold text-mg-amber uppercase tracking-widest">Adversary Limitations</h3>
                  <p className="text-xs text-text-primary leading-relaxed bg-bg-surface-alt/30 p-4 rounded-xl border border-border-default min-h-[100px]">
                    {threatData?.adversary_limitation}
                  </p>
                </div>
            </div>

            <div className="mg-card p-6 flex flex-col gap-4 bg-bg-surface-alt/10">
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Trust Assumptions</h3>
                <div className="space-y-4">
                  {threatData?.trust_assumptions?.map((assumption, i) => (
                    <div key={i} className="flex gap-4 text-xs text-text-primary italic border-l-2 border-accent-cyan/30 pl-4 py-1">
                        <span className="text-accent-cyan font-bold font-mono">[{i+1}]</span>
                        <span>{assumption}</span>
                    </div>
                  ))}
                </div>
            </div>
          </section>

          {/* System Scope Section */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-border-default pb-4">
                <div className="p-2 bg-accent-cyan/10 text-accent-cyan rounded-lg">
                  <Target size={24} />
                </div>
                <h2 className="text-xl font-bold text-text-primary uppercase tracking-widest text-sm">Section 2: System Scope</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="flex flex-col gap-3">
                  <h3 className="text-[10px] font-bold text-mg-green uppercase tracking-widest">In-Scope Protection</h3>
                  <div className="text-xs text-text-primary leading-relaxed bg-mg-green/5 p-4 rounded-xl border border-mg-green/20">
                    {threatData?.scope}
                  </div>
               </div>
               <div className="flex flex-col gap-3">
                  <h3 className="text-[10px] font-bold text-mg-red uppercase tracking-widest">Out-of-Scope (Assumptions)</h3>
                  <div className="text-xs text-text-primary leading-relaxed bg-mg-red/5 p-4 rounded-xl border border-mg-red/20">
                    {threatData?.out_of_scope}
                  </div>
               </div>
            </div>
          </section>

          {/* Comparison Section */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-border-default pb-4">
                <div className="p-2 bg-mg-amber/10 text-mg-amber rounded-lg">
                  <Layers size={24} />
                </div>
                <h2 className="text-xl font-bold text-text-primary uppercase tracking-widest text-sm">Section 3: Comparison to Prior Art</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
               {threatData?.comparison_to_prior_art && Object.entries(threatData.comparison_to_prior_art).map(([key, val]) => (
                 <div key={key} className="flex flex-col gap-2 p-4 rounded-xl bg-bg-surface border border-border-default">
                    <span className="text-[10px] font-bold text-accent-cyan uppercase tracking-widest">{key.replace('_', ' ')}</span>
                    <p className="text-xs text-text-muted leading-relaxed">{val}</p>
                 </div>
               ))}
            </div>
          </section>
        </div>

        {/* Right Column: Spec & Properties */}
        <div className="flex flex-col gap-12">
          {/* Security Properties */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-border-default pb-4">
                <div className="p-2 bg-mg-green/10 text-mg-green rounded-lg">
                  <Zap size={20} />
                </div>
                <h2 className="text-lg font-bold text-text-primary uppercase tracking-widest text-xs">Security Properties</h2>
            </div>
            <div className="flex flex-col gap-4">
               {threatData?.security_properties && Object.entries(threatData.security_properties).map(([key, val]) => (
                 <div key={key} className="p-4 rounded-xl bg-bg-surface-alt/20 border border-border-default flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-mg-green uppercase tracking-widest">{key}</span>
                    <p className="text-[11px] text-text-primary leading-normal italic">{val}</p>
                 </div>
               ))}
            </div>
          </section>

          {/* Consensus Specification */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-border-default pb-4">
                <div className="p-2 bg-mg-purple/10 text-mg-purple rounded-lg">
                  <BookOpen size={20} />
                </div>
                <h2 className="text-lg font-bold text-text-primary uppercase tracking-widest text-xs">MLSC Formal Spec</h2>
            </div>
            <div className="mg-card bg-bg-surface-alt/10">
               <div className="p-4 flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Protocol Identifier</span>
                    <span className="text-sm font-bold text-accent-cyan font-mono">{specData?.name}</span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Type</span>
                    <span className="text-xs text-text-primary">{specData?.type}</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Fault Tolerance Model</span>
                    <p className="text-[10px] text-text-muted leading-relaxed italic">{specData?.comparison_to_bft}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Protocol References</span>
                    <div className="flex flex-col gap-2">
                       {specData?.references?.map((ref, i) => (
                         <div key={i} className="text-[9px] font-mono text-text-dim border-l border-border-default pl-2">
                            {ref}
                         </div>
                       ))}
                    </div>
                  </div>
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

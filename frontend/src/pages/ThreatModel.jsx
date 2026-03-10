import React from "react"
import { useApi } from "../hooks/useApi"
import { Shield, BookOpen, Target, Zap, Layers } from "lucide-react"

function SectionHeader({ icon: Icon, label, iconColor, iconBg }) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-gray-100 mb-5">
      <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${iconBg} ${iconColor} shrink-0`}>
        <Icon size={16} strokeWidth={2} />
      </div>
      <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">{label}</span>
    </div>
  )
}

export function ThreatModel() {
  const { data: threatData } = useApi("/api/threat-model")
  const { data: specData } = useApi("/api/consensus/spec")

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 animate-fade-in pb-12">

      {/* Heading */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
          Security Architecture & Threat Model
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Trust assumptions · adversary capabilities · cryptographic bounds
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* Left — Main content */}
        <div className="flex flex-col gap-6">

          {/* Adversary Model */}
          <div className="card p-6 md:p-8">
            <SectionHeader icon={Shield} label="Section 1 · Adversary Model" iconColor="text-red-500" iconBg="bg-red-50" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { label: "Capabilities", content: threatData?.adversary_capability, color: "text-blue-600", bg: "bg-blue-50/50", border: "border-blue-100" },
                { label: "Limitations", content: threatData?.adversary_limitation, color: "text-amber-600", bg: "bg-amber-50/50", border: "border-amber-100" },
              ].map(item => (
                <div key={item.label} className="flex flex-col h-full">
                  <span className={`text-[10px] font-bold tracking-widest uppercase block mb-2 ${item.color}`}>{item.label}</span>
                  <p className={`flex-1 text-sm font-medium text-gray-600 leading-relaxed p-4 rounded-lg bg-white border shadow-sm ${item.border}`}>
                    {item.content || "Loading parameters..."}
                  </p>
                </div>
              ))}
            </div>

            {threatData?.trust_assumptions?.length > 0 && (
              <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-100">
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 block mb-3">Trust Assumptions</span>
                <div className="flex flex-col gap-2">
                  {threatData.trust_assumptions.map((a, i) => (
                    <div key={i} className="flex gap-3 border-l-2 border-blue-200 pl-3 py-0.5">
                      <span className="font-mono text-[10px] font-bold text-blue-500 shrink-0 select-none">[{i + 1}]</span>
                      <span className="text-sm text-gray-600 leading-relaxed italic">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* System Scope */}
          <div className="card p-6 md:p-8">
            <SectionHeader icon={Target} label="Section 2 · System Scope" iconColor="text-blue-500" iconBg="bg-blue-50" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "In-Scope", content: threatData?.scope, color: "text-emerald-600", bg: "bg-emerald-50/50", border: "border-emerald-100" },
                { label: "Out-of-Scope", content: threatData?.out_of_scope, color: "text-red-500", bg: "bg-red-50/50", border: "border-red-100" },
              ].map(item => (
                <div key={item.label} className="flex flex-col h-full">
                  <span className={`text-[10px] font-bold tracking-widest uppercase block mb-2 ${item.color}`}>{item.label}</span>
                  <p className={`flex-1 text-sm font-medium text-gray-600 leading-relaxed p-4 rounded-lg bg-white border shadow-sm ${item.border}`}>
                    {item.content || "Loading scope limits..."}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Prior Art Comparison */}
          <div className="card p-6 md:p-8">
            <SectionHeader icon={Layers} label="Section 3 · Comparison to Prior Art" iconColor="text-amber-500" iconBg="bg-amber-50" />
            <div className="flex flex-col gap-3">
              {threatData?.comparison_to_prior_art && Object.entries(threatData.comparison_to_prior_art).map(([key, val]) => (
                <div key={key} className="p-4 rounded-lg bg-gray-50/50 border border-gray-100 shadow-sm transition-colors hover:bg-gray-50">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600 block mb-1">
                    {key.replace(/_/g, " ")}
                  </span>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Properties + Spec */}
        <div className="flex flex-col gap-6">

          {/* Security Properties */}
          <div className="card p-5">
            <SectionHeader icon={Zap} label="Security Properties" iconColor="text-emerald-500" iconBg="bg-emerald-50" />
            <div className="flex flex-col gap-2">
              {threatData?.security_properties && Object.entries(threatData.security_properties).map(([key, val]) => (
                <div key={key} className="p-3 rounded-md bg-emerald-50/30 border border-emerald-100/50 shadow-sm">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 block mb-1">{key}</span>
                  <p className="text-[11px] font-medium text-gray-600 italic leading-relaxed">{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* MLSC Spec */}
          <div className="card p-5">
            <SectionHeader icon={BookOpen} label="MLSC Formal Spec" iconColor="text-indigo-500" iconBg="bg-indigo-50" />
            <div className="flex flex-col gap-4">
              {[
                { label: "Protocol ID", value: specData?.name, color: "text-blue-600", isMono: true },
                { label: "Type", value: specData?.type, color: "text-gray-900", isMono: true },
                { label: "Fault Tolerance", value: specData?.comparison_to_bft, color: "text-gray-500", isMono: false, italic: true },
              ].map(row => (
                <div key={row.label}>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 block mb-1">{row.label}</span>
                  <span className={`block ${row.isMono ? 'font-mono text-xs font-bold' : 'font-sans text-[11px] font-medium'} ${row.italic ? 'italic' : ''} ${row.color} leading-relaxed`}>
                    {row.value || "—"}
                  </span>
                </div>
              ))}

              {specData?.references?.length > 0 && (
                <div className="mt-2 pt-4 border-t border-gray-100">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 block mb-2">References</span>
                  <div className="flex flex-col gap-1.5">
                    {specData.references.map((ref, i) => (
                      <div key={i} className="font-mono text-[9px] text-gray-500 border-l-2 border-gray-200 pl-2 leading-relaxed bg-gray-50/50 py-1 rounded-r-sm">
                        {ref}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

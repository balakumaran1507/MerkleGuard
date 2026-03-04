import React from "react"
import { useApi } from "../hooks/useApi"
import { Shield, BookOpen, Target, Zap, Layers } from "lucide-react"

const monoLabel = { fontFamily: "var(--font-mono)", fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }

function SectionHeader({ icon: Icon, label, iconColor, iconBg }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingBottom: "14px", borderBottom: "1px solid var(--color-border-default)", marginBottom: "20px" }}>
      <div style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", background: iconBg, color: iconColor, flexShrink: 0 }}>
        <Icon size={17} strokeWidth={1.75} />
      </div>
      <span style={{ ...monoLabel, fontSize: "11px", color: "var(--color-text-secondary)", letterSpacing: "0.12em" }}>{label}</span>
    </div>
  )
}

export function ThreatModel() {
  const { data: threatData } = useApi("/api/threat-model")
  const { data: specData } = useApi("/api/consensus/spec")

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }} className="animate-mg-fadeIn">

      {/* Heading */}
      <div style={{ marginBottom: "12px" }}>
        <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "22px", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "6px" }}>
          Security Architecture & Threat Model
        </h1>
        <p style={{ ...monoLabel, color: "var(--color-text-muted)" }}>
          Trust assumptions · adversary capabilities · cryptographic bounds
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", alignItems: "start" }}>

        {/* Left — Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Adversary Model */}
          <div className="mg-card" style={{ padding: "24px 28px" }}>
            <SectionHeader icon={Shield} label="Section 1 · Adversary Model" iconColor="var(--color-status-crit)" iconBg="var(--color-status-crit-dim)" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
              {[
                { label: "Capabilities", content: threatData?.adversary_capability, color: "var(--color-cyan-500)", bg: "var(--color-cyan-dim)", border: "rgba(0,210,255,0.15)" },
                { label: "Limitations", content: threatData?.adversary_limitation, color: "var(--color-status-warn)", bg: "var(--color-status-warn-dim)", border: "rgba(245,158,11,0.15)" },
              ].map(item => (
                <div key={item.label}>
                  <span style={{ ...monoLabel, display: "block", color: item.color, marginBottom: "8px" }}>{item.label}</span>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "var(--color-text-secondary)", lineHeight: 1.6, padding: "12px 14px", borderRadius: "7px", background: item.bg, border: `1px solid ${item.border}`, minHeight: 80 }}>
                    {item.content}
                  </p>
                </div>
              ))}
            </div>

            {threatData?.trust_assumptions?.length > 0 && (
              <div style={{ padding: "14px 16px", borderRadius: "7px", background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}>
                <span style={{ ...monoLabel, display: "block", color: "var(--color-text-muted)", marginBottom: "10px" }}>Trust Assumptions</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {threatData.trust_assumptions.map((a, i) => (
                    <div key={i} style={{ display: "flex", gap: "12px", borderLeft: "2px solid rgba(0,210,255,0.25)", paddingLeft: "12px" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, color: "var(--color-cyan-500)", flexShrink: 0 }}>[{i + 1}]</span>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: "11.5px", color: "var(--color-text-secondary)", lineHeight: 1.5, fontStyle: "italic" }}>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* System Scope */}
          <div className="mg-card" style={{ padding: "24px 28px" }}>
            <SectionHeader icon={Target} label="Section 2 · System Scope" iconColor="var(--color-cyan-500)" iconBg="var(--color-cyan-dim)" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {[
                { label: "In-Scope", content: threatData?.scope, color: "var(--color-status-ok)", bg: "var(--color-status-ok-dim)", border: "rgba(16,212,140,0.2)" },
                { label: "Out-of-Scope", content: threatData?.out_of_scope, color: "var(--color-status-crit)", bg: "var(--color-status-crit-dim)", border: "rgba(240,75,75,0.2)" },
              ].map(item => (
                <div key={item.label}>
                  <span style={{ ...monoLabel, display: "block", color: item.color, marginBottom: "8px" }}>{item.label}</span>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "var(--color-text-secondary)", lineHeight: 1.6, padding: "12px 14px", borderRadius: "7px", background: item.bg, border: `1px solid ${item.border}`, minHeight: 70 }}>
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Prior Art Comparison */}
          <div className="mg-card" style={{ padding: "24px 28px" }}>
            <SectionHeader icon={Layers} label="Section 3 · Comparison to Prior Art" iconColor="var(--color-status-warn)" iconBg="var(--color-status-warn-dim)" />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {threatData?.comparison_to_prior_art && Object.entries(threatData.comparison_to_prior_art).map(([key, val]) => (
                <div key={key} style={{ padding: "12px 14px", borderRadius: "7px", background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}>
                  <span style={{ ...monoLabel, display: "block", color: "var(--color-cyan-500)", marginBottom: "5px" }}>
                    {key.replace(/_/g, " ")}
                  </span>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "var(--color-text-muted)", lineHeight: 1.55 }}>{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Properties + Spec */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Security Properties */}
          <div className="mg-card" style={{ padding: "20px 22px" }}>
            <SectionHeader icon={Zap} label="Security Properties" iconColor="var(--color-status-ok)" iconBg="var(--color-status-ok-dim)" />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {threatData?.security_properties && Object.entries(threatData.security_properties).map(([key, val]) => (
                <div key={key} style={{ padding: "10px 12px", borderRadius: "6px", background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}>
                  <span style={{ ...monoLabel, display: "block", color: "var(--color-status-ok)", marginBottom: "4px" }}>{key}</span>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "var(--color-text-secondary)", fontStyle: "italic", lineHeight: 1.5 }}>{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* MLSC Spec */}
          <div className="mg-card" style={{ padding: "20px 22px" }}>
            <SectionHeader icon={BookOpen} label="MLSC Formal Spec" iconColor="var(--color-violet-400)" iconBg="var(--color-violet-dim)" />
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Protocol ID", value: specData?.name, color: "var(--color-cyan-500)" },
                { label: "Type", value: specData?.type, color: "var(--color-text-secondary)" },
                { label: "Fault Tolerance", value: specData?.comparison_to_bft, color: "var(--color-text-secondary)", italic: true },
              ].map(row => (
                <div key={row.label}>
                  <span style={{ ...monoLabel, display: "block", color: "var(--color-text-dim)", marginBottom: "3px" }}>{row.label}</span>
                  <span style={{ fontFamily: row.italic ? "var(--font-sans)" : "var(--font-mono)", fontSize: row.italic ? "11px" : "12px", fontWeight: row.italic ? 400 : 700, color: row.color, fontStyle: row.italic ? "italic" : "normal", lineHeight: 1.5, display: "block" }}>
                    {row.value}
                  </span>
                </div>
              ))}

              {specData?.references?.length > 0 && (
                <div>
                  <span style={{ ...monoLabel, display: "block", color: "var(--color-text-dim)", marginBottom: "6px" }}>References</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {specData.references.map((ref, i) => (
                      <div key={i} style={{ fontFamily: "var(--font-mono)", fontSize: "9.5px", color: "var(--color-text-dim)", borderLeft: "2px solid var(--color-border-default)", paddingLeft: "8px", lineHeight: 1.5 }}>
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

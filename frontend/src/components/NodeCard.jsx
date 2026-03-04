import React from "react"
import { StatusBadge } from "./StatusBadge"

export function NodeCard({ node, isSelected, onClick }) {
  const statusBarColor = {
    compliant: "var(--color-status-ok)",
    drifted: "var(--color-status-warn)",
    critical: "var(--color-status-crit)",
  }

  const totalCats = 6
  const driftedCount = (node.drifted_categories || []).length
  const compliancePct = ((totalCats - driftedCount) / totalCats) * 100
  const merkleRoot = node.current_merkle_root || node.merkle_root || ""
  const barColor = statusBarColor[node.status] || statusBarColor.compliant

  return (
    <div
      onClick={onClick}
      className="mg-card mg-card-hover cursor-pointer"
      style={{
        padding: "14px 16px",
        borderColor: isSelected ? "var(--color-cyan-500)" : undefined,
        boxShadow: isSelected
          ? "0 0 0 1px rgba(0,210,255,0.2), 0 0 20px rgba(0,210,255,0.08)"
          : undefined,
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {/* Name + Badge */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            letterSpacing: "0.01em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "110px",
          }}
        >
          {node.name}
        </span>
        <StatusBadge status={node.status} />
      </div>

      {/* Meta rows */}
      <div
        className="flex flex-col gap-2 mb-3"
        style={{ fontSize: "10px" }}
      >
        <div className="flex items-center justify-between">
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
            }}
          >
            Zone
          </span>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              color: "var(--color-text-secondary)",
            }}
          >
            {node.zone}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
            }}
          >
            Root Hash
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--color-cyan-500)",
              letterSpacing: "0.02em",
            }}
          >
            {merkleRoot.substring(0, 10)}…
          </span>
        </div>
      </div>

      {/* Compliance bar */}
      <div>
        <div
          className="flex items-center justify-between mb-1"
          style={{ fontSize: "9px" }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
            }}
          >
            Compliance
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              color: barColor,
            }}
          >
            {Math.round(compliancePct)}%
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
              width: `${compliancePct}%`,
              background: barColor,
              boxShadow: `0 0 6px ${barColor}80`,
              borderRadius: "2px",
              transition: "width 0.5s cubic-bezier(.16,1,.3,1)",
            }}
          />
        </div>
      </div>
    </div>
  )
}

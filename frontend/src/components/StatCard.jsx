import React from "react"
import { clsx } from "clsx"

const colorConfig = {
  cyan: {
    icon: "var(--color-cyan-500)",
    iconBg: "var(--color-cyan-dim)",
    iconBorder: "rgba(0,210,255,0.18)",
    accent: "var(--color-cyan-500)",
    bar: "var(--color-cyan-500)",
    barGlow: "rgba(0,210,255,0.4)",
  },
  green: {
    icon: "var(--color-status-ok)",
    iconBg: "var(--color-status-ok-dim)",
    iconBorder: "rgba(16,212,140,0.2)",
    accent: "var(--color-status-ok)",
    bar: "var(--color-status-ok)",
    barGlow: "rgba(16,212,140,0.4)",
  },
  amber: {
    icon: "var(--color-status-warn)",
    iconBg: "var(--color-status-warn-dim)",
    iconBorder: "rgba(245,158,11,0.25)",
    accent: "var(--color-status-warn)",
    bar: "var(--color-status-warn)",
    barGlow: "rgba(245,158,11,0.4)",
  },
  red: {
    icon: "var(--color-status-crit)",
    iconBg: "var(--color-status-crit-dim)",
    iconBorder: "rgba(240,75,75,0.25)",
    accent: "var(--color-status-crit)",
    bar: "var(--color-status-crit)",
    barGlow: "rgba(240,75,75,0.4)",
  },
  purple: {
    icon: "var(--color-violet-400)",
    iconBg: "var(--color-violet-dim)",
    iconBorder: "rgba(123,47,255,0.2)",
    accent: "var(--color-violet-400)",
    bar: "var(--color-violet-400)",
    barGlow: "rgba(155,95,255,0.4)",
  },
  white: {
    icon: "var(--color-text-secondary)",
    iconBg: "var(--color-bg-elevated)",
    iconBorder: "var(--color-border-strong)",
    accent: "var(--color-text-secondary)",
    bar: "var(--color-text-secondary)",
    barGlow: "rgba(139,152,184,0.3)",
  },
}

export function StatCard({ label, value, subtitle, color = "cyan", icon: Icon, trend }) {
  const c = colorConfig[color] || colorConfig.cyan

  return (
    <div
      className="mg-card mg-card-hover flex-1 min-w-[150px] cursor-default"
      style={{ padding: "16px 18px" }}
    >
      {/* Top row: label + icon badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9.5px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          {label}
        </span>
        {Icon && (
          <div
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              background: c.iconBg,
              border: `1px solid ${c.iconBorder}`,
              color: c.icon,
              flexShrink: 0,
            }}
          >
            <Icon size={13} strokeWidth={2} />
          </div>
        )}
      </div>

      {/* Value */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "26px",
          fontWeight: 700,
          color: "var(--color-text-primary)",
          lineHeight: 1,
          letterSpacing: "-0.04em",
          marginBottom: "8px",
        }}
      >
        {value}
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "11px",
          color: "var(--color-text-muted)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {subtitle}
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          marginTop: "12px",
          height: "2px",
          borderRadius: "1px",
          background: `linear-gradient(90deg, ${c.accent}55, transparent)`,
        }}
      />
    </div>
  )
}

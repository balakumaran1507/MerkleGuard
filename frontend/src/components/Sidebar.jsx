import React from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Server,
  GitFork,
  Swords,
  ScrollText,
  BarChart3,
  Wifi,
  ShieldHalf,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { clsx } from "clsx"

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, group: "OVERVIEW" },
  { to: "/nodes", label: "Node Fleet", icon: Server, group: "OVERVIEW" },
  { to: "/merkle", label: "Merkle Inspector", icon: GitFork, group: "ANALYSIS" },
  { to: "/analysis", label: "Network Analysis", icon: Wifi, group: "ANALYSIS" },
  { to: "/analytics", label: "Analytics", icon: BarChart3, group: "ANALYSIS" },
  { to: "/simulator", label: "Attack Simulator", icon: Swords, group: "RESPONSE" },
  { to: "/threat-model", label: "Threat Model", icon: ShieldHalf, group: "RESPONSE" },
  { to: "/timeline", label: "Timeline & Audit", icon: ScrollText, group: "RESPONSE" },
]

const GROUPS = ["OVERVIEW", "ANALYSIS", "RESPONSE"]

export function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside
      className={clsx(
        "flex flex-col h-screen transition-all duration-300 relative flex-shrink-0",
        collapsed ? "w-[56px]" : "w-[220px]"
      )}
      style={{
        background: "var(--color-bg-surface)",
        borderRight: "1px solid var(--color-border-default)",
      }}
    >
      {/* ── Brand wordmark ── */}
      <div
        className="flex items-center h-14 px-4 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--color-border-default)" }}
      >
        {collapsed ? (
          <div
            className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
            style={{
              background: "var(--color-cyan-dim)",
              border: "1px solid rgba(0,210,255,0.2)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--color-cyan-500)",
                letterSpacing: "-0.03em",
              }}
            >
              MG
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                Merkle
              </span>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "var(--color-cyan-500)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                Guard
              </span>
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                fontWeight: 500,
                color: "var(--color-text-muted)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Zero-Trust Engine
            </span>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2" style={{ gap: "0" }}>
        {GROUPS.map((group) => {
          const items = NAV_ITEMS.filter((i) => i.group === group)
          return (
            <div key={group} className="mb-4">
              {!collapsed && (
                <div
                  className="px-2 mb-1.5"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    color: "var(--color-text-dim)",
                    textTransform: "uppercase",
                  }}
                >
                  {group}
                </div>
              )}
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    clsx(
                      "mg-nav-item mb-0.5",
                      isActive && "active",
                      collapsed && "justify-center px-2"
                    )
                  }
                >
                  <item.icon
                    size={15}
                    strokeWidth={1.75}
                    style={{ flexShrink: 0 }}
                  />
                  {!collapsed && (
                    <span style={{ fontSize: "12.5px", fontWeight: 500 }}>
                      {item.label}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          )
        })}
      </nav>

      {/* ── Footer ── */}
      <div
        className="flex-shrink-0 px-3 py-3"
        style={{ borderTop: "1px solid var(--color-border-default)" }}
      >
        {!collapsed && (
          <div className="flex flex-col gap-0.5 px-1">
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                color: "var(--color-text-dim)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Runtime
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--color-cyan-500)",
                opacity: 0.7,
              }}
            >
              v2.4.1-stable
            </span>
          </div>
        )}
      </div>

      {/* ── Collapse toggle ── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[58px] w-6 h-6 flex items-center justify-center rounded-full cursor-pointer transition-all duration-150"
        style={{
          background: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border-strong)",
          color: "var(--color-text-muted)",
          zIndex: 50,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "var(--color-cyan-500)"
          e.currentTarget.style.color = "var(--color-cyan-500)"
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "var(--color-border-strong)"
          e.currentTarget.style.color = "var(--color-text-muted)"
        }}
      >
        {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
      </button>
    </aside>
  )
}

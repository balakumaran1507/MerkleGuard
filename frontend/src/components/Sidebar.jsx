import React from "react"
import { NavLink } from "react-router-dom"
import { 
  LayoutDashboard, 
  Server, 
  Binary, 
  Zap, 
  History, 
  BarChart3, 
  Network, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Shield
} from "lucide-react"
import { clsx } from "clsx"

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/nodes", label: "Node Fleet", icon: Server },
  { to: "/merkle", label: "Merkle Inspector", icon: Binary },
  { to: "/simulator", label: "Attack Simulator", icon: Zap },
  { to: "/timeline", label: "Timeline & Audit", icon: History },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/analysis", label: "Network Analysis", icon: Network },
  { to: "/threat-model", label: "Threat Model", icon: ShieldCheck },
]

export function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside 
      className={clsx(
        "bg-bg-surface border-r border-border-default h-screen flex flex-col transition-all duration-300 relative",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="h-16 flex items-center px-4 gap-3 border-b border-border-default mb-4">
        <div className="p-1.5 bg-accent-cyan/10 rounded-lg text-accent-cyan">
          <Shield size={collapsed ? 24 : 20} />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-text-primary tracking-tight">MERKLEGUARD</span>
            <span className="text-[8px] font-bold text-text-muted uppercase tracking-[0.2em]">Zero-Trust Engine</span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1 custom-scrollbar overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
              isActive 
                ? "bg-accent-cyan/10 text-accent-cyan" 
                : "text-text-muted hover:text-text-primary hover:bg-bg-surface-alt"
            )}
          >
            <item.icon size={18} className={clsx("flex-shrink-0 group-hover:scale-110 transition-transform")} />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border-default flex justify-center">
        {!collapsed && (
          <div className="flex flex-col items-center gap-1 opacity-40">
            <span className="text-[10px] font-bold text-text-muted">SYSTEM VERSION</span>
            <span className="text-[10px] font-mono font-bold text-accent-cyan">v2.4.1-STABLE</span>
          </div>
        )}
      </div>

      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-border-default rounded-full border border-border-light flex items-center justify-center text-text-muted hover:text-accent-cyan transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  )
}

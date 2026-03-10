import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
    LayoutDashboard, Server, Zap, Award, GitFork, Wifi,
    BarChart3, Swords, ShieldHalf, ScrollText, FileText
} from 'lucide-react';

const ROUTES = [
    { to: "/dashboard", label: "Dashboard", key: "D", icon: LayoutDashboard },
    { to: "/nodes", label: "Node Fleet", key: "N", icon: Server },
    { to: "/demo-live", label: "Live Demo", key: "L", icon: Zap },
    { to: "/showcase", label: "Showcase", key: "S", icon: Award },
    { to: "/merkle", label: "Merkle Inspector", key: "M", icon: GitFork },
    { to: "/analysis", label: "Network Analysis", key: "A", icon: Wifi },
    { to: "/analytics", label: "Analytics", key: "T", icon: BarChart3 },
    { to: "/simulator", label: "Attack Simulator", key: "K", icon: Swords },
    { to: "/threat-model", label: "Threat Model", key: "H", icon: ShieldHalf },
    { to: "/timeline", label: "Timeline & Audit", key: "I", icon: ScrollText },
    { to: "/compliance", label: "Compliance Reports", key: "C", icon: FileText },
];

export function Sidebar({ collapsed, onToggle }) {
    return (
        <aside className={clsx(
            "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
            collapsed ? "w-16" : "w-64"
        )}>
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
                {!collapsed ? (
                    <>
                        <span className="font-bold text-gray-900 text-sm">MerkleGuard</span>
                        <button
                            onClick={onToggle}
                            className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
                            aria-label="Collapse sidebar"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 4l-4 4 4 4" />
                            </svg>
                        </button>
                    </>
                ) : (
                    <button
                        onClick={onToggle}
                        className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors mx-auto"
                        aria-label="Expand sidebar"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 4l4 4-4 4" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
                <div className="space-y-1 px-2">
                    {ROUTES.map(route => (
                        <NavLink
                            key={route.to}
                            to={route.to}
                            className={({ isActive }) => clsx(
                                "flex items-center gap-3 px-3 py-2 rounded transition-colors",
                                isActive
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                            )}
                            title={collapsed ? route.label : undefined}
                        >
                            {({ isActive }) => (
                                <>
                                    {collapsed ? (
                                        <route.icon size={18} strokeWidth={2} className="shrink-0" />
                                    ) : (
                                        <>
                                            <span className={clsx(
                                                "w-6 h-6 flex items-center justify-center rounded text-xs font-bold shrink-0",
                                                isActive ? "bg-white/20" : "bg-gray-200"
                                            )}>
                                                {route.key}
                                            </span>
                                            <span className="text-sm font-medium truncate">{route.label}</span>
                                        </>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* Footer Status */}
            <div className="h-14 border-t border-gray-200 flex items-center px-4 shrink-0">
                {collapsed ? (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto" />
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Operational
                        </span>
                    </div>
                )}
            </div>
        </aside>
    );
}

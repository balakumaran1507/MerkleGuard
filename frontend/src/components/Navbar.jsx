import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    ShieldCheck, LayoutDashboard, Server, GitFork,
    Wifi, BarChart3, Swords, ShieldHalf, ScrollText,
    FileText, Zap, Award
} from 'lucide-react';
import { clsx } from 'clsx';

const NAV_GROUPS = [
    {
        name: "Overview",
        items: [
            { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { to: "/nodes", label: "Node Fleet", icon: Server },
            { to: "/demo-live", label: "Live Demo", icon: Zap },
            { to: "/showcase", label: "Showcase", icon: Award },
        ]
    },
    {
        name: "Analysis",
        items: [
            { to: "/merkle", label: "Merkle Inspector", icon: GitFork },
            { to: "/analysis", label: "Network Analysis", icon: Wifi },
            { to: "/analytics", label: "Analytics", icon: BarChart3 },
        ]
    },
    {
        name: "Response",
        items: [
            { to: "/simulator", label: "Attack Simulator", icon: Swords },
            { to: "/threat-model", label: "Threat Model", icon: ShieldHalf },
            { to: "/timeline", label: "Timeline & Audit", icon: ScrollText },
        ]
    },
    {
        name: "Enterprise",
        items: [
            { to: "/compliance", label: "Compliance Reports", icon: FileText },
        ]
    }
];

export function Navbar() {
    const { pathname } = useLocation();

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
            <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">

                {/* LOGO */}
                <div className="flex items-center gap-2 pr-8 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white shadow-sm">
                        <ShieldCheck size={20} strokeWidth={2.5} />
                    </div>
                    <span className="font-sans font-bold text-gray-900 text-lg tracking-tight">MerkleGuard</span>
                </div>

                {/* TOP NAV SCROLL */}
                <div className="flex-1 overflow-x-auto flex items-center gap-1 scrollbar-hide py-2">
                    {NAV_GROUPS.map((group, gIdx) => (
                        <div key={group.name} className="flex items-center">
                            {gIdx > 0 && <div className="w-px h-4 bg-gray-300 mx-3 shrink-0" />}
                            <div className="flex items-center gap-1">
                                {group.items.map(item => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        className={({ isActive }) => clsx(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                                            isActive
                                                ? "bg-gray-100 text-gray-900"
                                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                        )}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                                {item.label}
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* RIGHT SIDE ACTIONS */}
                <div className="flex items-center gap-4 pl-8 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">System Operational</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

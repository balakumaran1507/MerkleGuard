import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

const STAGES = [
    { id: 1, name: 'DMZ Breach', desc: 'Web servers compromised' },
    { id: 2, name: 'Database Firewall Bypass', desc: 'SQL injection risk' },
    { id: 3, name: 'API Encryption Downgrade', desc: 'TLS 1.3 → TLS 1.0' }
];

const AnimatedTimer = ({ finalTime, isRunning, isComplete }) => {
    const [time, setTime] = useState(0);

    useEffect(() => {
        if (!isRunning && !isComplete) {
            setTime(0);
            return;
        }
        if (isComplete) {
            setTime(finalTime);
            return;
        }

        const start = Date.now();
        const interval = setInterval(() => setTime(Date.now() - start), 10);
        return () => clearInterval(interval);
    }, [isRunning, isComplete, finalTime]);

    return (
        <div className={clsx(
            "text-5xl font-bold tabular-nums transition-colors",
            isComplete ? "text-emerald-600" : "text-gray-900"
        )}>
            {(typeof time === 'number' ? (time / 1).toFixed(2) : time)}
            <span className="text-xl text-gray-500 font-medium ml-1">ms</span>
        </div>
    );
};

export function DemoLive() {
    const [attackState, setAttackState] = useState('ready');
    const [currentStage, setCurrentStage] = useState(0);
    const [compliance, setCompliance] = useState(100);
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState(null);
    const eventsEndRef = useRef(null);

    useEffect(() => {
        if (eventsEndRef.current) {
            eventsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [events]);

    const startAttack = async () => {
        setAttackState('launching');
        setCompliance(100);
        setCurrentStage(0);
        setEvents([{ time: new Date().toISOString(), type: 'info', msg: 'Initiating breach sequence' }]);

        try {
            const resp = await fetch('/api/demo/dramatic-attack', { method: 'POST' });
            const data = await resp.json();
            setTimeout(() => advanceStage(1, data), 800);
        } catch (e) {
            console.error('Attack failed', e);
            setEvents(prev => [...prev, { time: new Date().toISOString(), type: 'error', msg: 'Simulation failed' }]);
            setAttackState('ready');
        }
    };

    const advanceStage = (stage, data) => {
        setAttackState(`stage${stage}`);
        setCurrentStage(stage);

        if (stage === 1) {
            setCompliance(66);
            setEvents(prev => [...prev, { time: new Date().toISOString(), type: 'critical', msg: 'DMZ perimeter breached' }]);
            setTimeout(() => advanceStage(2, data), 1200);
        } else if (stage === 2) {
            setCompliance(33);
            setEvents(prev => [...prev, { time: new Date().toISOString(), type: 'critical', msg: 'Database firewall bypassed' }]);
            setTimeout(() => advanceStage(3, data), 1200);
        } else if (stage === 3) {
            setCompliance(0);
            setEvents(prev => [...prev, { time: new Date().toISOString(), type: 'critical', msg: 'API encryption downgraded' }]);
            setTimeout(() => finishDetection(data), 1500);
        }
    };

    const finishDetection = (data) => {
        setAttackState('detecting');
        setTimeout(() => {
            setStats(data);
            setCompliance(100);
            setAttackState('complete');
            setEvents(prev => [
                ...prev,
                { time: new Date().toISOString(), type: 'success', msg: `Drift localized in ${data.detection_time_ms}ms` },
                { time: new Date().toISOString(), type: 'success', msg: `Auto-remediation complete` }
            ]);
        }, 500);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
                        Live Attack Simulation
                    </h1>
                    <p className="text-sm text-gray-600">
                        Real-time threat detection and response demonstration
                    </p>
                </div>

                <button
                    onClick={startAttack}
                    disabled={attackState !== 'ready' && attackState !== 'complete'}
                    className={clsx(
                        "px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2",
                        attackState === 'ready' || attackState === 'complete'
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                >
                    {attackState === 'ready' ? (
                        <>
                            <ShieldAlert size={16} />
                            Launch Simulation
                        </>
                    ) : attackState === 'complete' ? (
                        <>
                            <RefreshCw size={16} />
                            Run Again
                        </>
                    ) : (
                        <>
                            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Running...
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
                {/* Main Panel */}
                <div className="flex flex-col gap-6">
                    {/* Metrics */}
                    <div className="card p-6">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <div className="text-xs font-semibold text-gray-500 mb-2">Detection Speed</div>
                                <AnimatedTimer
                                    finalTime={stats?.detection_time_ms || 9.26}
                                    isRunning={attackState !== 'ready' && attackState !== 'complete' && attackState !== 'detecting'}
                                    isComplete={attackState === 'complete'}
                                />
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-gray-500 mb-2">System Integrity</div>
                                <div className={clsx(
                                    "text-5xl font-bold transition-colors",
                                    compliance === 100 ? "text-emerald-600" : compliance === 0 ? "text-red-600" : "text-amber-600"
                                )}>
                                    {compliance}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attack Stages */}
                    <div className="card p-6">
                        <div className="text-xs font-semibold text-gray-500 mb-4">Attack Progression</div>
                        <div className="space-y-3">
                            {STAGES.map((stage) => {
                                const isPast = currentStage > stage.id || attackState === 'complete';
                                const isActive = currentStage === stage.id;

                                return (
                                    <div key={stage.id} className="flex items-center gap-3">
                                        <div className={clsx(
                                            "w-2 h-2 rounded-full transition-colors flex-shrink-0",
                                            isPast ? "bg-red-500" : isActive ? "bg-amber-500 animate-pulse" : "bg-gray-200"
                                        )} />
                                        <div className="flex-1">
                                            <div className={clsx(
                                                "text-sm font-medium transition-colors",
                                                isPast || isActive ? "text-gray-900" : "text-gray-400"
                                            )}>
                                                {stage.name}
                                            </div>
                                            <div className="text-xs text-gray-500">{stage.desc}</div>
                                        </div>
                                        {isPast && (
                                            <div className="text-xs font-mono text-red-600 font-semibold">
                                                COMPROMISED
                                            </div>
                                        )}
                                        {isActive && (
                                            <div className="text-xs font-mono text-amber-600 font-semibold">
                                                IN PROGRESS
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Event Log */}
                <div className="card overflow-hidden flex flex-col h-[600px] bg-gray-50">
                    <div className="px-4 py-3 border-b border-gray-200 bg-white">
                        <div className="text-xs font-semibold text-gray-900">Event Log</div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        {events.length === 0 ? (
                            <div className="text-sm text-gray-500">Waiting for simulation...</div>
                        ) : (
                            <div className="space-y-2">
                                <AnimatePresence initial={false}>
                                    {events.map((evt, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-xs font-mono"
                                        >
                                            <span className="text-gray-500">
                                                {new Date(evt.time).toLocaleTimeString([], {
                                                    hour12: false,
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit'
                                                })}
                                            </span>
                                            <span className="mx-2 text-gray-300">│</span>
                                            <span className={clsx(
                                                evt.type === 'critical' ? "text-red-600" :
                                                evt.type === 'success' ? "text-emerald-600" :
                                                "text-blue-600"
                                            )}>
                                                {evt.msg}
                                            </span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <div ref={eventsEndRef} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

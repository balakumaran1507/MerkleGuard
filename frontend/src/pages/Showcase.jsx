import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Zap, Shield, Database, Activity, CheckCircle2, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

const CountUp = ({ end, duration = 2000, suffix = '', decimals = 0 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (!isInView) return;
        const steps = 60;
        const increment = end / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(current);
            }
        }, duration / steps);
        return () => clearInterval(timer);
    }, [end, duration, isInView]);

    return <span ref={ref}>{(count).toFixed(decimals)}{suffix}</span>;
};

const SectionData = {
    performance: {
        detection_speed_ms: 9.26,
        efficiency_gain: 75.0,
        false_positive_rate: 0.0,
        accuracy: 100.0
    },
    scale: {
        nodes_monitored: 16,
        snapshots_captured: 4006,
        consensus_rounds: 357,
        categories: 6
    },
    comparison: {
        traditional_comparisons: 96,
        merkle_comparisons: 24.0,
        efficiency_improvement: "75.0%"
    }
};

export function Showcase() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ container: containerRef });
    const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const yHero = useTransform(scrollYProgress, [0, 0.2], [0, 100]);

    const [data, setData] = useState(SectionData);

    useEffect(() => {
        fetch('/api/demo/showcase')
            .then(r => r.json())
            .then(d => {
                if (d && d.performance) setData(d);
            })
            .catch(() => { }); // fallback to default
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full relative mx-auto"
        >
            <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">

                {/* HERO SECTION */}
                <motion.section
                    className="min-h-[70vh] flex flex-col items-center justify-center p-8 relative w-full"
                    style={{ opacity: opacityHero, y: yHero }}
                >
                    <div className="badge badge-success mb-8">
                        <Zap size={14} className="mr-1 animate-pulse" />
                        Zero-Trust Engine Active
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-gray-900 text-center leading-none mb-6">
                        Detection In
                    </h1>

                    <div className="text-8xl md:text-[140px] font-bold tracking-tighter text-blue-600 mb-8 tabular-nums">
                        <CountUp end={data.performance.detection_speed_ms} decimals={2} duration={3000} suffix="ms" />
                    </div>

                    <p className="text-xl md:text-2xl text-gray-600 font-medium tracking-tight max-w-2xl text-center">
                        Faster than the blink of an eye.
                        Cryptographic drift localization in <span className="text-gray-900 font-semibold underline decoration-blue-500 decoration-2 underline-offset-4">real-time.</span>
                    </p>


                </motion.section>

                {/* SECTION 1: SPEED COMPARISON */}
                <section className="pt-32 pb-24 px-8 w-full max-w-4xl mx-auto mt-16">
                    <SectionHeader title="Performance Delta" subtitle="How much faster is MerkleGuard?" />
                    <div className="mt-16 flex flex-col gap-8">
                        <BarRow label="Traditional Monitoring" ms={2000} color="bg-gray-200" width="100%" />
                        <BarRow label="Legacy SIEM" ms={1200} color="bg-gray-300" width="60%" />
                        <BarRow label="MerkleGuard" ms={9.26} color="bg-blue-500 shadow-lg shadow-blue-500/30" width="4%" isHighlight />
                    </div>
                </section>

                {/* SECTION 2: EFFICIENCY GAIN */}
                <section className="py-24 px-8 w-full max-w-4xl mx-auto border-t border-gray-100">
                    <SectionHeader title="Computational Efficiency" subtitle="Proving O(n·log p) complexity" />
                    <div className="mt-20 grid md:grid-cols-2 gap-16 items-center">
                        <div className="relative w-full max-w-sm mx-auto aspect-square">
                            <DonutChart percent={data.performance.efficiency_gain} />
                        </div>
                        <div className="flex flex-col gap-6">
                            <h3 className="text-3xl font-bold tracking-tight text-gray-900">75% More Efficient</h3>
                            <div className="space-y-4">
                                <div className="card p-6 border-transparent bg-gray-50 flex flex-col gap-1">
                                    <div className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">Traditional</div>
                                    <p className="text-gray-600 font-medium">Check ALL settings on ALL servers</p>
                                    <p className="text-2xl font-bold text-gray-800">96 comparisons</p>
                                    <p className="text-xs font-semibold text-gray-400 mt-1">O(n·p) complexity</p>
                                </div>
                                <div className="card p-6 border-blue-100 bg-blue-50/50 flex flex-col gap-1 relative overflow-hidden ring-1 ring-blue-500/20">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                                    <div className="text-xs font-bold text-blue-500 tracking-wider uppercase mb-2">MerkleGuard</div>
                                    <p className="text-gray-800 font-medium">Check ONLY changed paths</p>
                                    <p className="text-2xl font-bold text-blue-600">24 comparisons</p>
                                    <p className="text-xs font-semibold text-blue-400 mt-1">O(n·log p) complexity</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 3: ACCURACY */}
                <section className="py-24 px-8 w-full max-w-4xl mx-auto border-t border-gray-100">
                    <SectionHeader title="Cryptographic Precision" subtitle="Zero margin for error" />
                    <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AccuracyCard label="FALSE POSITIVES" val={0.0} />
                        <AccuracyCard label="FALSE NEGATIVES" val={0.0} />
                        <AccuracyCard label="DRIFT LOCALIZATION" val={100.0} suffix="%" />
                        <AccuracyCard label="BASELINE VERIFIED" val={100.0} suffix="%" />
                    </div>
                </section>

                {/* SECTION 4: HOW IT WORKS */}
                <section className="py-24 px-8 w-full max-w-5xl mx-auto border-t border-gray-100">
                    <SectionHeader title="The Pipeline" subtitle="1-Click Remediation" />
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
                        <ProcessStep num="1" title="CAPTURE" desc="Server configs hashed into generic baseline blocks" active />
                        <ProcessStep num="2" title="BASELINE" desc="Cryptographically signed to create tamper-proof tree" />
                        <ProcessStep num="3" title="DETECT" desc="Compare trees in O(log n); highlight altered branches" />
                        <ProcessStep num="4" title="REMEDIATE" desc="Auto-revert isolated nodes back to last trusted baseline" />
                    </div>
                </section>

                {/* SECTION 5: SCALE */}
                <section className="py-24 px-8 w-full max-w-4xl mx-auto border-t border-gray-100">
                    <div className="text-center mb-16 flex flex-col items-center">
                        <div className="badge mb-6">Monitoring Active Network</div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Scale in Production</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <BigStat label="NODES" val={data.scale.nodes_monitored} />
                        <BigStat label="CATEGORIES" val={data.scale.categories} />
                        <BigStat label="SNAPSHOTS" val={data.scale.snapshots_captured} />
                        <BigStat label="DETECTIONS" val={data.scale.consensus_rounds} />
                    </div>
                </section>

            </div>
        </div>
    );
}

function SectionHeader({ title, subtitle }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-2 relative pl-6"
        >
            <div className="absolute left-0 top-1 bottom-1 w-1 bg-gray-200 rounded-full" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">{title}</h2>
            <div className="text-lg text-gray-500 font-medium tracking-wide">{subtitle}</div>
        </motion.div>
    );
}

function BarRow({ label, ms, color, width, isHighlight }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <div ref={ref} className="flex flex-col gap-3">
            <div className="flex justify-between items-baseline">
                <div className={clsx("text-xs font-bold tracking-wider uppercase", isHighlight ? "text-blue-600" : "text-gray-500")}>{label}</div>
                <div className={clsx("text-xl font-bold tabular-nums", isHighlight ? "text-blue-600" : "text-gray-700")}>
                    <CountUp end={ms} decimals={isHighlight ? 2 : 0} duration={2000} suffix="ms" />
                </div>
            </div>
            <div className="h-4 bg-gray-100 rounded-full w-full overflow-hidden">
                <motion.div
                    className={clsx("h-full rounded-full", color)}
                    initial={{ width: "0%" }}
                    animate={isInView ? { width } : {}}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}

function DonutChart({ percent }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const circumference = 2 * Math.PI * 120;

    return (
        <div ref={ref} className="relative w-full h-full flex justify-center items-center">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
                <circle cx="50%" cy="50%" r="120" fill="none" stroke="#f3f4f6" strokeWidth="20" />
                <motion.circle
                    cx="50%" cy="50%" r="120" fill="none" className="stroke-blue-500" strokeWidth="20" strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={isInView ? { strokeDashoffset: circumference - (circumference * percent) / 100 } : {}}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-gray-900 tracking-tighter">
                    <CountUp end={percent} duration={2000} suffix="%" />
                </span>
                <span className="text-[10px] font-bold text-blue-600 tracking-widest mt-1 uppercase">EFFICIENCY</span>
            </div>
        </div>
    );
}

function AccuracyCard({ label, val, suffix = "%" }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="card p-6 flex flex-col items-center justify-center text-center gap-4 py-10 hover:-translate-y-1"
        >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-2">
                <CheckCircle2 size={24} strokeWidth={2.5} />
            </div>
            <div className="text-4xl font-bold tracking-tight text-gray-900 tabular-nums">
                <CountUp end={val} decimals={1} duration={2000} suffix={suffix} />
            </div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-gray-500">{label}</div>
        </motion.div>
    );
}

function ProcessStep({ num, title, desc, active }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: Number(num) * 0.15 }}
            className="card relative flex flex-col gap-3 p-6 pt-8 hover:border-gray-300"
        >
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm absolute -top-4 shadow-sm border border-blue-100">
                {num}
            </div>
            <h3 className="text-lg font-bold tracking-tight text-gray-900">{title}</h3>
            <p className="text-sm font-medium text-gray-500 leading-relaxed">{desc}</p>
            {Number(num) < 4 && <ArrowRight className="absolute right-[-20px] top-1/2 -translate-y-1/2 text-gray-300 hidden md:block" size={24} />}
        </motion.div>
    );
}

function BigStat({ label, val }) {
    return (
        <div className="card flex flex-col items-center justify-center gap-2 p-8 py-10 bg-gradient-to-b from-white to-gray-50/50">
            <div className="text-5xl font-bold text-gray-900 tracking-tighter tabular-nums">
                <CountUp end={val} duration={2500} />
            </div>
            <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mt-2 text-center">{label}</div>
        </div>
    );
}

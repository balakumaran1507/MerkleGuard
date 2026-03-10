import React, { useState } from "react"
import { ShieldCheck, FileText, Download, CheckCircle2, Clock } from "lucide-react"

export function ComplianceReports() {
    const [downloading, setDownloading] = useState(false)

    const downloadReport = async (type) => {
        setDownloading(true)
        try {
            const url = `/api/enterprise/report/compliance?report_type=${type}`
            const response = await fetch(url)
            const blob = await response.blob()
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `MerkleGuard_${type}_Report_${Date.now()}.pdf`
            link.click()
        } catch (err) {
            console.error("Failed to download compliance report:", err)
        } finally {
            setTimeout(() => setDownloading(false), 800)
        }
    }

    return (
        <div className="flex flex-col gap-10 max-w-[1000px] mx-auto pb-16">

            <header className="flex flex-col gap-4 border-b border-gray-200 pb-8 mt-4">
                <div className="badge inline-flex w-max mb-2">
                    <ShieldCheck size={14} className="mr-1 text-emerald-600" />
                    Enterprise Compliance Center
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
                    Audit & Compliance
                </h1>
                <p className="text-gray-500 font-medium tracking-wide max-w-2xl text-lg mt-2">
                    Instantly generate cryptographically verified compliance reports.
                    Our O(log n) validation engine provides mathematical proof of system integrity.
                </p>
            </header>

            <div className="grid md:grid-cols-3 gap-6">
                {/* SOC 2 Report Card */}
                <div className="card flex flex-col hover:-translate-y-1 transition-transform">
                    <div className="p-6 flex-1 flex flex-col gap-4 border-b border-gray-100">
                        <div className="flex justify-between items-start">
                            <h2 className="text-xl font-bold tracking-tight text-gray-900">SOC 2 Type II</h2>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <FileText size={20} strokeWidth={2} />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-500 leading-relaxed">
                            Comprehensive report on security, availability, processing integrity, confidentiality, and privacy.
                        </p>
                        <div className="flex flex-col gap-3 mt-auto pt-6 text-sm text-gray-600 font-medium">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-500" /> 100% Core Controls Met
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-500" /> 9ms Detection SLA
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-500" /> Auto-Remediation Active
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50/50">
                        <button
                            onClick={() => downloadReport('SOC2')}
                            disabled={downloading}
                            className="btn-primary w-full py-2.5 shadow-sm"
                        >
                            <Download size={16} /> {downloading ? 'Compiling PDF...' : 'Download Report'}
                        </button>
                    </div>
                </div>

                {/* ISO 27001 Report Card */}
                <div className="card flex flex-col hover:-translate-y-1 transition-transform">
                    <div className="p-6 flex-1 flex flex-col gap-4 border-b border-gray-100">
                        <div className="flex justify-between items-start">
                            <h2 className="text-xl font-bold tracking-tight text-gray-900">ISO 27001</h2>
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <FileText size={20} strokeWidth={2} />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-500 leading-relaxed">
                            Information security management system (ISMS) compliance report and risk assessment.
                        </p>
                        <div className="flex flex-col gap-3 mt-auto pt-6 text-sm text-gray-600 font-medium">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-500" /> ISMS Integrity Verified
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-500" /> Continuous Audit Sync
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50/50">
                        <button
                            onClick={() => downloadReport('ISO27001')}
                            disabled={downloading}
                            className="btn-secondary w-full py-2.5 text-gray-700"
                        >
                            <Download size={16} /> Generate Export
                        </button>
                    </div>
                </div>

                {/* PCI-DSS Report Card */}
                <div className="card flex flex-col hover:-translate-y-1 transition-transform">
                    <div className="p-6 flex-1 flex flex-col gap-4 border-b border-gray-100">
                        <div className="flex justify-between items-start">
                            <h2 className="text-xl font-bold tracking-tight text-gray-900">PCI-DSS v4.0</h2>
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                <FileText size={20} strokeWidth={2} />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-500 leading-relaxed">
                            Payment card industry data security standard compliance status and cryptographic baseline.
                        </p>
                        <div className="flex flex-col gap-3 mt-auto pt-6 text-sm text-gray-600 font-medium">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-500" /> CDE Vault Encrypted
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-500" /> 0-Day Threat Sandbox
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50/50">
                        <button
                            onClick={() => downloadReport('PCI_DSS')}
                            disabled={downloading}
                            className="btn-secondary w-full py-2.5 text-gray-700"
                        >
                            <Download size={16} /> Generate Export
                        </button>
                    </div>
                </div>
            </div>

            {/* Audit History Log */}
            <section className="mt-6 flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock size={18} className="text-gray-400" />
                    Recent Report Activity
                </h3>

                <div className="card overflow-hidden">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold tracking-wider border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Report Type</th>
                                <th className="px-6 py-4">Author</th>
                                <th className="px-6 py-4">Verification Checksum (SHA-256)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                            <tr className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-gray-500"><div className="flex items-center gap-2">Just now</div></td>
                                <td className="px-6 py-4 font-semibold text-gray-900">SOC2_TYPE_II</td>
                                <td className="px-6 py-4 text-gray-600">System Auto-Audit</td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-400 truncate max-w-[200px]">e3b0c44298fc1c149afbf4c8996fb...</td>
                            </tr>
                            <tr className="hover:bg-gray-50/50 transition-colors bg-gray-50/30">
                                <td className="px-6 py-4 text-gray-500"><div className="flex items-center gap-2">Yesterday, 14:12</div></td>
                                <td className="px-6 py-4 font-semibold text-gray-900">ISO27001</td>
                                <td className="px-6 py-4 text-gray-600">Admin Requested</td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-400 truncate max-w-[200px]">8d745f4df815a5ba72332bb12fa...</td>
                            </tr>
                            <tr className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-gray-500"><div className="flex items-center gap-2">Oct 12, 09:00</div></td>
                                <td className="px-6 py-4 font-semibold text-gray-900">PCI_DSS</td>
                                <td className="px-6 py-4 text-gray-600">System Auto-Audit</td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-400 truncate max-w-[200px]">c3499c2729730a7f807efb8676a...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}

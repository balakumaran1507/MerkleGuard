import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "./components/Layout"
import { EventProvider } from "./context/EventContext"

// Pages
import { Dashboard } from "./pages/Dashboard"
import { NodeFleet } from "./pages/NodeFleet"
import { MerkleInspector } from "./pages/MerkleInspector"
import { AttackSimulator } from "./pages/AttackSimulator"
import { TimelineAudit } from "./pages/TimelineAudit"
import { Analytics } from "./pages/Analytics"
import { NetworkAnalysis } from "./pages/NetworkAnalysis"
import { ThreatModel } from "./pages/ThreatModel"
import { DemoLive } from "./pages/DemoLive"
import { Showcase } from "./pages/Showcase"
import { ComplianceReports } from "./pages/ComplianceReports"

export default function App() {
  return (
    <BrowserRouter>
      <EventProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/nodes" element={<NodeFleet />} />
            <Route path="/demo-live" element={<DemoLive />} />
            <Route path="/showcase" element={<Showcase />} />
            <Route path="/merkle" element={<MerkleInspector />} />
            <Route path="/simulator" element={<AttackSimulator />} />
            <Route path="/timeline" element={<TimelineAudit />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/analysis" element={<NetworkAnalysis />} />
            <Route path="/threat-model" element={<ThreatModel />} />
            <Route path="/compliance" element={<ComplianceReports />} />
          </Routes>
        </Layout>
      </EventProvider>
    </BrowserRouter>
  )
}

import React, { useState } from "react"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

export function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className="flex min-h-screen overflow-hidden"
      style={{ background: "var(--color-bg-primary)" }}
    >
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Header />
        <main
          className="flex-1 overflow-y-auto"
          style={{ padding: "28px 32px" }}
        >
          <div
            className="max-w-[1440px] mx-auto animate-mg-fadeIn"
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

import React, { useState } from "react"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

export function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-bg-primary overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <div className="max-w-[1400px] mx-auto animate-mg-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

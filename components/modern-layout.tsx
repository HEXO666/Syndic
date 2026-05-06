"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { ModernSidebar } from "@/components/modern-sidebar"
import { ModernHeader } from "@/components/modern-header"

interface ModernLayoutProps {
  children: React.ReactNode
  title?: string
}

export function ModernLayout({ children, title }: ModernLayoutProps) {
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!user) return <>{children}</>

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--background)", overflow: "hidden" }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <ModernSidebar />
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            style={{ flex: 1, background: "rgba(21,23,27,.4)" }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <ModernSidebar />
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <ModernHeader
          title={title}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  )
}

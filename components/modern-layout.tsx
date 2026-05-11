"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { ModernSidebar } from "@/components/modern-sidebar"
import { ModernHeader } from "@/components/modern-header"
import { usePathname, useRouter } from "next/navigation"

interface ModernLayoutProps {
  children: React.ReactNode
  title?: string
}

export function ModernLayout({ children, title }: ModernLayoutProps) {
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    if (user.role === "copro" && pathname !== "/espace") {
      router.replace("/espace")
    } else if (user.role === "super_admin" && !pathname.startsWith("/super-admin")) {
      router.replace("/super-admin/organisations")
    }
  }, [user, pathname])

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

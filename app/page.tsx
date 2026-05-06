"use client"

import { useAuth } from "@/lib/auth-context"
import { loadUserPermissions } from "@/lib/permissions"
import { LoginForm } from "@/components/login-form"
import { ModernLayout } from "@/components/modern-layout"
import ModernDashboard from "@/components/modern-dashboard"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user) return
    if (user.role !== "user") return
    const permissions = loadUserPermissions(user.id, user.role)
    // Typical copropriétaire: role=user and no management permission → redirect to portal.
    if (!permissions.manage_coproprietaires) {
      router.replace("/espace")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <ModernLayout title="Tableau de bord">
      <ModernDashboard />
    </ModernLayout>
  )
}

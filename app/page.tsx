"use client"

import { useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"
import { ModernLayout } from "@/components/modern-layout"
import ModernDashboard from "@/components/modern-dashboard"

export default function Home() {
  const { user, isLoading } = useAuth()

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

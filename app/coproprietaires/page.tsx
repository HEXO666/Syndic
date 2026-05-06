"use client"

import { useAuth } from "@/lib/auth-context"
import { loadUserPermissions } from "@/lib/permissions"
import { LoginForm } from "@/components/login-form"
import { ModernLayout } from "@/components/modern-layout"
import ModernCoproprietaires from "@/components/modern-coproprietaires"
import { Shield } from "lucide-react"

export default function CoproprietairesPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) return <LoginForm />

  const permissions = loadUserPermissions(user.id, user.role)
  if (!permissions.manage_coproprietaires) {
    return (
      <ModernLayout title="Copropriétaires">
        <div className="flex flex-col items-center justify-center py-20">
          <Shield className="h-20 w-20 text-red-500/60 mb-6" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Accès Refusé</h1>
          <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
            Vous n&apos;avez pas la permission de gérer les copropriétaires.
          </p>
        </div>
      </ModernLayout>
    )
  }

  return (
    <ModernLayout title="Gestion des Copropriétaires">
      <ModernCoproprietaires />
    </ModernLayout>
  )
}

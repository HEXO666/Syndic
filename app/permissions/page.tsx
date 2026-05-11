"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { getSupabaseClient } from "@/lib/supabase/client"
import {
  type Permissions,
  type PermissionKey,
  getDefaultPermissionsForRole,
  syncPermissionsFromDb,
} from "@/lib/permissions"
import { LoginForm } from "@/components/login-form"
import { ModernLayout } from "@/components/modern-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Shield, User } from "lucide-react"

type StaffUser = {
  id: string
  nom: string
  email: string
  role: "admin" | "user"
  permissions: Permissions
}

const PERMISSION_DEFS: Array<{ key: PermissionKey; label: string; description: string }> = [
  {
    key: "manage_coproprietaires",
    label: "Gérer les copropriétaires",
    description: "Accès au module Copropriétaires (ajout, modification, suppression)",
  },
  {
    key: "create_coproprietaire_accounts",
    label: "Créer des comptes copropriétaires",
    description: "Autorise la création de comptes depuis le module Copropriétaires",
  },
]

export default function PermissionsPage() {
  const { user, isLoading } = useAuth()
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    if (!user || user.role !== "admin") {
      setLoadingUsers(false)
      return
    }
    const supabase = getSupabaseClient()
    void supabase
      .from("profiles")
      .select("id, nom, email, role, permissions")
      .order("nom")
      .then(({ data }) => {
        if (data) {
          setStaffUsers(
            data
              .filter((p) => p.role === "user")
              .map((p) => ({
                id: p.id,
                nom: p.nom,
                email: p.email,
                role: p.role as "admin" | "user",
                permissions: {
                  ...getDefaultPermissionsForRole(p.role as "admin" | "user"),
                  ...(p.permissions as Partial<Permissions>),
                },
              })),
          )
        }
        setLoadingUsers(false)
      })
  }, [user])

  const togglePermission = async (staffId: string, key: PermissionKey, value: boolean) => {
    setSaving(staffId)
    const target = staffUsers.find((u) => u.id === staffId)
    if (!target) { setSaving(null); return }

    const next: Permissions = { ...target.permissions, [key]: value }

    setStaffUsers((prev) =>
      prev.map((u) => (u.id === staffId ? { ...u, permissions: next } : u)),
    )

    const supabase = getSupabaseClient()
    await supabase.from("profiles").update({ permissions: next }).eq("id", staffId)
    syncPermissionsFromDb(staffId, target.role, next)
    setSaving(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!user) return <LoginForm />

  if (user.role !== "admin") {
    return (
      <ModernLayout title="Permissions">
        <div className="p-6 text-slate-600 dark:text-slate-400">Accès réservé à l'administrateur.</div>
      </ModernLayout>
    )
  }

  return (
    <ModernLayout title="Permissions">
      <div className="p-6 space-y-4 max-w-3xl">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Définissez les droits de chaque utilisateur staff. Les modifications sont enregistrées immédiatement.
        </p>

        {loadingUsers ? (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
            Chargement…
          </div>
        ) : staffUsers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500 dark:text-slate-400">
              <User className="h-10 w-10 mx-auto mb-3 opacity-40" />
              Aucun utilisateur staff trouvé.
            </CardContent>
          </Card>
        ) : (
          staffUsers.map((su) => (
            <Card key={su.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    {su.nom}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {saving === su.id && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                    )}
                    <Badge variant="secondary" className="text-xs">{su.email}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {PERMISSION_DEFS.map(({ key, label, description }) => (
                  <div key={key} className="flex items-start gap-3">
                    <Checkbox
                      id={`${su.id}-${key}`}
                      checked={su.permissions[key]}
                      disabled={saving === su.id}
                      onChange={(e) => void togglePermission(su.id, key, e.target.checked)}
                    />
                    <div>
                      <label
                        htmlFor={`${su.id}-${key}`}
                        className="text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
                      >
                        {label}
                      </label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ModernLayout>
  )
}

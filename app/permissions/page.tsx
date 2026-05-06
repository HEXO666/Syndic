"use client"

import { ModernLayout } from "@/components/modern-layout"
import { LoginForm } from "@/components/login-form"
import { usePermissions } from "@/hooks/use-permissions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function PermissionsPage() {
  const { user, isLoading, permissions, setPermissions } = usePermissions()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
      <div className="p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Permissions (utilisateur courant)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-3">
              <Checkbox
                id="perm-manage-copro"
                checked={permissions.manage_coproprietaires}
                onChange={(e) =>
                  setPermissions({
                    ...permissions,
                    manage_coproprietaires: e.target.checked,
                  })
                }
              />
              <div>
                <Label htmlFor="perm-manage-copro" className="font-medium">
                  Gérer les copropriétaires
                </Label>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Affiche l'accès au module Copropriétaires.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="perm-create-copro-accounts"
                checked={permissions.create_coproprietaire_accounts}
                onChange={(e) =>
                  setPermissions({
                    ...permissions,
                    create_coproprietaire_accounts: e.target.checked,
                  })
                }
              />
              <div>
                <Label htmlFor="perm-create-copro-accounts" className="font-medium">
                  Créer des comptes copropriétaires
                </Label>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Autorise la création de comptes depuis Copropriétaires.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModernLayout>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  type Permissions,
  loadUserPermissions,
  saveUserPermissions,
  getDefaultPermissionsForRole,
} from "@/lib/permissions"

export function usePermissions() {
  const { user, isLoading } = useAuth()
  const [permissions, setPermissions] = useState<Permissions>(() => getDefaultPermissionsForRole("user"))

  useEffect(() => {
    if (!user) return
    setPermissions(loadUserPermissions(user.id, user.role))
  }, [user])

  const updatePermissionsForCurrentUser = (next: Permissions) => {
    if (!user) return
    setPermissions(next)
    saveUserPermissions(user.id, next)
  }

  const can = useMemo(() => {
    return {
      manageCoproprietaires: !!permissions.manage_coproprietaires,
      createCoproprietaireAccounts: !!permissions.create_coproprietaire_accounts,
    }
  }, [permissions])

  return {
    isLoading,
    user,
    permissions,
    setPermissions: updatePermissionsForCurrentUser,
    can,
  }
}

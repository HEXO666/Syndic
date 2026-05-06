"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  type Permissions,
  loadUserPermissions,
  saveUserPermissions,
  getDefaultPermissionsForRole,
} from "@/lib/permissions"
import { getSupabaseClient } from "@/lib/supabase/client"

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
    // Persist to Supabase so permissions survive across devices.
    const supabase = getSupabaseClient()
    void supabase.from("profiles").update({ permissions: next }).eq("id", user.id)
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

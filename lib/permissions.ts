export type PermissionKey = "manage_coproprietaires" | "create_coproprietaire_accounts"

export type Permissions = Record<PermissionKey, boolean>

export const DEFAULT_PERMISSIONS_ADMIN: Permissions = {
  manage_coproprietaires: true,
  create_coproprietaire_accounts: true,
}

export const DEFAULT_PERMISSIONS_USER: Permissions = {
  manage_coproprietaires: false,
  create_coproprietaire_accounts: false,
}

function storageKeyForUser(userId: string) {
  return `syndic-permissions:${userId}`
}

export function getDefaultPermissionsForRole(role: "admin" | "user"): Permissions {
  return role === "admin" ? DEFAULT_PERMISSIONS_ADMIN : DEFAULT_PERMISSIONS_USER
}

export function loadUserPermissions(userId: string, role: "admin" | "user"): Permissions {
  if (typeof window === "undefined") return getDefaultPermissionsForRole(role)

  const raw = window.localStorage.getItem(storageKeyForUser(userId))
  if (!raw) return getDefaultPermissionsForRole(role)

  try {
    const parsed = JSON.parse(raw) as Partial<Permissions>
    return {
      ...getDefaultPermissionsForRole(role),
      ...parsed,
    }
  } catch {
    return getDefaultPermissionsForRole(role)
  }
}

export function saveUserPermissions(userId: string, permissions: Permissions) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(storageKeyForUser(userId), JSON.stringify(permissions))
}

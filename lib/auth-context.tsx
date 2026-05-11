"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getSupabaseClient } from "./supabase/client"
import type { Profile } from "./supabase/types"
import { syncPermissionsFromDb } from "./permissions"

export type UserRole = "admin" | "user" | "copro" | "super_admin" | "syndic"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  organisation_id?: string | null
  assignedImmeubleIds?: string[]
}

interface AuthContextType {
  user: User | null
  users: User[]
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  addUser: (userData: { name: string; email: string; role: UserRole; password: string }) => void
  updateUser: (id: string, userData: Partial<User & { password?: string }>) => void
  deleteUser: (id: string) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function profileToUser(p: Profile, assignedImmeubleIds?: string[]): User {
  return { id: p.id, email: p.email, name: p.nom, role: p.role as UserRole, organisation_id: p.organisation_id, assignedImmeubleIds }
}

function applyProfileSideEffects(profile: Profile) {
  syncPermissionsFromDb(profile.id, profile.role, profile.permissions ?? {})
}

async function loadSyndicImmeubles(supabase: ReturnType<typeof getSupabaseClient>, userId: string): Promise<string[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("syndic_immeubles").select("immeuble_id").eq("syndic_id", userId)
  return (data as { immeuble_id: string }[] | null)?.map((r) => r.immeuble_id) ?? []
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = getSupabaseClient()

  const loadUsers = async () => {
    const { data } = await supabase.from("profiles").select("*").order("nom")
    if (data) setUsers((data as Profile[]).map((p) => profileToUser(p)))
  }

  useEffect(() => {
    // Safety: never keep isLoading stuck forever (network timeout, etc.)
    const safetyTimer = setTimeout(() => setIsLoading(false), 8000)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
        if (profile) {
          const p = profile as Profile
          applyProfileSideEffects(p)
          const immeubleIds = p.role === "syndic" ? await loadSyndicImmeubles(supabase, p.id) : undefined
          setUser(profileToUser(p, immeubleIds))
          await loadUsers()
        }
      }
      clearTimeout(safetyTimer)
      setIsLoading(false)
    }).catch(() => {
      clearTimeout(safetyTimer)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
        if (profile) {
          const p = profile as Profile
          applyProfileSideEffects(p)
          const immeubleIds = p.role === "syndic" ? await loadSyndicImmeubles(supabase, p.id) : undefined
          setUser(profileToUser(p, immeubleIds))
          await loadUsers()
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setUsers([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setIsLoading(false)
    return !error
  }

  const logout = async () => {
    setUser(null)
    setUsers([])
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const addUser = async (userData: { name: string; email: string; role: UserRole; password: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: { data: { nom: userData.name, role: userData.role } },
    })
    if (!error && data.user) {
      await supabase
        .from("profiles")
        .update({ nom: userData.name, role: userData.role as "admin" | "user" | "copro" | "super_admin" })
        .eq("id", data.user.id)
      await loadUsers()
    }
  }

  const updateUser = async (id: string, userData: Partial<User & { password?: string }>) => {
    type ProfileUpdate = { nom?: string; role?: "admin" | "user" | "copro" | "super_admin" | "syndic" }
    const updates: ProfileUpdate = {}
    if (userData.name !== undefined) updates.nom = userData.name
    if (userData.role !== undefined) updates.role = userData.role
    if (Object.keys(updates).length > 0) {
      await supabase.from("profiles").update(updates).eq("id", id)
    }
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...userData } : u)))
    if (user?.id === id) {
      setUser((prev) => (prev ? { ...prev, ...userData } : null))
    }
  }

  const deleteUser = async (id: string) => {
    await supabase.from("profiles").delete().eq("id", id)
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  return (
    <AuthContext.Provider
      value={{ user, users, login, logout, addUser, updateUser, deleteUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider")
  return context
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { loadUserPermissions } from "@/lib/permissions"
import { useData } from "@/lib/data-context"
import { LoginForm } from "@/components/login-form"
import { ModernLayout } from "@/components/modern-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card-enhanced"
import { Button } from "@/components/ui/button-enhanced"
import { Input } from "@/components/ui/input-enhanced"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { KeyRound, Pencil, Shield, UserPlus } from "lucide-react"

type Account = {
  userId: string
  email: string
  username: string
  disabled: boolean
  bannedUntil: string | null
  copro: null | {
    id: string
    nom: string
    prenom: string
    cin: string | null
    numeroAppartement: string
  }
}

export default function AjouterCoproPage() {
  const { user, isLoading } = useAuth()
  const permissions = useMemo(() => {
    if (!user) return null
    return loadUserPermissions(user.id, user.role)
  }, [user])

  const canManage = !!permissions?.create_coproprietaire_accounts

  const { coproprietaires } = useData()

  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = async () => {
    setLoadingAccounts(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/copro-accounts")
      const data = (await res.json()) as { accounts?: Account[]; error?: string }
      if (!res.ok) throw new Error(data.error || "Erreur lors du chargement")
      setAccounts(data.accounts ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue")
    } finally {
      setLoadingAccounts(false)
    }
  }

  useEffect(() => {
    if (!user) return
    if (user.role !== "admin") return
    if (!canManage) return
    void reload()
  }, [user, canManage])

  const coproOptions = useMemo(() => {
    return [...coproprietaires].sort((a, b) => `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`))
  }, [coproprietaires])

  const [selectedCoproId, setSelectedCoproId] = useState<string>("")
  const selectedCopro = useMemo(() => {
    return coproOptions.find((c) => c.id === selectedCoproId) ?? null
  }, [coproOptions, selectedCoproId])

  const [createUsername, setCreateUsername] = useState("")
  const [createEmail, setCreateEmail] = useState("")
  const [createPassword, setCreatePassword] = useState("")
  const [creating, setCreating] = useState(false)
  const [createMsg, setCreateMsg] = useState<string | null>(null)

  useEffect(() => {
    setCreateMsg(null)
    if (!selectedCopro) return
    if (!createUsername) {
      setCreateUsername(`${selectedCopro.prenom}.${selectedCopro.nom}`.toLowerCase().replaceAll(" ", ""))
    }
  }, [selectedCopro])

  const createAccount = async () => {
    if (!selectedCopro) return

    setCreating(true)
    setCreateMsg(null)

    try {
      const res = await fetch("/api/admin/create-copro-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createEmail,
          password: createPassword,
          coproprietaireId: selectedCopro.id,
          coproprietaireCin: selectedCopro.cin || undefined,
          coproprietaireName: `${selectedCopro.prenom} ${selectedCopro.nom}`,
        }),
      })

      const data = (await res.json()) as { error?: string; email?: string }
      if (!res.ok) throw new Error(data.error || "Erreur lors de la création")

      // store username (optional) after creation
      if (data.email) {
        const createdUser = accounts.find((a) => a.email === data.email)
        // if we cannot find it yet, reload then patch
      }

      setCreateMsg(`Compte créé: ${data.email ?? createEmail}`)
      setCreateEmail("")
      setCreatePassword("")
      setSelectedCoproId("")
      setCreateUsername("")
      await reload()

      if (createUsername) {
        const created = (await fetch("/api/admin/copro-accounts").then((r) => r.json())) as { accounts?: Account[] }
        const createdAccount = (created.accounts ?? []).find((a) => a.email === (data.email ?? createEmail))
        if (createdAccount) {
          await fetch("/api/admin/copro-accounts", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: createdAccount.userId, username: createUsername }),
          })
          await reload()
        }
      }
    } catch (e) {
      setCreateMsg(e instanceof Error ? e.message : "Erreur inconnue")
    } finally {
      setCreating(false)
    }
  }

  const [editOpen, setEditOpen] = useState(false)
  const [editAccount, setEditAccount] = useState<Account | null>(null)
  const [editEmail, setEditEmail] = useState("")
  const [editUsername, setEditUsername] = useState("")
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editMsg, setEditMsg] = useState<string | null>(null)

  const openEdit = (a: Account) => {
    setEditAccount(a)
    setEditEmail(a.email)
    setEditUsername(a.username)
    setEditMsg(null)
    setEditOpen(true)
  }

  const submitEdit = async () => {
    if (!editAccount) return
    setEditSubmitting(true)
    setEditMsg(null)
    try {
      const res = await fetch("/api/admin/copro-accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editAccount.userId,
          email: editEmail,
          username: editUsername,
        }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error || "Erreur")
      await reload()
      setEditMsg("Enregistré")
    } catch (e) {
      setEditMsg(e instanceof Error ? e.message : "Erreur inconnue")
    } finally {
      setEditSubmitting(false)
    }
  }

  const [resetOpen, setResetOpen] = useState(false)
  const [resetAccount, setResetAccount] = useState<Account | null>(null)
  const [resetPassword, setResetPassword] = useState("")
  const [resetSubmitting, setResetSubmitting] = useState(false)
  const [resetMsg, setResetMsg] = useState<string | null>(null)

  const openReset = (a: Account) => {
    setResetAccount(a)
    setResetPassword("")
    setResetMsg(null)
    setResetOpen(true)
  }

  const submitReset = async () => {
    if (!resetAccount) return
    setResetSubmitting(true)
    setResetMsg(null)
    try {
      const res = await fetch("/api/admin/copro-accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: resetAccount.userId,
          password: resetPassword,
        }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error || "Erreur")
      setResetMsg("Mot de passe mis à jour")
    } catch (e) {
      setResetMsg(e instanceof Error ? e.message : "Erreur inconnue")
    } finally {
      setResetSubmitting(false)
    }
  }

  const toggleDisabled = async (a: Account) => {
    const res = await fetch("/api/admin/copro-accounts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: a.userId, disabled: !a.disabled }),
    })
    if (res.ok) await reload()
  }

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
      <ModernLayout title="Ajouter une copro">
        <div className="flex flex-col items-center justify-center py-20">
          <Shield className="h-20 w-20 text-red-500/60 mb-6" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Accès Refusé</h1>
          <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
            Vous devez être administrateur pour gérer les comptes copropriétaires.
          </p>
        </div>
      </ModernLayout>
    )
  }

  if (!canManage) {
    return (
      <ModernLayout title="Ajouter une copro">
        <div className="flex flex-col items-center justify-center py-20">
          <Shield className="h-20 w-20 text-red-500/60 mb-6" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Permission manquante</h1>
          <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
            Active la permission “Créer des comptes copropriétaires” dans l'écran Permissions.
          </p>
        </div>
      </ModernLayout>
    )
  }

  return (
    <ModernLayout title="Ajouter une copro">
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Créer un compte copropriétaire</CardTitle>
            <CardDescription>
              Sélectionne un copropriétaire existant, puis crée ses identifiants (email + mot de passe).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Copropriétaire</Label>
                <Select value={selectedCoproId} onValueChange={setSelectedCoproId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un copropriétaire" />
                  </SelectTrigger>
                  <SelectContent>
                    {coproOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.prenom} {c.nom} — Apt {c.numeroAppartement}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Input
                variant="modern"
                size="lg"
                label="Username"
                value={createUsername}
                onChange={(e) => setCreateUsername(e.target.value)}
                placeholder="ex: prenom.nom"
              />

              <Input
                variant="modern"
                size="lg"
                label="Email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="copro@example.com"
              />

              <Input
                variant="modern"
                size="lg"
                label="Password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="mot de passe temporaire"
              />
            </div>

            {createMsg && (
              <div className="text-sm text-slate-600 dark:text-slate-400">{createMsg}</div>
            )}

            <div className="flex justify-end">
              <Button
                variant="default"
                leftIcon={<UserPlus className="h-4 w-4" />}
                disabled={!selectedCopro || !createEmail || !createPassword || creating}
                onClick={createAccount}
              >
                {creating ? "Création…" : "Créer compte"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comptes copropriétaires</CardTitle>
            <CardDescription>Modifier, réinitialiser le mot de passe, activer/désactiver.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {loadingAccounts ? "Chargement…" : `${accounts.length} compte(s)`}
              </div>
              <Button variant="outline" onClick={() => void reload()}>
                Rafraîchir
              </Button>
            </div>

            <div className="space-y-2">
              {accounts.map((a) => (
                <div
                  key={a.userId}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-slate-900 dark:text-white truncate">{a.username}</div>
                      {a.disabled ? (
                        <Badge variant="destructive">Désactivé</Badge>
                      ) : (
                        <Badge variant="default">Actif</Badge>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 truncate">{a.email}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {a.copro ? (
                        <>
                          {a.copro.prenom} {a.copro.nom} • Apt {a.copro.numeroAppartement} • CIN {a.copro.cin || "—"}
                        </>
                      ) : (
                        "Copro non trouvé"
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Pencil className="h-3 w-3" />}
                      onClick={() => openEdit(a)}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<KeyRound className="h-3 w-3" />}
                      onClick={() => openReset(a)}
                    >
                      Réinitialiser password
                    </Button>
                    <Button
                      variant={a.disabled ? "success" : "destructive"}
                      size="sm"
                      onClick={() => void toggleDisabled(a)}
                    >
                      {a.disabled ? "Activer" : "Désactiver"}
                    </Button>
                  </div>
                </div>
              ))}

              {accounts.length === 0 && !loadingAccounts && (
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Aucun compte copropriétaire trouvé. Crée le premier compte ci-dessus.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier compte</DialogTitle>
              <DialogDescription>{editAccount?.email}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                />
              </div>
              {editMsg && <div className="text-sm text-slate-600 dark:text-slate-400">{editMsg}</div>}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editSubmitting}>
                Fermer
              </Button>
              <Button variant="default" onClick={submitEdit} disabled={editSubmitting || !editEmail}>
                {editSubmitting ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={resetOpen} onOpenChange={setResetOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
              <DialogDescription>{resetAccount?.email}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nouveau mot de passe</Label>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="mot de passe temporaire"
                />
              </div>
              {resetMsg && <div className="text-sm text-slate-600 dark:text-slate-400">{resetMsg}</div>}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setResetOpen(false)} disabled={resetSubmitting}>
                Fermer
              </Button>
              <Button
                variant="default"
                onClick={submitReset}
                disabled={resetSubmitting || resetPassword.length < 6}
              >
                {resetSubmitting ? "Mise à jour…" : "Mettre à jour"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ModernLayout>
  )
}

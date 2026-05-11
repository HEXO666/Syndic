"use client"

import { useMemo, useState } from "react"
import { useData } from "@/lib/data-context"
import { useAuth } from "@/lib/auth-context"
import { loadUserPermissions } from "@/lib/permissions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card-enhanced"
import { Button } from "@/components/ui/button-enhanced"
import { Input } from "@/components/ui/input-enhanced"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { ModernCoproprietaireForm } from "@/components/modern-coproprietaire-form"
import {
  Users, Search, Plus, Edit, Trash2, Phone, MapPin, Building, Euro,
  AlertTriangle, CheckCircle, Filter, Download, Eye, UserPlus,
} from "lucide-react"
import type { Coproprietaire } from "@/lib/data-context"

export default function ModernCoproprietaires() {
  const { coproprietaires, deleteCoproprietaire, getPaiementsByCoproprietaire } = useData()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCoproprietaire, setSelectedCoproprietaire] = useState<Coproprietaire | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState<"all" | "debtors" | "current">("all")

  // delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Coproprietaire | null>(null)

  // details dialog
  const [detailsCopro, setDetailsCopro] = useState<Coproprietaire | null>(null)

  const permissions = useMemo(() => {
    if (!user) return null
    return loadUserPermissions(user.id, user.role)
  }, [user])

  const canCreateCoproAccounts = !!permissions?.create_coproprietaire_accounts

  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [accountCopro, setAccountCopro] = useState<Coproprietaire | null>(null)
  const [accountEmail, setAccountEmail] = useState("")
  const [accountPassword, setAccountPassword] = useState("")
  const [accountSubmitting, setAccountSubmitting] = useState(false)
  const [accountError, setAccountError] = useState<string | null>(null)
  const [accountSuccess, setAccountSuccess] = useState<string | null>(null)

  const filteredCoproprietaires = coproprietaires.filter((c) => {
    const matchesSearch =
      c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.bloque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.immeuble.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.numeroAppartement.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "debtors" && c.totalDettes > 0) ||
      (filterStatus === "current" && c.totalDettes === 0)
    return matchesSearch && matchesFilter
  })

  const handleEdit = (c: Coproprietaire) => { setSelectedCoproprietaire(c); setShowForm(true) }
  const handleFormSuccess = () => { setShowForm(false); setSelectedCoproprietaire(null) }

  const openCreateAccount = (c: Coproprietaire) => {
    setAccountCopro(c); setAccountEmail(""); setAccountPassword("")
    setAccountError(null); setAccountSuccess(null); setAccountDialogOpen(true)
  }

  const submitCreateAccount = async () => {
    if (!accountCopro) return
    setAccountSubmitting(true); setAccountError(null); setAccountSuccess(null)
    try {
      const res = await fetch("/api/admin/create-copro-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: accountEmail, password: accountPassword,
          coproprietaireId: accountCopro.id,
          coproprietaireCin: accountCopro.cin || undefined,
          coproprietaireName: `${accountCopro.prenom} ${accountCopro.nom}`,
        }),
      })
      const data = (await res.json()) as { error?: string; email?: string }
      if (!res.ok) throw new Error(data.error || "Erreur")
      setAccountSuccess(`Compte créé: ${data.email ?? accountEmail}`)
    } catch (e) {
      setAccountError(e instanceof Error ? e.message : "Erreur inconnue")
    } finally {
      setAccountSubmitting(false)
    }
  }

  const statusBadge = (c: Coproprietaire) =>
    c.totalDettes === 0 ? (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
        <CheckCircle className="h-3 w-3 mr-1" />À jour
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
        <AlertTriangle className="h-3 w-3 mr-1" />
        {c.totalDettes.toLocaleString()} DH de dette
      </Badge>
    )

  const statutColor = (s: string) => {
    if (s === "paye")   return "bg-emerald-100 text-emerald-700"
    if (s === "partiel") return "bg-amber-100 text-amber-700"
    return "bg-red-100 text-red-700"
  }
  const statutLabel = (s: string) =>
    s === "paye" ? "Payé" : s === "partiel" ? "Partiel" : "Impayé"

  if (showForm) {
    return (
      <div className="p-6 bg-[var(--background)] min-h-screen">
        <ModernCoproprietaireForm
          coproprietaire={selectedCoproprietaire}
          onSuccess={handleFormSuccess}
          onCancel={() => { setShowForm(false); setSelectedCoproprietaire(null) }}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-[var(--background)] min-h-screen">

      {/* ── Créer compte dialog ───────────────────────────────────── */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un compte copropriétaire</DialogTitle>
            <DialogDescription>
              {accountCopro ? `Pour ${accountCopro.prenom} ${accountCopro.nom} (CIN: ${accountCopro.cin || "—"})` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <input type="email" className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} placeholder="copro@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Mot de passe temporaire</Label>
              <input type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={accountPassword} onChange={(e) => setAccountPassword(e.target.value)} placeholder="ex: copro123" />
            </div>
            {accountError   && <p className="text-sm text-red-600">{accountError}</p>}
            {accountSuccess && <p className="text-sm text-emerald-600">{accountSuccess}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAccountDialogOpen(false)} disabled={accountSubmitting}>Fermer</Button>
            <Button onClick={submitCreateAccount} disabled={accountSubmitting || !accountEmail || !accountPassword}
              leftIcon={<UserPlus className="h-4 w-4" />}>
              {accountSubmitting ? "Création…" : "Créer le compte"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm dialog ─────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le copropriétaire</AlertDialogTitle>
            <AlertDialogDescription>
              Supprimer <strong>{deleteTarget?.prenom} {deleteTarget?.nom}</strong> ? Cette action est irréversible et supprimera tous ses paiements associés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => { if (deleteTarget) { deleteCoproprietaire(deleteTarget.id); setDeleteTarget(null) } }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Details dialog ────────────────────────────────────────── */}
      <Dialog open={!!detailsCopro} onOpenChange={(o) => { if (!o) setDetailsCopro(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {detailsCopro?.prenom} {detailsCopro?.nom}
            </DialogTitle>
            <DialogDescription>
              {detailsCopro?.bloque} · {detailsCopro?.immeuble} · Apt {detailsCopro?.numeroAppartement}
            </DialogDescription>
          </DialogHeader>

          {detailsCopro && (() => {
            const paiements = getPaiementsByCoproprietaire(detailsCopro.id)
              .sort((a, b) => b.annee.localeCompare(a.annee))
            return (
              <div className="space-y-4">
                {/* Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 uppercase font-medium">Contact</p>
                    <p className="text-slate-700 dark:text-slate-300">{detailsCopro.telephone || "—"}</p>
                    {detailsCopro.telephoneEtranger && <p className="text-slate-500">{detailsCopro.telephoneEtranger}</p>}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 uppercase font-medium">CIN</p>
                    <p className="text-slate-700 dark:text-slate-300">{detailsCopro.cin || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 uppercase font-medium">Cotisation</p>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold">{detailsCopro.montantAnnuel.toLocaleString()} DH/an</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 uppercase font-medium">Total dettes</p>
                    <p className={`font-semibold ${detailsCopro.totalDettes > 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {detailsCopro.totalDettes > 0 ? `${detailsCopro.totalDettes.toLocaleString()} DH` : "À jour"}
                    </p>
                  </div>
                </div>

                {/* Paiements */}
                <div>
                  <p className="text-xs text-slate-400 uppercase font-medium mb-2">Historique des paiements</p>
                  {paiements.length === 0 ? (
                    <div className="text-center py-6 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                      <p className="text-sm text-red-600 font-medium">Aucun paiement enregistré</p>
                      <p className="text-xs text-red-500 mt-1">Cotisation annuelle de {detailsCopro.montantAnnuel.toLocaleString()} DH due</p>
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-52 overflow-y-auto">
                      {paiements.map((p) => (
                        <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800 dark:text-slate-200">{p.annee}</span>
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${statutColor(p.statut)}`}>
                              {statutLabel(p.statut)}
                            </span>
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white">{p.montant.toLocaleString()} DH</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

          <DialogFooter>
            <Button variant="outline" onClick={() => handleEdit(detailsCopro!)} leftIcon={<Edit className="h-4 w-4" />}>Modifier</Button>
            <Button onClick={() => setDetailsCopro(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-800 dark:from-white dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
            Copropriétaires
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gestion des propriétaires et de leurs informations</p>
        </div>
        <Button onClick={() => setShowForm(true)} leftIcon={<Plus className="h-4 w-4" />} className="shadow-lg">
          Nouveau copropriétaire
        </Button>
      </div>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: coproprietaires.length, icon: Users, color: "blue" },
          { label: "À jour", value: coproprietaires.filter(c => c.totalDettes === 0).length, icon: CheckCircle, color: "emerald" },
          { label: "Débiteurs", value: coproprietaires.filter(c => c.totalDettes > 0).length, icon: AlertTriangle, color: "red" },
          { label: "DH de dettes", value: coproprietaires.reduce((s, c) => s + c.totalDettes, 0).toLocaleString(), icon: Euro, color: "amber" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-${color}-100 dark:bg-${color}-900 text-${color}-600 rounded-lg flex items-center justify-center`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Filters ──────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="flex-1 max-w-md">
                <Input variant="modern" leftIcon={<Search className="h-4 w-4" />}
                  placeholder="Rechercher par nom, bloc, immeuble..."
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex gap-2">
                {(["all","current","debtors"] as const).map((f) => (
                  <Button key={f} variant={filterStatus === f ? "default" : "outline"} size="sm"
                    onClick={() => setFilterStatus(f)}>
                    {f === "all" ? "Tous" : f === "current" ? "À jour" : "Débiteurs"}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" leftIcon={<Filter className="h-4 w-4" />}>Filtres</Button>
              <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Exporter</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Cards grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredCoproprietaires.map((coprop) => (
          <Card key={coprop.id} variant="interactive" className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 bg-[var(--ink)] rounded-[8px] flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {coprop.prenom.charAt(0)}{coprop.nom.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{coprop.prenom} {coprop.nom}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs truncate">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      {coprop.bloque} · {coprop.immeuble} · Apt {coprop.numeroAppartement}
                    </CardDescription>
                  </div>
                </div>
                {/* Delete icon in top-right */}
                <button
                  onClick={() => setDeleteTarget(coprop)}
                  className="flex-shrink-0 p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-2">{statusBadge(coprop)}</div>
            </CardHeader>

            <CardContent className="pt-0 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{coprop.telephone || "—"}</span>
                {coprop.telephoneEtranger && <><span>·</span><span>{coprop.telephoneEtranger}</span></>}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Building className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Titre foncier: {coprop.titreFoncier || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Euro className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Cotisation: {coprop.montantAnnuel.toLocaleString()} DH/an</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(coprop)}
                  leftIcon={<Edit className="h-3 w-3" />}>
                  Modifier
                </Button>
                {canCreateCoproAccounts && (
                  <Button variant="outline" size="sm" onClick={() => openCreateAccount(coprop)}
                    leftIcon={<UserPlus className="h-3 w-3" />}>
                    Compte
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setDetailsCopro(coprop)}
                  leftIcon={<Eye className="h-3 w-3" />}>
                  Détails
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCoproprietaires.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Aucun copropriétaire trouvé</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {searchTerm ? "Aucun résultat pour votre recherche" : "Commencez par ajouter des copropriétaires"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowForm(true)} leftIcon={<Plus className="h-4 w-4" />}>
                    Ajouter le premier copropriétaire
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

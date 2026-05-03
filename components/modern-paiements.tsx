"use client"

import { useMemo, useState } from "react"
import { ModernPaiementForm } from "@/components/modern-paiement-form"
import { Button } from "@/components/ui/button-enhanced"
import { Input } from "@/components/ui/input-enhanced"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card-enhanced"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useData, type Paiement } from "@/lib/data-context"
import {
  CreditCard,
  Search,
  Plus,
  Edit,
  Trash2,
  Euro,
  Banknote,
  Building,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  Filter,
} from "lucide-react"

const statusLabels: Record<Paiement["statut"], { label: string; badgeClass: string }> = {
  paye: { label: "Payé", badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  partiel: { label: "En cours", badgeClass: "bg-amber-100 text-amber-700 border-amber-200" },
  impaye: { label: "En retard", badgeClass: "bg-red-100 text-red-700 border-red-200" },
}

const methodLabels: Record<Paiement["methodePaiement"], string> = {
  especes: "Espèces",
  virement: "Virement bancaire",
  cheque: "Chèque",
}

export default function ModernPaiements() {
  const { paiements, deletePaiement, coproprietaires } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | Paiement["statut"]>("all")
  const [methodFilter, setMethodFilter] = useState<"all" | Paiement["methodePaiement"]>("all")
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedPaiement, setSelectedPaiement] = useState<Paiement | null>(null)
  const [prefillCoproId, setPrefillCoproId] = useState<string | undefined>(undefined)

  const normalizedSearch = searchTerm.trim().toLowerCase()

  const availableYears = useMemo(() => {
    const years = new Set<string>()
    paiements.forEach((p) => years.add(p.annee))
    return Array.from(years).sort((a, b) => Number(b) - Number(a))
  }, [paiements])

  const filteredPaiements = useMemo(() => {
    return paiements.filter((paiement) => {
      const matchesSearch =
        !normalizedSearch ||
        paiement.coproprietaireNom.toLowerCase().includes(normalizedSearch) ||
        paiement.annee.includes(normalizedSearch) ||
        (paiement.notes && paiement.notes.toLowerCase().includes(normalizedSearch))

      const matchesStatus = statusFilter === "all" || paiement.statut === statusFilter
      const matchesMethod = methodFilter === "all" || paiement.methodePaiement === methodFilter
      const matchesYear = yearFilter === "all" || paiement.annee === yearFilter

      return matchesSearch && matchesStatus && matchesMethod && matchesYear
    })
  }, [paiements, normalizedSearch, statusFilter, methodFilter, yearFilter])

  const totalPaiements = paiements.length
  const montantEncaisse = useMemo(
    () => paiements.reduce((sum, p) => sum + (p.statut === "paye" ? p.montant : 0), 0),
    [paiements],
  )
  const paiementsEnCours = useMemo(() => paiements.filter((p) => p.statut === "partiel").length, [paiements])
  const paiementsEnRetard = useMemo(() => paiements.filter((p) => p.statut === "impaye").length, [paiements])

  const handleAdd = () => {
    setSelectedPaiement(null)
    setPrefillCoproId(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (paiement: Paiement) => {
    setSelectedPaiement(paiement)
    setPrefillCoproId(paiement.coproprietaireId)
    setIsFormOpen(true)
  }

  const handleDelete = (paiement: Paiement) => {
    const confirmation = window.confirm(
      `Supprimer le paiement de ${paiement.coproprietaireNom} pour ${paiement.annee} ?`,
    )
    if (confirmation) {
      deletePaiement(paiement.id)
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setSelectedPaiement(null)
    setPrefillCoproId(undefined)
  }

  const formatDate = (value: string) => {
    if (!value) return "—"
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      return value
    }
    return parsed.toLocaleDateString("fr-FR")
  }

  return (
    <div className="min-h-full p-6 space-y-6 bg-[var(--background)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-800 dark:from-white dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
            Paiements
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Consultez les paiements, filtrez par statut et ajoutez de nouvelles entrées.
          </p>
        </div>
        <Dialog
          open={isFormOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleFormClose()
            } else {
              setIsFormOpen(true)
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              
              size="lg"
              onClick={handleAdd}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Nouveau paiement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPaiement ? "Modifier le paiement" : "Nouveau paiement"}</DialogTitle>
              <DialogDescription>
                {selectedPaiement
                  ? "Mettez à jour les détails de ce paiement."
                  : "Ajoutez un nouveau paiement en renseignant les informations nécessaires."}
              </DialogDescription>
            </DialogHeader>
            <ModernPaiementForm
              paiement={selectedPaiement}
              coproprietaireId={prefillCoproId}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total paiements</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{totalPaiements}</p>
            </div>
          </CardContent>
        </Card>

        <Card >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
              <Euro className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Montant encaissé</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                {montantEncaisse.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DH
              </p>
            </div>
          </CardContent>
        </Card>

        <Card >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Paiements en cours</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{paiementsEnCours}</p>
            </div>
          </CardContent>
        </Card>

        <Card >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Paiements en retard</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{paiementsEnRetard}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card >
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">Filtrer les paiements</CardTitle>
          <CardDescription>
            Recherchez par nom, année ou note et filtrez par statut, méthode et année.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex-1">
            <Input
              variant="modern"
              leftIcon={<Search className="h-4 w-4" />}
              placeholder="Rechercher un paiement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
              <SelectTrigger className="w-48 h-11 rounded-xl border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="paye">Payé</SelectItem>
                <SelectItem value="partiel">En cours</SelectItem>
                <SelectItem value="impaye">En retard</SelectItem>
              </SelectContent>
            </Select>

            <Select value={methodFilter} onValueChange={(value) => setMethodFilter(value as typeof methodFilter)}>
              <SelectTrigger className="w-48 h-11 rounded-xl border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Méthode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les méthodes</SelectItem>
                <SelectItem value="especes">Espèces</SelectItem>
                <SelectItem value="virement">Virement</SelectItem>
                <SelectItem value="cheque">Chèque</SelectItem>
              </SelectContent>
            </Select>

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-40 h-11 rounded-xl border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les années</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card variant="gradient" className="border border-slate-200/60 dark:border-slate-700/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-4 w-4" />
            Liste des paiements
          </CardTitle>
          <CardDescription>
            {filteredPaiements.length} paiement{filteredPaiements.length > 1 ? "s" : ""} trouvé{filteredPaiements.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Copropriétaire</th>
                  <th className="px-6 py-3 text-left font-semibold">Localisation</th>
                  <th className="px-6 py-3 text-left font-semibold">Année</th>
                  <th className="px-6 py-3 text-left font-semibold">Montant</th>
                  <th className="px-6 py-3 text-left font-semibold">Méthode</th>
                  <th className="px-6 py-3 text-left font-semibold">Statut</th>
                  <th className="px-6 py-3 text-left font-semibold">Date</th>
                  <th className="px-6 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/60">
                {filteredPaiements.map((paiement) => {
                  const copro = coproprietaires.find((c) => c.id === paiement.coproprietaireId)
                  const statusInfo = statusLabels[paiement.statut]

                  return (
                    <tr key={paiement.id} className="bg-white/70 dark:bg-slate-900/40">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">{paiement.coproprietaireNom}</div>
                        {paiement.notes && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{paiement.notes}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {copro ? (
                          <div className="space-y-1">
                            <div>{copro.bloque}</div>
                            <div className="text-xs">{copro.immeuble} • Apt {copro.numeroAppartement}</div>
                          </div>
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          {paiement.annee}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-900 dark:text-white font-semibold">
                        {paiement.montant.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DH
                        {paiement.montantRestant > 0 && (
                          <div className="text-xs text-amber-600 dark:text-amber-400">
                            Restant: {paiement.montantRestant.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DH
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="gap-2">
                          {paiement.methodePaiement === "especes" ? (
                            <Banknote className="h-3 w-3" />
                          ) : (
                            <Building className="h-3 w-3" />
                          )}
                          {methodLabels[paiement.methodePaiement]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={statusInfo.badgeClass}>
                          {paiement.statut === "paye" ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {formatDate(paiement.datePaiement)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(paiement)}
                            leftIcon={<Edit className="h-3 w-3" />}
                          >
                            Modifier
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(paiement)}
                            leftIcon={<Trash2 className="h-3 w-3" />}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {filteredPaiements.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                      Aucun paiement ne correspond aux filtres sélectionnés.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

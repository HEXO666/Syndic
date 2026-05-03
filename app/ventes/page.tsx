"use client"

import { useMemo, useState } from "react"
import { ModernLayout } from "@/components/modern-layout"
import { useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"
import { useData, type Vente } from "@/lib/data-context"
import { Button } from "@/components/ui/button-enhanced"
import { Input } from "@/components/ui/input"
import { VenteForm } from "@/components/vente-form"
import { VentesTable } from "@/components/ventes-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Store } from "lucide-react"

export default function VentesPage() {
  const { user, isLoading } = useAuth()
  const { ventes, addVente, updateVente, deleteVente } = useData()

  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedVente, setSelectedVente] = useState<Vente | null>(null)
  const [venteToDelete, setVenteToDelete] = useState<Vente | null>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const filteredVentes = useMemo(() => {
    if (!searchTerm.trim()) return ventes
    const term = searchTerm.toLowerCase()
    return ventes.filter((vente) => {
      return (
        vente.vendeurNom.toLowerCase().includes(term) ||
        vente.acheteurNom.toLowerCase().includes(term) ||
        vente.numeroAppartement.toLowerCase().includes(term) ||
        vente.blocNom.toLowerCase().includes(term) ||
        vente.immeubleNom.toLowerCase().includes(term)
      )
    })
  }, [ventes, searchTerm])

  const totalVentesAvecQuitus = filteredVentes.filter((vente) => !!vente.dateQuitus).length

  const handleFormSubmit = async (payload: Omit<Vente, "id" | "dateCreation">) => {
    if (selectedVente) {
      updateVente(selectedVente.id, payload)
    } else {
      addVente(payload)
    }
    setIsFormOpen(false)
    setSelectedVente(null)
  }

  const handleDelete = () => {
    if (venteToDelete) {
      deleteVente(venteToDelete.id)
      setVenteToDelete(null)
    }
  }

  return (
    <ModernLayout title="Gestion des ventes">
      <div className="p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-purple-500/10 to-amber-500/10 rounded-xl">
                <Store className="h-6 w-6 text-purple-600 dark:text-amber-400" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-800 to-amber-900 dark:from-white dark:via-purple-300 dark:to-amber-300 bg-clip-text text-transparent">
                Historique des ventes
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Suivez les transferts de propriété, les vendeurs, acheteurs et dates de quitus.
            </p>
          </div>
          <Dialog
            open={isFormOpen}
            onOpenChange={(open) => {
              setIsFormOpen(open)
              if (!open) setSelectedVente(null)
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="default"
                className="gap-2"
                onClick={() => {
                  setSelectedVente(null)
                  setIsFormOpen(true)
                }}
              >
                <Plus className="h-5 w-5" />
                Nouvelle vente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {selectedVente ? "Modifier la vente" : "Enregistrer une vente"}
                </DialogTitle>
                <DialogDescription>
                  Renseignez les informations de vente, lot, acheteur et date de quitus.
                </DialogDescription>
              </DialogHeader>
              <VenteForm
                vente={selectedVente}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">Ventes enregistrées</p>
            <p className="text-3xl font-semibold text-slate-800 dark:text-white">{ventes.length}</p>
          </div>
          <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-900/20 border border-purple-200/50 dark:border-purple-900/40 shadow-sm">
            <p className="text-sm text-purple-700 dark:text-purple-300">Quitus disponibles</p>
            <p className="text-3xl font-semibold text-purple-900 dark:text-purple-200">{totalVentesAvecQuitus}</p>
          </div>
          <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-900/40 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700 dark:text-amber-300">Ventes en attente</p>
              <p className="text-3xl font-semibold text-amber-900 dark:text-amber-200">
                {ventes.length - totalVentesAvecQuitus}
              </p>
            </div>
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200" variant="secondary">
              Quitus à valider
            </Badge>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher par vendeur, acheteur, bloc ou appartement..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>
          <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200" variant="secondary">
            {filteredVentes.length} vente{filteredVentes.length > 1 ? "s" : ""}
          </Badge>
        </div>

        <VentesTable
          ventes={filteredVentes}
          onEdit={(vente) => {
            setSelectedVente(vente)
            setIsFormOpen(true)
          }}
          onDelete={(vente) => setVenteToDelete(vente)}
        />
      </div>

      <AlertDialog open={!!venteToDelete} onOpenChange={(open) => !open && setVenteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette vente ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement les informations de vente et le quitus associé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ModernLayout>
  )
}

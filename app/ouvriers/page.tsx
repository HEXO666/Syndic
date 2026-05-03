"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button-enhanced"
import { Input } from "@/components/ui/input"
import { ModernLayout } from "@/components/modern-layout"
import { useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"
import { OuvrierForm } from "@/components/ouvrier-form"
import { OuvriersTable } from "@/components/ouvriers-table"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Users } from "lucide-react"
import { useData } from "@/lib/data-context"
import type { Ouvrier } from "@/lib/data-context"

export default function OuvriersPage() {
  const { user, isLoading } = useAuth()
  const { ouvriers, addOuvrier, updateOuvrier, deleteOuvrier, toggleOuvrierStatut } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOuvrier, setSelectedOuvrier] = useState<Ouvrier | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

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

  const filteredOuvriers = useMemo(
    () =>
      ouvriers.filter((o) => {
        const needle = searchTerm.toLowerCase().trim()
        if (!needle) return true
        return (
          o.nom.toLowerCase().includes(needle) ||
          o.prenom.toLowerCase().includes(needle) ||
          o.metier.toLowerCase().includes(needle)
        )
      }),
    [ouvriers, searchTerm],
  )

  const handleDelete = (id: string) => {
    deleteOuvrier(id)
  }

  const handleEdit = (ouvrier: Ouvrier) => {
    setSelectedOuvrier(ouvrier)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setSelectedOuvrier(null)
    setIsFormOpen(true)
  }

  return (
    <ModernLayout title="Gestion des Ouvriers">
      <div className="p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-orange-500/10 to-amber-600/10 rounded-xl">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-orange-800 to-amber-900 dark:from-white dark:via-orange-300 dark:to-amber-300 bg-clip-text text-transparent">
                Gestion des Ouvriers
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Gérez les ouvriers et leurs assignations
            </p>
          </div>
          <Dialog
            open={isFormOpen}
            onOpenChange={(open) => {
              setIsFormOpen(open)
              if (!open) {
                setSelectedOuvrier(null)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button 
                onClick={handleAdd}
                variant="default"
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                Nouvel ouvrier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {selectedOuvrier ? "Modifier l'ouvrier" : "Nouvel ouvrier"}
                </DialogTitle>
                <DialogDescription>
                  {selectedOuvrier 
                    ? "Modifiez les informations de l'ouvrier." 
                    : "Ajoutez un nouvel ouvrier à la liste."
                  }
                </DialogDescription>
              </DialogHeader>
              <OuvrierForm 
                ouvrier={selectedOuvrier}
                onSuccess={() => setIsFormOpen(false)}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Rechercher un ouvrier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {filteredOuvriers.length} ouvrier{filteredOuvriers.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Table Section */}
        <div>
          <OuvriersTable
            ouvriers={filteredOuvriers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={(ouvrierId) => toggleOuvrierStatut(ouvrierId)}
          />
        </div>

        {/* Empty State */}
        {filteredOuvriers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
              <Users className="h-12 w-12 text-slate-400 dark:text-slate-600" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {searchTerm ? "Aucun ouvrier trouvé" : "Aucun ouvrier configuré"}
            </p>
          </div>
        )}
      </div>
    </ModernLayout>
  )
}

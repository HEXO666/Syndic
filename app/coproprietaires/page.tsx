"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button-enhanced"
import { Input } from "@/components/ui/input"
import { ModernLayout } from "@/components/modern-layout"
import { useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"
import { CoproprietaireForm } from "@/components/coproprietaire-form"
import { CoproprietairesTable } from "@/components/coproprietaires-table"
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
import { Plus, Trash2, Users, Shield } from "lucide-react"

export default function CoproprietairesPage() {
  const { user, isLoading } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCoproprietaire, setSelectedCoproprietaire] = useState<any>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  // Mock data for demonstration
  const [coproprietaires, setCoproprietaires] = useState([
    {
      id: "1",
      nom: "Dupont",
      prenom: "Jean",
      adresse: "123 Rue de la Paix, Casablanca",
      telephoneMaroc: "+212 6 12 34 56 78",
      numeroTitreFoncier: "12345/A/2024",
      habiteLEtranger: false,
    },
    {
      id: "2",
      nom: "Martin",
      prenom: "Marie",
      adresse: "45 Boulevard Hassan II, Rabat",
      telephoneMaroc: "+212 7 23 45 67 89",
      numeroTitreFoncier: "67890/B/2024",
      habiteLEtranger: true,
      adresseEtranger: "Paris, France",
    },
  ])

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

  const filteredCoproprietaires = coproprietaires.filter((c) =>
    c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.adresse.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = (id: string) => {
    setCoproprietaires(coproprietaires.filter((c) => c.id !== id))
  }

  const handleEdit = (copro: any) => {
    setSelectedCoproprietaire(copro)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setSelectedCoproprietaire(null)
    setIsFormOpen(true)
  }

  return (
    <ModernLayout title="Gestion des Copropriétaires">
      <div className="p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-green-600/10 rounded-xl">
                <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-800 to-green-900 dark:from-white dark:via-emerald-300 dark:to-green-300 bg-clip-text text-transparent">
                Gestion des Copropriétaires
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Gérez les propriétaires et leurs informations personnelles
            </p>
          </div>
          <Dialog
            open={isFormOpen}
            onOpenChange={(open) => {
              setIsFormOpen(open)
              if (!open) {
                setSelectedCoproprietaire(null)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button 
                onClick={handleAdd}
                variant="premium"
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                Nouveau copropriétaire
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {selectedCoproprietaire ? "Modifier le copropriétaire" : "Nouveau copropriétaire"}
                </DialogTitle>
                <DialogDescription>
                  {selectedCoproprietaire 
                    ? "Modifiez les informations du copropriétaire." 
                    : "Ajoutez un nouveau copropriétaire à la liste."
                  }
                </DialogDescription>
              </DialogHeader>
              <CoproprietaireForm 
                coproprietaire={selectedCoproprietaire}
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
              placeholder="Rechercher un copropriétaire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {filteredCoproprietaires.length} copropriétaire{filteredCoproprietaires.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Table Section */}
        <div>
          <CoproprietairesTable
            coproprietaires={filteredCoproprietaires}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Empty State */}
        {filteredCoproprietaires.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
              <Users className="h-12 w-12 text-slate-400 dark:text-slate-600" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {searchTerm ? "Aucun copropriétaire trouvé" : "Aucun copropriétaire configuré"}
            </p>
          </div>
        )}
      </div>
    </ModernLayout>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { LoginForm } from "@/components/login-form"
import { OuvrierForm } from "@/components/ouvrier-form"
import { Plus, Search, Edit, Trash2, Wrench } from "lucide-react"
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

export default function OuvriersPage() {
  const { user, isLoading } = useAuth()
  const { ouvriers, deleteOuvrier } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOuvrier, setSelectedOuvrier] = useState<any>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const filteredOuvriers = ouvriers.filter(
    (ouvrier) =>
      ouvrier.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ouvrier.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ouvrier.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ouvrier.cin.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (ouvrier: any) => {
    setSelectedOuvrier(ouvrier)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setSelectedOuvrier(null)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteOuvrier(id)
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestion des Ouvriers</h1>
                <p className="text-muted-foreground">Gérez le personnel de maintenance et de service</p>
              </div>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un ouvrier
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{selectedOuvrier ? "Modifier l'ouvrier" : "Ajouter un ouvrier"}</DialogTitle>
                    <DialogDescription>
                      {selectedOuvrier
                        ? "Modifiez les informations de l'ouvrier"
                        : "Ajoutez un nouveau membre du personnel"}
                    </DialogDescription>
                  </DialogHeader>
                  <OuvrierForm
                    ouvrier={selectedOuvrier}
                    onSuccess={() => {
                      setIsFormOpen(false)
                      setSelectedOuvrier(null)
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Stats */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un ouvrier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="secondary" className="text-sm">
                {filteredOuvriers.length} ouvrier{filteredOuvriers.length > 1 ? "s" : ""}
              </Badge>
            </div>

            {/* Ouvriers Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOuvriers.map((ouvrier) => (
                <Card key={ouvrier.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Wrench className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {ouvrier.prenom} {ouvrier.nom}
                          </CardTitle>
                          <CardDescription>{ouvrier.profession}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(ouvrier)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer {ouvrier.prenom} {ouvrier.nom} ? Cette action est
                                irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(ouvrier.id)}>Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">CIN:</span> {ouvrier.cin}
                      </div>
                      <div>
                        <span className="font-medium">Adresse:</span> {ouvrier.adresse}
                      </div>
                      <div>
                        <span className="font-medium">Ajouté le:</span>{" "}
                        {new Date(ouvrier.dateAjout).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredOuvriers.length === 0 && (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun ouvrier trouvé</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "Aucun ouvrier ne correspond à votre recherche."
                    : "Commencez par ajouter votre premier ouvrier."}
                </p>
                {!searchTerm && (
                  <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un ouvrier
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

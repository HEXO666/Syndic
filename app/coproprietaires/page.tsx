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
import { CoproprietaireForm } from "@/components/coproprietaire-form"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CoproprietairesPage() {
  const { user, isLoading } = useAuth()
  const { coproprietaires, deleteCoproprietaire } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCoproprietaire, setSelectedCoproprietaire] = useState<any>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [filterImmeuble, setFilterImmeuble] = useState("all")

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

  // Get unique immeubles for filter
  const immeubles = Array.from(new Set(coproprietaires.map((c) => c.immeuble))).sort()

  const filteredCoproprietaires = coproprietaires.filter((coproprietaire) => {
    const matchesSearch =
      coproprietaire.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coproprietaire.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coproprietaire.bloque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coproprietaire.immeuble.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coproprietaire.numeroAppartement.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesImmeuble = filterImmeuble === "all" || coproprietaire.immeuble === filterImmeuble

    return matchesSearch && matchesImmeuble
  })

  const handleEdit = (coproprietaire: any) => {
    setSelectedCoproprietaire(coproprietaire)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setSelectedCoproprietaire(null)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteCoproprietaire(id)
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestion des Copropriétaires</h1>
                <p className="text-muted-foreground">Gérez les résidents de la copropriété</p>
              </div>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleAdd}>
                    <span className="mr-2">+</span>
                    Ajouter un copropriétaire
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedCoproprietaire ? "Modifier le copropriétaire" : "Ajouter un copropriétaire"}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedCoproprietaire
                        ? "Modifiez les informations du copropriétaire"
                        : "Ajoutez un nouveau résident à la copropriété"}
                    </DialogDescription>
                  </DialogHeader>
                  <CoproprietaireForm
                    coproprietaire={selectedCoproprietaire}
                    onSuccess={() => {
                      setIsFormOpen(false)
                      setSelectedCoproprietaire(null)
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <span className="absolute left-3 top-3 text-muted-foreground">🔍</span>
                <Input
                  placeholder="Rechercher un copropriétaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterImmeuble} onValueChange={setFilterImmeuble}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par immeuble" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les immeubles</SelectItem>
                  {immeubles.map((immeuble) => (
                    <SelectItem key={immeuble} value={immeuble}>
                      Immeuble {immeuble}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="text-sm">
                {filteredCoproprietaires.length} copropriétaire{filteredCoproprietaires.length > 1 ? "s" : ""}
              </Badge>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Copropriétaires</CardTitle>
                  <span className="text-muted-foreground">👥</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{coproprietaires.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Immeubles</CardTitle>
                  <span className="text-muted-foreground">🏢</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{immeubles.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Appartements</CardTitle>
                  <span className="text-muted-foreground">🏠</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Set(coproprietaires.map((c) => `${c.immeuble}-${c.numeroAppartement}`)).size}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Copropriétaires Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCoproprietaires.map((coproprietaire) => (
                <Card key={coproprietaire.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <span className="text-primary">👤</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {coproprietaire.prenom} {coproprietaire.nom}
                          </CardTitle>
                          <CardDescription>
                            Bloc {coproprietaire.bloque} - Imm. {coproprietaire.immeuble}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(coproprietaire)}>
                          <span>✏️</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <span className="text-destructive">🗑️</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer {coproprietaire.prenom} {coproprietaire.nom} ? Cette
                                action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(coproprietaire.id)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">🏠</span>
                        <span>Appartement {coproprietaire.numeroAppartement}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">🏢</span>
                        <span>Bloc {coproprietaire.bloque}</span>
                      </div>
                      <div>
                        <span className="font-medium">Adresse:</span> {coproprietaire.adresse}
                      </div>
                      <div>
                        <span className="font-medium">Ajouté le:</span>{" "}
                        {new Date(coproprietaire.dateAjout).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCoproprietaires.length === 0 && (
              <div className="text-center py-12">
                <span className="text-6xl text-muted-foreground mb-4 block">👥</span>
                <h3 className="text-lg font-medium mb-2">Aucun copropriétaire trouvé</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterImmeuble !== "all"
                    ? "Aucun copropriétaire ne correspond à vos critères de recherche."
                    : "Commencez par ajouter votre premier copropriétaire."}
                </p>
                {!searchTerm && filterImmeuble === "all" && (
                  <Button onClick={handleAdd}>
                    <span className="mr-2">+</span>
                    Ajouter un copropriétaire
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

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { LoginForm } from "@/components/login-form"
import { PaiementForm } from "@/components/paiement-form"
import { CertificatGenerator } from "@/components/certificat-generator"
import { Plus, Search, Edit, Trash2, CreditCard, AlertTriangle, TrendingUp, Euro, Calendar } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PaiementsPage() {
  const { user, isLoading } = useAuth()
  const { paiements, deletePaiement, getArrieres } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPaiement, setSelectedPaiement] = useState<any>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isCertificatOpen, setIsCertificatOpen] = useState(false)
  const [filterStatut, setFilterStatut] = useState("all")

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

  const arrieres = getArrieres()
  const totalPaiements = paiements.reduce((sum, p) => sum + (p.statut === "paye" ? p.montant : 0), 0)
  const totalArrieres = arrieres.reduce((sum, p) => sum + p.montant, 0)

  const filteredPaiements = paiements.filter((paiement) => {
    const matchesSearch =
      paiement.coproprietaireNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paiement.typePaiement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paiement.moisConcerne.includes(searchTerm)

    const matchesStatut = filterStatut === "all" || paiement.statut === filterStatut

    return matchesSearch && matchesStatut
  })

  const handleEdit = (paiement: any) => {
    setSelectedPaiement(paiement)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setSelectedPaiement(null)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    deletePaiement(id)
  }

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "paye":
        return <Badge className="bg-green-100 text-green-800">Payé</Badge>
      case "en_retard":
        return <Badge variant="destructive">En retard</Badge>
      case "en_attente":
        return <Badge variant="secondary">En attente</Badge>
      default:
        return <Badge variant="outline">{statut}</Badge>
    }
  }

  const getTypePaiementLabel = (type: string) => {
    switch (type) {
      case "charges_mensuelles":
        return "Charges mensuelles"
      case "travaux":
        return "Travaux"
      case "reparations":
        return "Réparations"
      case "autres":
        return "Autres"
      default:
        return type
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestion des Paiements</h1>
                <p className="text-muted-foreground">Suivi des paiements et génération de certificats</p>
              </div>
              <div className="flex gap-2">
                <Dialog open={isCertificatOpen} onOpenChange={setIsCertificatOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Générer certificat
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Générer un certificat de paiement</DialogTitle>
                      <DialogDescription>
                        Sélectionnez un copropriétaire et une période pour générer un certificat
                      </DialogDescription>
                    </DialogHeader>
                    <CertificatGenerator onSuccess={() => setIsCertificatOpen(false)} />
                  </DialogContent>
                </Dialog>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAdd}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau paiement
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{selectedPaiement ? "Modifier le paiement" : "Nouveau paiement"}</DialogTitle>
                      <DialogDescription>
                        {selectedPaiement ? "Modifiez les informations du paiement" : "Enregistrez un nouveau paiement"}
                      </DialogDescription>
                    </DialogHeader>
                    <PaiementForm
                      paiement={selectedPaiement}
                      onSuccess={() => {
                        setIsFormOpen(false)
                        setSelectedPaiement(null)
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Encaissé</CardTitle>
                  <Euro className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalPaiements.toLocaleString()}€</div>
                  <p className="text-xs text-muted-foreground">Ce mois</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Arriérés</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{totalArrieres.toLocaleString()}€</div>
                  <p className="text-xs text-muted-foreground">{arrieres.length} paiement(s)</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taux de Recouvrement</CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalPaiements + totalArrieres > 0
                      ? Math.round((totalPaiements / (totalPaiements + totalArrieres)) * 100)
                      : 0}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">Objectif: 95%</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Paiements ce mois</CardTitle>
                  <CreditCard className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{paiements.length}</div>
                  <p className="text-xs text-muted-foreground">Total enregistrés</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="paiements" className="space-y-4">
              <TabsList>
                <TabsTrigger value="paiements">Tous les paiements</TabsTrigger>
                <TabsTrigger value="arrieres">Arriérés ({arrieres.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="paiements" className="space-y-4">
                {/* Search and Filters */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un paiement..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatut} onValueChange={setFilterStatut}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="paye">Payé</SelectItem>
                      <SelectItem value="en_attente">En attente</SelectItem>
                      <SelectItem value="en_retard">En retard</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="secondary" className="text-sm">
                    {filteredPaiements.length} paiement{filteredPaiements.length > 1 ? "s" : ""}
                  </Badge>
                </div>

                {/* Paiements List */}
                <div className="space-y-4">
                  {filteredPaiements.map((paiement) => (
                    <Card key={paiement.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-full">
                              <CreditCard className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">{paiement.coproprietaireNom}</h3>
                              <p className="text-sm text-muted-foreground">
                                {getTypePaiementLabel(paiement.typePaiement)} - {paiement.moisConcerne}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold text-lg">{paiement.montant}€</p>
                              <p className="text-sm text-muted-foreground">
                                Échéance: {new Date(paiement.dateEcheance).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                            {getStatutBadge(paiement.statut)}
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(paiement)}>
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
                                      Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action est irréversible.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(paiement.id)}>
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="arrieres" className="space-y-4">
                <div className="space-y-4">
                  {arrieres.map((paiement) => (
                    <Card key={paiement.id} className="border-red-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-red-100 rounded-full">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">{paiement.coproprietaireNom}</h3>
                              <p className="text-sm text-muted-foreground">
                                {getTypePaiementLabel(paiement.typePaiement)} - {paiement.moisConcerne}
                              </p>
                              <p className="text-sm text-red-600">
                                En retard depuis le {new Date(paiement.dateEcheance).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold text-lg text-red-600">{paiement.montant}€</p>
                              <p className="text-sm text-muted-foreground">
                                {Math.ceil(
                                  (new Date().getTime() - new Date(paiement.dateEcheance).getTime()) /
                                    (1000 * 60 * 60 * 24),
                                )}{" "}
                                jour(s) de retard
                              </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(paiement)}>
                              Marquer comme payé
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {arrieres.length === 0 && (
                    <div className="text-center py-12">
                      <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Aucun arriéré</h3>
                      <p className="text-muted-foreground">Tous les paiements sont à jour !</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {filteredPaiements.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun paiement trouvé</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterStatut !== "all"
                    ? "Aucun paiement ne correspond à vos critères de recherche."
                    : "Commencez par enregistrer votre premier paiement."}
                </p>
                {!searchTerm && filterStatut === "all" && (
                  <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau paiement
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

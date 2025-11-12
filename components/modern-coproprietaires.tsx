"use client"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card-enhanced"
import { Button } from "@/components/ui/button-enhanced"
import { Input } from "@/components/ui/input-enhanced"
import { Badge } from "@/components/ui/badge"
import { ModernCoproprietaireForm } from "@/components/modern-coproprietaire-form"
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  MapPin, 
  Building, 
  Euro,
  AlertTriangle,
  CheckCircle,
  Filter,
  Download,
  Eye
} from "lucide-react"
import type { Coproprietaire } from "@/lib/data-context"

export default function ModernCoproprietaires() {
  const { coproprietaires, deleteCoproprietaire } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCoproprietaire, setSelectedCoproprietaire] = useState<Coproprietaire | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filterStatus, setFilterStatus] = useState<"all" | "debtors" | "current">("all")

  const filteredCoproprietaires = coproprietaires.filter((coprop) => {
    const matchesSearch = 
      coprop.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coprop.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coprop.bloque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coprop.immeuble.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coprop.numeroAppartement.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = 
      filterStatus === "all" || 
      (filterStatus === "debtors" && coprop.totalDettes > 0) ||
      (filterStatus === "current" && coprop.totalDettes === 0)

    return matchesSearch && matchesFilter
  })

  const handleEdit = (coprop: Coproprietaire) => {
    setSelectedCoproprietaire(coprop)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce copropriétaire ?")) {
      deleteCoproprietaire(id)
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setSelectedCoproprietaire(null)
  }

  const getStatusBadge = (coprop: Coproprietaire) => {
    if (coprop.totalDettes === 0) {
      return (
        <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          À jour
        </Badge>
      )
    }
    return (
      <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
        <AlertTriangle className="h-3 w-3 mr-1" />
        {coprop.totalDettes} DH de dette
      </Badge>
    )
  }

  const CoproprietaireCard = ({ coprop }: { coprop: Coproprietaire }) => (
    <Card variant="interactive" className="hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-md">
              {coprop.prenom.charAt(0)}{coprop.nom.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-lg">{coprop.prenom} {coprop.nom}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {coprop.bloque} - {coprop.immeuble} - Apt {coprop.numeroAppartement}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge(coprop)}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Phone className="h-4 w-4" />
            <span>{coprop.telephone}</span>
            {coprop.telephoneEtranger && (
              <>
                <span>•</span>
                <span>{coprop.telephoneEtranger}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Building className="h-4 w-4" />
            <span>Titre foncier: {coprop.titreFoncier}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Euro className="h-4 w-4" />
            <span>Cotisation: {coprop.montantAnnuel} DH/an</span>
          </div>

          <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(coprop)}
              leftIcon={<Edit className="h-3 w-3" />}
            >
              Modifier
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Eye className="h-3 w-3" />}
            >
              Détails
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(coprop.id)}
              leftIcon={<Trash2 className="h-3 w-3" />}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Supprimer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const CoproprietaireListItem = ({ coprop }: { coprop: Coproprietaire }) => (
    <Card variant="glass" className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold">
              {coprop.prenom.charAt(0)}{coprop.nom.charAt(0)}
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {coprop.prenom} {coprop.nom}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  CIN: {coprop.cin}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {coprop.bloque} - {coprop.immeuble}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Apt {coprop.numeroAppartement}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {coprop.telephone}
                </p>
                {coprop.telephoneEtranger && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {coprop.telephoneEtranger}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusBadge(coprop)}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(coprop)}
              leftIcon={<Edit className="h-3 w-3" />}
            >
              Modifier
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(coprop.id)}
              leftIcon={<Trash2 className="h-3 w-3" />}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Supprimer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (showForm) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/20 min-h-screen">
        <ModernCoproprietaireForm
          coproprietaire={selectedCoproprietaire}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false)
            setSelectedCoproprietaire(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/20 min-h-screen">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-800 dark:from-white dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
            Copropriétaires
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gestion des propriétaires et de leurs informations
          </p>
        </div>
        <Button
          variant="default"
          onClick={() => setShowForm(true)}
          leftIcon={<Plus className="h-4 w-4" />}
          className="shadow-lg"
        >
          Nouveau copropriétaire
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {coproprietaires.length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {coproprietaires.filter(c => c.totalDettes === 0).length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">À jour</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {coproprietaires.filter(c => c.totalDettes > 0).length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Débiteurs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center">
                <Euro className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {coproprietaires.reduce((sum, c) => sum + c.totalDettes, 0).toLocaleString()}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">DH de dettes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1 max-w-md">
                <Input
                  variant="modern"
                  leftIcon={<Search className="h-4 w-4" />}
                  placeholder="Rechercher par nom, bloc, immeuble..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                >
                  Tous
                </Button>
                <Button
                  variant={filterStatus === "current" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("current")}
                >
                  À jour
                </Button>
                <Button
                  variant={filterStatus === "debtors" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("debtors")}
                >
                  Débiteurs
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Filter className="h-4 w-4" />}
              >
                Filtres
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
              >
                Exporter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des copropriétaires */}
      <div className="space-y-4">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCoproprietaires.map((coprop) => (
              <CoproprietaireCard key={coprop.id} coprop={coprop} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCoproprietaires.map((coprop) => (
              <CoproprietaireListItem key={coprop.id} coprop={coprop} />
            ))}
          </div>
        )}
        
        {filteredCoproprietaires.length === 0 && (
          <Card variant="glass">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Aucun copropriétaire trouvé
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {searchTerm ? "Aucun résultat pour votre recherche" : "Commencez par ajouter des copropriétaires"}
              </p>
              {!searchTerm && (
                <Button
                  variant="default"
                  onClick={() => setShowForm(true)}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Ajouter le premier copropriétaire
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
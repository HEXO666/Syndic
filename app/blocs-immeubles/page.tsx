"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { LoginForm } from "@/components/login-form"
import { ModernLayout } from "@/components/modern-layout"
import { BlocForm } from "@/components/bloc-form"
import { ImmeubleForm } from "@/components/immeuble-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Home, Edit, Trash2 } from "lucide-react"
import type { Bloque, Immeuble } from "@/lib/data-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function BlocsImmeubles() {
  const { user, isLoading } = useAuth()
  const { blocs, immeubles, getImmeublesByBloc, deleteBloc, deleteImmeuble, clearBlocNotifications } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [isBlocDialogOpen, setIsBlocDialogOpen] = useState(false)
  const [isImmeubleDialogOpen, setIsImmeubleDialogOpen] = useState(false)
  const [selectedBloc, setSelectedBloc] = useState<Bloque | null>(null)
  const [selectedImmeuble, setSelectedImmeuble] = useState<Immeuble | null>(null)
  const [selectedBlocForImmeuble, setSelectedBlocForImmeuble] = useState<string>("")

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  useEffect(() => {
    clearBlocNotifications()
  }, [clearBlocNotifications])

  const filteredBlocs = blocs.filter(bloc =>
    bloc.nom.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredImmeubles = immeubles.filter(immeuble =>
    immeuble.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    immeuble.bloqueName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditBloc = (bloc: Bloque) => {
    setSelectedBloc(bloc)
    setIsBlocDialogOpen(true)
  }

  const handleEditImmeuble = (immeuble: Immeuble) => {
    setSelectedImmeuble(immeuble)
    setSelectedBlocForImmeuble(immeuble.bloqueId)
    setIsImmeubleDialogOpen(true)
  }

  const handleDeleteBloc = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce bloc ?")) {
      deleteBloc(id)
    }
  }

  const handleDeleteImmeuble = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet immeuble ?")) {
      deleteImmeuble(id)
    }
  }

  return (
    <ModernLayout title="Blocs et Immeubles">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Blocs et Immeubles</h1>
          <div className="flex gap-2">
            <Dialog
              open={isBlocDialogOpen}
              onOpenChange={(open) => {
                setIsBlocDialogOpen(open)
                if (!open) {
                  setSelectedBloc(null)
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setSelectedBloc(null)
                    setIsBlocDialogOpen(true)
                  }}
                  className="flex items-center gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  Nouveau bloc
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{selectedBloc ? "Modifier le bloc" : "Nouveau bloc"}</DialogTitle>
                  <DialogDescription>
                    {selectedBloc
                      ? "Modifiez les informations de ce bloc."
                      : "Ajoutez un bloc pour structurer vos immeubles."}
                  </DialogDescription>
                </DialogHeader>
                <BlocForm
                  bloc={selectedBloc}
                  onSuccess={() => {
                    setIsBlocDialogOpen(false)
                    setSelectedBloc(null)
                  }}
                  onCancel={() => {
                    setIsBlocDialogOpen(false)
                    setSelectedBloc(null)
                  }}
                />
              </DialogContent>
            </Dialog>
            <Dialog
              open={isImmeubleDialogOpen}
              onOpenChange={(open) => {
                setIsImmeubleDialogOpen(open)
                if (!open) {
                  setSelectedImmeuble(null)
                  setSelectedBlocForImmeuble("")
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    if (blocs.length === 0) {
                      alert("Veuillez d'abord créer un bloc")
                      return
                    }
                    setSelectedImmeuble(null)
                    setSelectedBlocForImmeuble(blocs[0].id)
                    setIsImmeubleDialogOpen(true)
                  }}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Nouvel immeuble
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{selectedImmeuble ? "Modifier l'immeuble" : "Nouvel immeuble"}</DialogTitle>
                  <DialogDescription>
                    {selectedImmeuble
                      ? "Actualisez les informations de cet immeuble."
                      : "Associez un nouvel immeuble à l'un de vos blocs."}
                  </DialogDescription>
                </DialogHeader>
                <ImmeubleForm
                  immeuble={selectedImmeuble}
                  selectedBlocId={selectedBlocForImmeuble}
                  onSuccess={() => {
                    setIsImmeubleDialogOpen(false)
                    setSelectedImmeuble(null)
                    setSelectedBlocForImmeuble("")
                  }}
                  onCancel={() => {
                    setIsImmeubleDialogOpen(false)
                    setSelectedImmeuble(null)
                    setSelectedBlocForImmeuble("")
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        <Tabs defaultValue="blocs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="blocs">Blocs ({blocs.length})</TabsTrigger>
            <TabsTrigger value="immeubles">Immeubles ({immeubles.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="blocs" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBlocs.map((bloc) => (
                <Card key={bloc.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {bloc.nom}
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditBloc(bloc)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteBloc(bloc.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {bloc.description && (
                      <p className="text-sm text-gray-600">{bloc.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {getImmeublesByBloc(bloc.id).length} immeuble(s)
                    </p>
                    <p className="text-xs text-gray-400">
                      Ajouté le {new Date(bloc.dateAjout).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredBlocs.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>
                  {searchTerm ? "Aucun bloc trouvé" : "Aucun bloc créé"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="immeubles" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredImmeubles.map((immeuble) => (
                <Card key={immeuble.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        {immeuble.nom}
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditImmeuble(immeuble)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteImmeuble(immeuble.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">
                      Bloc: {immeuble.bloqueName}
                    </p>
                    {immeuble.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {immeuble.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Ajouté le {new Date(immeuble.dateAjout).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredImmeubles.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Home className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>
                  {searchTerm ? "Aucun immeuble trouvé" : "Aucun immeuble créé"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ModernLayout>
  )
}
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useData } from "@/lib/data-context"
import { BlocForm } from "@/components/bloc-form"
import { ImmeubleForm } from "@/components/immeuble-form"

export default function BlocsImmeubles() {
  const { blocs, immeubles, getImmeublesByBloc, deleteBloc, deleteImmeuble } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [showBlocForm, setShowBlocForm] = useState(false)
  const [showImmeubleForm, setShowImmeubleForm] = useState(false)
  const [editingBloc, setEditingBloc] = useState<any>(null)
  const [editingImmeuble, setEditingImmeuble] = useState<any>(null)
  const [selectedBlocId, setSelectedBlocId] = useState<string>("")

  const filteredBlocs = blocs.filter((bloc) => bloc.nom.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleEditBloc = (bloc: any) => {
    setEditingBloc(bloc)
    setShowBlocForm(true)
  }

  const handleEditImmeuble = (immeuble: any) => {
    setEditingImmeuble(immeuble)
    setShowImmeubleForm(true)
  }

  const handleDeleteBloc = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce bloc et tous ses immeubles ?")) {
      deleteBloc(id)
    }
  }

  const handleDeleteImmeuble = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet immeuble ?")) {
      deleteImmeuble(id)
    }
  }

  const handleAddImmeuble = (blocId: string) => {
    setSelectedBlocId(blocId)
    setShowImmeubleForm(true)
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Blocs & Immeubles</h1>
                <p className="text-muted-foreground">Gérez les blocs et leurs immeubles</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowBlocForm(true)}>+ Nouveau Bloc</Button>
                <Button variant="outline" onClick={() => setShowImmeubleForm(true)}>
                  + Nouvel Immeuble
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Input
                placeholder="Rechercher un bloc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="grid gap-6">
              {filteredBlocs.map((bloc) => {
                const immeublesDuBloc = getImmeublesByBloc(bloc.id)

                return (
                  <Card key={bloc.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white text-sm font-bold">
                            B
                          </div>
                          <div>
                            <CardTitle className="text-xl">{bloc.nom}</CardTitle>
                            <CardDescription>{bloc.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {immeublesDuBloc.length} immeuble{immeublesDuBloc.length !== 1 ? "s" : ""}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => handleAddImmeuble(bloc.id)}>
                            + Immeuble
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditBloc(bloc)}>
                            Modifier
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteBloc(bloc.id)}>
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {immeublesDuBloc.length > 0 && (
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {immeublesDuBloc.map((immeuble) => (
                            <Card key={immeuble.id} className="border-l-4 border-l-primary/20">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-muted-foreground rounded flex items-center justify-center text-white text-xs">
                                      I
                                    </div>
                                    <div>
                                      <p className="font-medium">{immeuble.nom}</p>
                                      {immeuble.description && (
                                        <p className="text-sm text-muted-foreground">{immeuble.description}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => handleEditImmeuble(immeuble)}>
                                      Modifier
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteImmeuble(immeuble.id)}>
                                      Supprimer
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>

            {filteredBlocs.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 bg-muted-foreground rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                    B
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucun bloc trouvé</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {searchTerm
                      ? "Aucun bloc ne correspond à votre recherche."
                      : "Commencez par créer votre premier bloc."}
                  </p>
                  {!searchTerm && <Button onClick={() => setShowBlocForm(true)}>+ Créer un bloc</Button>}
                </CardContent>
              </Card>
            )}

            {showBlocForm && (
              <BlocForm
                bloc={editingBloc}
                onClose={() => {
                  setShowBlocForm(false)
                  setEditingBloc(null)
                }}
              />
            )}

            {showImmeubleForm && (
              <ImmeubleForm
                immeuble={editingImmeuble}
                selectedBlocId={selectedBlocId}
                onClose={() => {
                  setShowImmeubleForm(false)
                  setEditingImmeuble(null)
                  setSelectedBlocId("")
                }}
              />
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/lib/data-context"
import { AlertTriangle, Bell, X, CheckCircle, Clock, DollarSign, Phone, Mail } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function NotificationCenter() {
  const { coproprietaires, getAllArrieres, paiements } = useData()
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([])

  const arrieres = getAllArrieres()
  const currentYear = new Date().getFullYear().toString()
  
  // Critères pour les alertes
  const alertes = [
    // Arriérés critiques (plus de 2 ans)
    ...arrieres
      .filter(arr => arr.anneesImpayees.length > 2)
      .map(arr => ({
        id: `critique-${arr.coproprietaireId}`,
        type: "critique" as const,
        title: "Arriéré Critique",
        message: `${arr.coproprietaireNom} a ${arr.anneesImpayees.length} années impayées (${(arr.montantTotal).toLocaleString()} DH)`,
        coproprietaireId: arr.coproprietaireId,
        data: arr
      })),
    
    // Arriérés récents (année en cours non payée)
    ...arrieres
      .filter(arr => arr.anneesImpayees.includes(currentYear) && arr.anneesImpayees.length <= 2)
      .map(arr => ({
        id: `recent-${arr.coproprietaireId}`,
        type: "warning" as const,
        title: "Paiement en Retard",
        message: `${arr.coproprietaireNom} n'a pas encore payé l'année ${currentYear} (${(1200).toLocaleString()} DH)`,
        coproprietaireId: arr.coproprietaireId,
        data: arr
      })),

    // Paiements partiels
    ...paiements
      .filter(p => p.statut === "partiel" && p.annee === currentYear)
      .map(p => ({
        id: `partiel-${p.id}`,
        type: "info" as const,
        title: "Paiement Partiel",
        message: `${p.coproprietaireNom} a effectué un paiement partiel de ${p.montant.toLocaleString()} DH (reste ${p.montantRestant.toLocaleString()} DH)`,
        coproprietaireId: p.coproprietaireId,
        data: p
      }))
  ].filter(alert => !dismissedNotifications.includes(alert.id))

  const dismissNotification = (id: string) => {
    setDismissedNotifications(prev => [...prev, id])
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critique": return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "warning": return <Clock className="h-5 w-5 text-orange-500" />
      case "info": return <DollarSign className="h-5 w-5 text-blue-500" />
      default: return <Bell className="h-5 w-5" />
    }
  }

  const getAlertBadge = (type: string) => {
    switch (type) {
      case "critique": return <Badge variant="destructive">Critique</Badge>
      case "warning": return <Badge className="bg-orange-100 text-orange-800">Attention</Badge>
      case "info": return <Badge variant="secondary">Information</Badge>
      default: return <Badge variant="outline">Notification</Badge>
    }
  }

  const getCoproprietaireDetails = (coproprietaireId: string) => {
    return coproprietaires.find(c => c.id === coproprietaireId)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Centre de Notifications</CardTitle>
          </div>
          {alertes.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {alertes.length}
            </Badge>
          )}
        </div>
        <CardDescription>
          Alertes et notifications importantes pour la gestion de la copropriété
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alertes.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tout est en ordre !</h3>
            <p className="text-gray-600">Aucune alerte ou notification en attente.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alertes.slice(0, 5).map((alerte) => {
              const coproprietaire = getCoproprietaireDetails(alerte.coproprietaireId)
              
              return (
                <div
                  key={alerte.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alerte.type === "critique" ? "border-red-500 bg-red-50" :
                    alerte.type === "warning" ? "border-orange-500 bg-orange-50" :
                    "border-blue-500 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getAlertIcon(alerte.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{alerte.title}</h4>
                          {getAlertBadge(alerte.type)}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{alerte.message}</p>
                        
                        {coproprietaire && (
                          <div className="text-xs text-gray-600">
                            📍 {coproprietaire.bloque} - {coproprietaire.immeuble} - Apt {coproprietaire.numeroAppartement}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {coproprietaire && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Détails
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Informations du Copropriétaire</DialogTitle>
                              <DialogDescription>
                                Détails pour contacter et gérer ce dossier
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Nom:</span><br />
                                  {coproprietaire.prenom} {coproprietaire.nom}
                                </div>
                                <div>
                                  <span className="font-medium">CIN:</span><br />
                                  {coproprietaire.cin}
                                </div>
                                <div>
                                  <span className="font-medium">Téléphone:</span><br />
                                  <a href={`tel:${coproprietaire.telephone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {coproprietaire.telephone}
                                  </a>
                                </div>
                                <div>
                                  <span className="font-medium">Propriété:</span><br />
                                  {coproprietaire.bloque} - {coproprietaire.immeuble}
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="font-medium text-sm">Situation financière:</span>
                                <div className="mt-2 text-sm">
                                  {alerte.type === "critique" && (
                                    <div className="text-red-700">
                                      ❌ {(alerte.data as any).anneesImpayees?.length} années impayées<br />
                                      💰 Total dû: {((alerte.data as any).montantTotal || 0).toLocaleString()} DH
                                    </div>
                                  )}
                                  {alerte.type === "warning" && (
                                    <div className="text-orange-700">
                                      ⏰ Année {currentYear} non payée<br />
                                      💰 Montant dû: 1,200 DH
                                    </div>
                                  )}
                                  {alerte.type === "info" && (
                                    <div className="text-blue-700">
                                      💳 Paiement partiel effectué<br />
                                      💰 Reste à payer: {((alerte.data as any).montantRestant || 0).toLocaleString()} DH
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => window.location.href = `/coproprietaires`}
                                  className="flex-1"
                                >
                                  Gérer
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.location.href = `/paiements`}
                                  className="flex-1"
                                >
                                  Paiements
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissNotification(alerte.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {alertes.length > 5 && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  +{alertes.length - 5} autre(s) notification(s)
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Voir toutes les notifications
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
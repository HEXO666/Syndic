"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { NotificationCenter } from "@/components/notification-center"
import { CertificatPDFGenerator } from "@/components/certificat-pdf-generator"
import { AppFooter } from "@/components/app-footer"
import { Users, Wrench, CreditCard, TrendingUp, AlertTriangle, Activity, FileText, Download } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function Dashboard() {
  const { user } = useAuth()
  const { ouvriers, coproprietaires, history, paiements, getArrieres, getAllArrieres } = useData()
  const [isPDFGeneratorOpen, setIsPDFGeneratorOpen] = useState(false)

  const arrieres = getArrieres()
  const allArrieres = getAllArrieres()
  const totalPaiements = paiements.reduce((sum, p) => sum + (p.statut === "paye" ? p.montant : 0), 0)
  const totalDettes = allArrieres.reduce((sum, arr) => sum + arr.montantTotal, 0)

  const stats = [
    {
      title: "Copropriétaires",
      value: coproprietaires.length.toString(),
      description: "Total des résidents",
      icon: Users,
      color: "text-blue-600",
      href: "/coproprietaires",
    },
    {
      title: "Ouvriers Actifs",
      value: ouvriers.filter(o => o.statut === "actif").length.toString(),
      description: `${ouvriers.filter(o => o.statut === "inactif").length} inactifs`,
      icon: Wrench,
      color: "text-green-600",
      href: "/ouvriers",
    },
    {
      title: "Paiements Reçus",
      value: `${totalPaiements.toLocaleString()} DH`,
      description: `${paiements.filter((p) => p.statut === "paye").length} paiements`,
      icon: CreditCard,
      color: "text-primary",
      href: "/paiements",
    },
    {
      title: "Dettes Totales",
      value: `${totalDettes.toLocaleString()} DH`,
      description: `${allArrieres.length} copropriétaires concernés`,
      icon: TrendingUp,
      color: totalDettes > 0 ? "text-red-600" : "text-green-600",
      href: "/paiements",
    },
  ]

  const recentActivities = history.slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenue, {user?.name} ({user?.role === "admin" ? "Administrateur" : "Utilisateur"})
          </p>
        </div>
        <Badge variant={user?.role === "admin" ? "default" : "secondary"} className="text-sm">
          {user?.role === "admin" ? "Admin" : "Utilisateur"}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Activités Récentes</CardTitle>
                <CardDescription>Dernières actions dans l'application</CardDescription>
              </div>
              {user?.role === "admin" && (
                <Link href="/historique">
                  <Button variant="outline" size="sm">
                    <Activity className="h-4 w-4 mr-2" />
                    Voir tout
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.details}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.userName} • {new Date(activity.timestamp).toLocaleDateString("fr-FR")} à{" "}
                        {new Date(activity.timestamp).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Aucune activité récente</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
            <CardDescription>Raccourcis vers les fonctions principales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Link href="/coproprietaires">
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="h-5 w-5 text-primary mr-3" />
                  <span className="text-sm font-medium">Ajouter un copropriétaire</span>
                </Button>
              </Link>
              <Link href="/ouvriers">
                <Button variant="ghost" className="w-full justify-start">
                  <Wrench className="h-5 w-5 text-primary mr-3" />
                  <span className="text-sm font-medium">Enregistrer un ouvrier</span>
                </Button>
              </Link>
              <Link href="/paiements">
                <Button variant="ghost" className="w-full justify-start">
                  <CreditCard className="h-5 w-5 text-primary mr-3" />
                  <span className="text-sm font-medium">Nouveau paiement</span>
                </Button>
              </Link>
              <Dialog open={isPDFGeneratorOpen} onOpenChange={setIsPDFGeneratorOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    <FileText className="h-5 w-5 text-primary mr-3" />
                    <span className="text-sm font-medium">Générer un certificat</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Générateur de Certificat PDF</DialogTitle>
                    <DialogDescription>
                      Créez des certificats professionnels avec logo et signatures
                    </DialogDescription>
                  </DialogHeader>
                  <CertificatPDFGenerator onSuccess={() => setIsPDFGeneratorOpen(false)} />
                </DialogContent>
              </Dialog>
              {user?.role === "admin" && (
                <>
                  <Link href="/utilisateurs">
                    <Button variant="ghost" className="w-full justify-start">
                      <Users className="h-5 w-5 text-red-600 mr-3" />
                      <span className="text-sm font-medium">Gérer les utilisateurs</span>
                    </Button>
                  </Link>
                  <Link href="/historique">
                    <Button variant="ghost" className="w-full justify-start">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
                      <span className="text-sm font-medium">Voir l'historique</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Section */}
      <div className="mt-6">
        <NotificationCenter />
      </div>

      {/* Footer */}
      <AppFooter />
    </div>
  )
}

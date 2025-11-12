"use client"

import { useState, useEffect } from "react"
import { useData } from "@/lib/data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card-enhanced"
import { Button } from "@/components/ui/button-enhanced"
import { 
  Building2, 
  Users, 
  Wrench, 
  CreditCard, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Euro,
  FileText,
  MapPin,
  Phone
} from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  trend?: {
    value: string
    isPositive: boolean
  }
  variant?: "default" | "success" | "warning" | "danger"
}

function StatCard({ title, value, icon, description, trend, variant = "default" }: StatCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950"
      case "warning":
        return "border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950"
      case "danger":
        return "border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950"
      default:
        return "border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950"
    }
  }

  const getIconColor = () => {
    switch (variant) {
      case "success": return "text-emerald-600 dark:text-emerald-400"
      case "warning": return "text-amber-600 dark:text-amber-400"
      case "danger": return "text-red-600 dark:text-red-400"
      default: return "text-blue-600 dark:text-blue-400"
    }
  }

  return (
    <Card className={`border-2 ${getVariantStyles()} hover:shadow-lg transition-all duration-300`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {value}
            </p>
            {description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {description}
              </p>
            )}
            {trend && (
              <div className={`flex items-center mt-2 text-sm ${
                trend.isPositive ? "text-emerald-600" : "text-red-600"
              }`}>
                <span>{trend.isPositive ? "↗" : "↘"}</span>
                <span className="ml-1">{trend.value}</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconColor()}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface RecentActivityProps {
  activities: Array<{
    id: string
    action: string
    entity: string
    user: string
    time: string
    icon: React.ReactNode
    color: string
  }>
}

function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card variant="glass" className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Activité récente
        </CardTitle>
        <CardDescription>
          Dernières actions effectuées sur le système
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activity.color}`}>
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {activity.action}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {activity.entity} • par {activity.user}
                </p>
              </div>
              <span className="text-xs text-slate-400">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ModernDashboard() {
  const { coproprietaires, ouvriers, paiements, blocs, immeubles } = useData()
  const [stats, setStats] = useState({
    totalCoproprietaires: 0,
    totalOuvriers: 0,
    totalBlocs: 0,
    totalImmeubles: 0,
    paiementsEnCours: 0,
    montantTotal: 0,
    tauxPaiement: 0,
    debiteurs: 0
  })

  const [recentActivities] = useState([
    {
      id: "1",
      action: "Nouveau copropriétaire ajouté",
      entity: "Ahmed Benali - Bloc A, Apt 23",
      user: "Admin",
      time: "Il y a 2h",
      icon: <Users className="h-4 w-4" />,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
    },
    {
      id: "2",
      action: "Paiement reçu",
      entity: "1200 DH - Fatima Alami",
      user: "Admin",
      time: "Il y a 3h",
      icon: <CreditCard className="h-4 w-4" />,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400"
    },
    {
      id: "3",
      action: "Ouvrier activé",
      entity: "Mohammed Tazi - Électricien",
      user: "Admin",
      time: "Il y a 5h",
      icon: <Wrench className="h-4 w-4" />,
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400"
    },
    {
      id: "4",
      action: "Nouveau bloc créé",
      entity: "Bloc C - Résidence Al Manar",
      user: "Admin",
      time: "Hier",
      icon: <Building2 className="h-4 w-4" />,
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
    }
  ])

  useEffect(() => {
    // Calcul des statistiques
    const totalMontantPaye = paiements
      .filter(p => p.statut === "paye")
      .reduce((sum, p) => sum + p.montant, 0)

    const tauxPaiement = coproprietaires.length > 0 
      ? Math.round((paiements.filter(p => p.statut === "paye").length / coproprietaires.length) * 100)
      : 0

    const debiteurs = coproprietaires.filter(c => c.totalDettes > 0).length

    setStats({
      totalCoproprietaires: coproprietaires.length,
      totalOuvriers: ouvriers.filter(o => o.statut === "actif").length,
      totalBlocs: blocs.length,
      totalImmeubles: immeubles.length,
      paiementsEnCours: paiements.filter(p => p.statut === "partiel").length,
      montantTotal: totalMontantPaye,
      tauxPaiement,
      debiteurs
    })
  }, [coproprietaires, ouvriers, paiements, blocs, immeubles])

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/20 min-h-screen">
      {/* En-tête du dashboard */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-800 dark:from-white dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
          Tableau de bord
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Vue d'ensemble de votre copropriété - {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Copropriétaires"
          value={stats.totalCoproprietaires}
          icon={<Users className="h-6 w-6" />}
          description="Propriétaires enregistrés"
          trend={{ value: "+2 ce mois", isPositive: true }}
          variant="default"
        />
        
        <StatCard
          title="Ouvriers actifs"
          value={stats.totalOuvriers}
          icon={<Wrench className="h-6 w-6" />}
          description="Personnel disponible"
          variant="success"
        />
        
        <StatCard
          title="Immeubles"
          value={`${stats.totalImmeubles} / ${stats.totalBlocs} blocs`}
          icon={<Building2 className="h-6 w-6" />}
          description="Bâtiments gérés"
          variant="default"
        />
        
        <StatCard
          title="Taux de paiement"
          value={`${stats.tauxPaiement}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          description="Cotisations à jour"
          trend={{ value: "+5% ce mois", isPositive: true }}
          variant={stats.tauxPaiement >= 80 ? "success" : stats.tauxPaiement >= 60 ? "warning" : "danger"}
        />
      </div>

      {/* Métriques financières */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Montant total collecté"
          value={`${stats.montantTotal.toLocaleString()} DH`}
          icon={<Euro className="h-6 w-6" />}
          description="Paiements reçus cette année"
          variant="success"
        />
        
        <StatCard
          title="Paiements partiels"
          value={stats.paiementsEnCours}
          icon={<AlertTriangle className="h-6 w-6" />}
          description="En attente de complément"
          variant="warning"
        />
        
        <StatCard
          title="Débiteurs"
          value={stats.debiteurs}
          icon={<AlertTriangle className="h-6 w-6" />}
          description="Copropriétaires en retard"
          variant={stats.debiteurs === 0 ? "success" : "danger"}
        />
      </div>

      {/* Actions rapides et activité récente */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Actions rapides */}
        <Card variant="premium" className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Actions rapides
            </CardTitle>
            <CardDescription>
              Raccourcis vers les tâches fréquentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="default" className="w-full justify-start" leftIcon={<Users className="h-4 w-4" />}>
              Ajouter un copropriétaire
            </Button>
            <Button variant="outline" className="w-full justify-start" leftIcon={<CreditCard className="h-4 w-4" />}>
              Enregistrer un paiement
            </Button>
            <Button variant="outline" className="w-full justify-start" leftIcon={<Wrench className="h-4 w-4" />}>
              Gérer les ouvriers
            </Button>
            <Button variant="outline" className="w-full justify-start" leftIcon={<FileText className="h-4 w-4" />}>
              Générer un rapport
            </Button>
            <Button variant="outline" className="w-full justify-start" leftIcon={<Building2 className="h-4 w-4" />}>
              Ajouter un immeuble
            </Button>
          </CardContent>
        </Card>

        {/* Activité récente */}
        <div className="xl:col-span-2">
          <RecentActivity activities={recentActivities} />
        </div>
      </div>

      {/* Alertes importantes */}
      {stats.debiteurs > 0 && (
        <Card variant="elevated" className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Attention - Retards de paiement
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {stats.debiteurs} copropriétaire(s) ont des paiements en retard. 
                  Consultez la section paiements pour plus de détails.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Voir les détails
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
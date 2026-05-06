"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { getSupabaseClient } from "@/lib/supabase/client"
import { dashboardService, paiementsService } from "@/lib/supabase/services"
import type { DashboardStats, CollecteMensuelle, Arriere } from "@/lib/supabase/types"
import { LoginForm } from "@/components/login-form"
import { ModernLayout } from "@/components/modern-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-enhanced"
import { Badge } from "@/components/ui/badge"
import {
  FileText, TrendingUp, AlertTriangle, CheckCircle,
  Users, CreditCard, Download, Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button-enhanced"

const MOIS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"]

function StatCard({
  label, value, icon: Icon, color,
}: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function CollecteBar({
  mois, montant, max,
}: { mois: string; montant: number; max: number }) {
  const pct = max > 0 ? Math.round((montant / max) * 100) : 0
  return (
    <div className="flex items-end gap-1 flex-col w-full">
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded h-24 flex items-end overflow-hidden">
        <div
          className="bg-blue-500 rounded w-full transition-all duration-500"
          style={{ height: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-400">{mois}</span>
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
        {montant > 0 ? `${(montant / 1000).toFixed(0)}k` : "—"}
      </span>
    </div>
  )
}

export default function RapportsPage() {
  const { user, isLoading } = useAuth()
  const { paiements, coproprietaires } = useData()

  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [collecte, setCollecte] = useState<CollecteMensuelle[]>([])
  const [arrieres, setArrieres] = useState<Arriere[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const supabase = getSupabaseClient()
    setLoading(true)
    Promise.all([
      dashboardService.getStats(supabase),
      dashboardService.getCollecteMensuelle(supabase, selectedYear),
      paiementsService.getArrieres(supabase),
    ])
      .then(([s, c, a]) => {
        setStats(s)
        setCollecte(c)
        setArrieres(a)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user, selectedYear])

  // Derived stats from local paiements
  const totalCollected = paiements
    .filter((p) => p.statut === "paye" || p.statut === "partiel")
    .reduce((s, p) => s + p.montant, 0)
  const totalPending = paiements
    .filter((p) => p.statut === "impaye" || p.statut === "partiel")
    .reduce((s, p) => s + p.montantRestant, 0)

  const maxCollecte = Math.max(...collecte.map((c) => c.montant_paye + c.montant_partiel), 1)

  const years = Array.from({ length: 4 }, (_, i) => currentYear - i)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!user) return <LoginForm />

  return (
    <ModernLayout title="Rapports">
      <div className="p-6 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Rapports</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Synthèse financière et état des paiements</p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Copropriétaires"
            value={stats?.total_coproprietaires ?? coproprietaires.length}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            label="Montant collecté"
            value={`${((stats?.montant_collecte ?? totalCollected) / 1000).toFixed(0)}k MAD`}
            icon={CreditCard}
            color="bg-emerald-500"
          />
          <StatCard
            label="Débiteurs"
            value={stats?.total_debiteurs ?? arrieres.length}
            icon={AlertTriangle}
            color="bg-amber-500"
          />
          <StatCard
            label="Paiements imputés"
            value={stats?.paiements_impayes ?? paiements.filter((p) => p.statut === "impaye").length}
            icon={CheckCircle}
            color="bg-red-500"
          />
        </div>

        {/* Monthly Collecte Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Collecte mensuelle
              </CardTitle>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => setSelectedYear(y)}
                    className={`px-2 py-0.5 rounded text-sm transition-colors ${
                      y === selectedYear
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-32 flex items-center justify-center text-slate-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              </div>
            ) : (
              <div className="grid grid-cols-12 gap-2 items-end h-36">
                {MOIS.map((m, idx) => {
                  const row = collecte.find((c) => c.mois === idx + 1)
                  const montant = row ? row.montant_paye + row.montant_partiel : 0
                  return <CollecteBar key={m} mois={m} montant={montant} max={maxCollecte} />
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Arriérés Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Copropriétaires en arriéré
              <Badge variant="secondary">{arrieres.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              </div>
            ) : arrieres.length === 0 ? (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
                Aucun arriéré — tous les copropriétaires sont à jour.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                      <th className="py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Nom</th>
                      <th className="py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Appartement</th>
                      <th className="py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Dette totale</th>
                      <th className="py-2 font-medium text-slate-600 dark:text-slate-400">Dernier paiement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arrieres.map((a) => (
                      <tr
                        key={a.coproprietaire_id}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="py-2 pr-4 font-medium text-slate-900 dark:text-white">
                          {a.prenom} {a.nom}
                        </td>
                        <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">
                          {a.numero_appartement}
                        </td>
                        <td className="py-2 pr-4">
                          <Badge variant="destructive" className="font-mono">
                            {a.total_dettes.toLocaleString("fr-MA")} MAD
                          </Badge>
                        </td>
                        <td className="py-2 text-slate-500 dark:text-slate-400">
                          {a.dernier_paiement
                            ? new Date(a.dernier_paiement).toLocaleDateString("fr-MA")
                            : "Jamais"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paiements récents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-500" />
              Derniers paiements enregistrés
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paiements.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm py-4 text-center">Aucun paiement enregistré.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                      <th className="py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Date</th>
                      <th className="py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Copropriétaire</th>
                      <th className="py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Montant</th>
                      <th className="py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Année</th>
                      <th className="py-2 font-medium text-slate-600 dark:text-slate-400">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...paiements]
                      .sort((a, b) => (b.datePaiement ?? "").localeCompare(a.datePaiement ?? ""))
                      .slice(0, 20)
                      .map((p) => {
                        const copro = coproprietaires.find((c) => c.id === p.coproprietaireId)
                        return (
                          <tr
                            key={p.id}
                            className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">
                              {p.datePaiement ? new Date(p.datePaiement).toLocaleDateString("fr-MA") : "—"}
                            </td>
                            <td className="py-2 pr-4 font-medium text-slate-900 dark:text-white">
                              {copro ? `${copro.prenom} ${copro.nom}` : p.coproprietaireId.slice(0, 8)}
                            </td>
                            <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                              {p.montant.toLocaleString("fr-MA")} MAD
                            </td>
                            <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">{p.annee}</td>
                            <td className="py-2">
                              <Badge
                                variant={
                                  p.statut === "paye"
                                    ? "default"
                                    : p.statut === "partiel"
                                      ? "secondary"
                                      : "destructive"
                                }
                                className="text-xs"
                              >
                                {p.statut === "paye" ? "Payé" : p.statut === "partiel" ? "Partiel" : "Impayé"}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModernLayout>
  )
}

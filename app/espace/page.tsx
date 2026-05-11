"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"
import { ModernLayout } from "@/components/modern-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-enhanced"
import { AlertTriangle, CheckCircle, Clock, MapPin, Phone, CreditCard } from "lucide-react"

type Paiement = { id: string; annee: string; montant: number; montant_du: number; montant_restant: number; statut: string; date_paiement: string | null; methode_paiement: string }
type SituationResponse =
  | { linked: false }
  | {
      linked: true
      coproprietaire: {
        id: string; nom: string; prenom: string; cin: string | null
        numero_appartement: string; montant_annuel: number; total_dettes: number
        immeubles: { nom: string; blocs: { nom: string } | null } | null
      }
      paiements: Paiement[]
    }

const CURRENT_YEAR = new Date().getFullYear()
const START_YEAR   = 2021

const statutStyle = (s: string) => {
  if (s === "paye")    return { bg: "bg-emerald-50 dark:bg-emerald-950/20", badge: "bg-emerald-100 text-emerald-700", label: "Payé",    Icon: CheckCircle, iconColor: "text-emerald-500" }
  if (s === "partiel") return { bg: "bg-amber-50 dark:bg-amber-950/20",    badge: "bg-amber-100 text-amber-700",     label: "Partiel", Icon: Clock,        iconColor: "text-amber-500" }
  return                      { bg: "bg-red-50 dark:bg-red-950/20",        badge: "bg-red-100 text-red-700",         label: "Impayé",  Icon: AlertTriangle, iconColor: "text-red-500" }
}

export default function EspacePage() {
  const { user, isLoading } = useAuth()
  const [situation, setSituation] = useState<SituationResponse | null>(null)
  const [loadingSituation, setLoadingSituation] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoadingSituation(true)
    fetch("/api/copro/situation")
      .then((r) => r.json())
      .then((data) => setSituation(data as SituationResponse))
      .catch(() => setSituation({ linked: false }))
      .finally(() => setLoadingSituation(false))
  }, [user])

  // Build a full year-by-year list, filling in "impaye" for missing years
  const yearRows = useMemo(() => {
    if (!situation || situation.linked === false) return []
    const years: number[] = []
    for (let y = CURRENT_YEAR; y >= START_YEAR; y--) years.push(y)
    return years.map((y) => {
      const p = situation.paiements.find((x) => x.annee === String(y))
      if (p) return { annee: y, statut: p.statut, montant: p.montant, montant_du: p.montant_du, montant_restant: p.montant_restant, date: p.date_paiement, methode: p.methode_paiement }
      return { annee: y, statut: "impaye", montant: 0, montant_du: situation.coproprietaire.montant_annuel, montant_restant: situation.coproprietaire.montant_annuel, date: null, methode: null }
    })
  }, [situation])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!user) return <LoginForm />

  return (
    <ModernLayout title="Mon Espace">
      <div className="p-6 space-y-6">

        {loadingSituation || !situation ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : situation.linked === false ? (
          <Card>
            <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-400" />
              <p className="font-semibold text-slate-800 dark:text-white">Compte non lié</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                Votre compte n'est pas encore lié à un copropriétaire. Demandez à l'administrateur de créer votre compte depuis l'écran Copropriétaires.
              </p>
            </CardContent>
          </Card>
        ) : (() => {
          const { coproprietaire: copro } = situation
          const totalDu    = yearRows.reduce((s, r) => s + r.montant_du, 0)
          const totalPaye  = yearRows.reduce((s, r) => s + r.montant, 0)
          const totalReste = yearRows.reduce((s, r) => s + r.montant_restant, 0)

          return (
            <>
              {/* Status banner */}
              {copro.total_dettes > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-700 dark:text-red-400">Solde impayé</p>
                    <p className="text-sm text-red-600 dark:text-red-500">
                      Vous avez <strong>{copro.total_dettes.toLocaleString()} DH</strong> de cotisations non réglées. Veuillez contacter le syndic.
                    </p>
                  </div>
                </div>
              )}
              {copro.total_dettes === 0 && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400">Situation à jour</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-500">Toutes vos cotisations sont réglées.</p>
                  </div>
                </div>
              )}

              {/* Info + totals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">Informations</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-white text-sm">
                        {copro.prenom[0]}{copro.nom[0]}
                      </div>
                      <span className="font-semibold">{copro.prenom} {copro.nom}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{copro.immeubles?.blocs?.nom ?? "—"} · {copro.immeubles?.nom ?? "—"} · Apt {copro.numero_appartement}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>CIN: {copro.cin || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Phone className="h-3.5 w-3.5" />
                      <span>Cotisation: {copro.montant_annuel.toLocaleString()} DH/an</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">Récapitulatif financier</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Total dû ({START_YEAR}–{CURRENT_YEAR})</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{totalDu.toLocaleString()} DH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Total payé</span>
                      <span className="font-semibold text-emerald-600">{totalPaye.toLocaleString()} DH</span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Solde restant</span>
                      <span className={`font-bold text-base ${totalReste > 0 ? "text-red-600" : "text-emerald-600"}`}>
                        {totalReste > 0 ? `${totalReste.toLocaleString()} DH` : "0 DH ✓"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Year-by-year payment history */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Historique des cotisations par année</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {yearRows.map((row) => {
                    const s = statutStyle(row.statut)
                    const { Icon } = s
                    return (
                      <div key={row.annee} className={`flex items-center justify-between px-4 py-3 rounded-lg ${s.bg}`}>
                        <div className="flex items-center gap-3">
                          <Icon className={`h-4 w-4 flex-shrink-0 ${s.iconColor}`} />
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{row.annee}</span>
                            {row.date && (
                              <span className="ml-2 text-xs text-slate-500">
                                {new Date(row.date).toLocaleDateString("fr-MA")}
                                {row.methode && ` · ${row.methode}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                              {row.montant > 0 ? `${row.montant.toLocaleString()} DH payé` : "Non réglé"}
                            </div>
                            {row.montant_restant > 0 && (
                              <div className="text-xs text-red-500">{row.montant_restant.toLocaleString()} DH restant</div>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.badge}`}>{s.label}</span>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </>
          )
        })()}
      </div>
    </ModernLayout>
  )
}

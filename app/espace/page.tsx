"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"
import { ModernLayout } from "@/components/modern-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-enhanced"

type SituationResponse =
  | { linked: false }
  | {
      linked: true
      coproprietaire: {
        id: string
        nom: string
        prenom: string
        cin: string | null
        numero_appartement: string
        montant_annuel: number
        total_dettes: number
        immeubles: { nom: string; blocs: { nom: string } | null } | null
      }
      paiements: Array<{ id: string; annee: string; montant: number; statut: string; date_paiement: string | null }>
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

  const lastPaiements = useMemo(() => {
    if (!situation || situation.linked === false) return []
    return [...situation.paiements]
      .sort((a, b) => (b.date_paiement || "").localeCompare(a.date_paiement || ""))
      .slice(0, 5)
  }, [situation])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) return <LoginForm />

  return (
    <ModernLayout title="Mon Espace">
      <div className="p-6 space-y-6">
        {loadingSituation || !situation ? (
          <div className="text-slate-600 dark:text-slate-400">Chargement…</div>
        ) : situation.linked === false ? (
          <Card>
            <CardHeader>
              <CardTitle>Compte non lié</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-slate-600 dark:text-slate-400">
                Votre compte n'est pas encore lié à un copropriétaire. Demandez à l'administrateur de créer votre compte
                depuis l'écran Copropriétaires.
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profil</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                  <div>
                    <span className="font-medium">Nom:</span> {situation.coproprietaire.prenom} {situation.coproprietaire.nom}
                  </div>
                  <div>
                    <span className="font-medium">Appartement:</span>{" "}
                    {(situation.coproprietaire.immeubles?.blocs?.nom ?? "—")}
                    {" / "}
                    {(situation.coproprietaire.immeubles?.nom ?? "—")}
                    {" / Apt "}
                    {situation.coproprietaire.numero_appartement}
                  </div>
                  <div>
                    <span className="font-medium">CIN:</span> {situation.coproprietaire.cin || "—"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Situation</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                  <div>
                    <span className="font-medium">Cotisation annuelle:</span> {situation.coproprietaire.montant_annuel} DH
                  </div>
                  <div>
                    <span className="font-medium">Total dettes:</span> {situation.coproprietaire.total_dettes} DH
                  </div>
                  <div>
                    <span className="font-medium">Paiements:</span> {situation.paiements.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Derniers paiements</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {lastPaiements.length === 0 ? (
                    <div className="text-slate-600 dark:text-slate-400">Aucun paiement trouvé.</div>
                  ) : (
                    <div className="space-y-2">
                      {lastPaiements.map((p) => (
                        <div key={p.id} className="flex items-center justify-between">
                          <div className="text-slate-700 dark:text-slate-300">
                            {p.annee} • {p.statut}
                          </div>
                          <div className="font-medium text-slate-900 dark:text-white">{p.montant} DH</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </ModernLayout>
  )
}

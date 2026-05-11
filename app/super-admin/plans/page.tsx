"use client"

import { useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"
import { ModernLayout } from "@/components/modern-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-enhanced"
import { Shield, Check } from "lucide-react"

const PLANS = [
  {
    id: "gratuit",
    label: "Gratuit",
    price: "0 MAD",
    color: "from-slate-400 to-slate-500",
    features: [
      "1 organisation",
      "Jusqu'à 20 copropriétaires",
      "Gestion des paiements",
      "Rapports de base",
    ],
    missing: ["PDF Quittances", "Ouvriers", "Ventes", "Multi-utilisateurs"],
  },
  {
    id: "basic",
    label: "Basic",
    price: "299 MAD/mois",
    color: "from-blue-500 to-indigo-600",
    features: [
      "1 organisation",
      "Jusqu'à 100 copropriétaires",
      "Gestion des paiements",
      "PDF Quittances",
      "Ouvriers & Ventes",
      "Rapports complets",
      "3 utilisateurs staff",
    ],
    missing: ["Multi-utilisateurs illimités"],
  },
  {
    id: "pro",
    label: "Pro",
    price: "599 MAD/mois",
    color: "from-purple-500 to-pink-600",
    features: [
      "Organisations illimitées",
      "Copropriétaires illimités",
      "Toutes les fonctionnalités",
      "Utilisateurs staff illimités",
      "Support prioritaire",
      "Exports Excel/PDF",
    ],
    missing: [],
  },
]

export default function PlansPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!user) return <LoginForm />

  if (user.role !== "super_admin") {
    return (
      <ModernLayout title="Plans">
        <div className="p-6 flex flex-col items-center justify-center py-20">
          <Shield className="h-16 w-16 text-red-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Accès réservé au super administrateur.</p>
        </div>
      </ModernLayout>
    )
  }

  return (
    <ModernLayout title="Plans">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Plans d'abonnement</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Vue d'ensemble des offres disponibles pour les organisations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <Card key={plan.id} className={plan.id === "pro" ? "ring-2 ring-purple-500" : ""}>
              <CardHeader className="pb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white font-bold mb-3`}>
                  {plan.label[0]}
                </div>
                <CardTitle className="text-lg">{plan.label}</CardTitle>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{plan.price}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    {f}
                  </div>
                ))}
                {plan.missing.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="w-3.5 h-3.5 flex-shrink-0 text-center text-xs">✕</span>
                    {f}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ModernLayout>
  )
}

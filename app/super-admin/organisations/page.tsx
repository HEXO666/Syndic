"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { getSupabaseClient } from "@/lib/supabase/client"
import { LoginForm } from "@/components/login-form"
import { ModernLayout } from "@/components/modern-layout"
import { Card, CardContent } from "@/components/ui/card-enhanced"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button-enhanced"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Globe, Plus, Building2, Power, PowerOff, Shield, Eye, EyeOff,
} from "lucide-react"

type Org = {
  id: string
  nom: string
  email: string | null
  telephone: string | null
  adresse: string | null
  plan: string
  status: string
  plan_expires_at: string | null
  created_at: string
}

const PLANS = [
  { value: "gratuit", label: "Gratuit", color: "bg-slate-100 text-slate-700" },
  { value: "basic",   label: "Basic",   color: "bg-blue-100 text-blue-700" },
  { value: "pro",     label: "Pro",     color: "bg-purple-100 text-purple-700" },
]

const planLabel = (p: string) => PLANS.find((x) => x.value === p)?.label ?? p
const planColor = (p: string) => PLANS.find((x) => x.value === p)?.color ?? "bg-slate-100 text-slate-700"

export default function SuperAdminOrgsPage() {
  const { user, isLoading } = useAuth()
  const [orgs, setOrgs] = useState<Org[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [form, setForm] = useState({
    nom: "", email: "", telephone: "", adresse: "", plan: "basic",
    adminNom: "", adminEmail: "", adminPassword: "",
  })
  const [showPass, setShowPass] = useState(false)

  const supabase = getSupabaseClient()

  const loadOrgs = async () => {
    const { data } = await supabase.from("organisations").select("*").order("created_at", { ascending: false })
    if (data) setOrgs(data as Org[])
    setLoading(false)
  }

  useEffect(() => { void loadOrgs() }, [])

  const toggleStatus = async (org: Org) => {
    setSaving(org.id)
    const next = org.status === "active" ? "inactive" : "active"
    await supabase.from("organisations").update({ status: next }).eq("id", org.id)
    setOrgs((prev) => prev.map((o) => o.id === org.id ? { ...o, status: next } : o))
    setSaving(null)
  }

  const updatePlan = async (orgId: string, plan: string) => {
    setSaving(orgId)
    await supabase.from("organisations").update({ plan }).eq("id", orgId)
    setOrgs((prev) => prev.map((o) => o.id === orgId ? { ...o, plan } : o))
    setSaving(null)
  }

  const createOrg = async () => {
    if (!form.nom.trim() || !form.adminEmail.trim() || !form.adminPassword.trim()) return
    setSaving("new")
    setCreateError(null)
    try {
      const res = await fetch("/api/super-admin/create-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.nom,
          email: form.email || null,
          telephone: form.telephone || null,
          adresse: form.adresse || null,
          plan: form.plan,
          adminNom: form.adminNom || "Administrateur",
          adminEmail: form.adminEmail,
          adminPassword: form.adminPassword,
        }),
      })
      const json = await res.json() as { org?: Org; error?: string }
      if (res.ok && json.org) {
        setOrgs((prev) => [json.org as Org, ...prev])
        setForm({ nom: "", email: "", telephone: "", adresse: "", plan: "basic", adminNom: "", adminEmail: "", adminPassword: "" })
        setCreateError(null)
        setOpen(false)
      } else {
        setCreateError(json.error ?? `Erreur ${res.status}`)
      }
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Erreur réseau")
    } finally {
      setSaving(null)
    }
  }

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
      <ModernLayout title="Organisations">
        <div className="p-6 flex flex-col items-center justify-center py-20">
          <Shield className="h-16 w-16 text-red-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Accès réservé au super administrateur.</p>
        </div>
      </ModernLayout>
    )
  }

  return (
    <ModernLayout title="Organisations">
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Organisations</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Gérez les syndicats clients et leurs abonnements</p>
            </div>
          </div>

          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setCreateError(null) }}>
            <DialogTrigger asChild>
              <Button leftIcon={<Plus className="h-4 w-4" />}>Nouvelle organisation</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Créer une organisation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">

                {/* Org info */}
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Organisation</p>
                <div className="space-y-1.5">
                  <Label>Nom *</Label>
                  <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Résidence Al Mansour" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email de contact</Label>
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@syndic.ma" type="email" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Téléphone</Label>
                    <Input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="+212 6XX XXX XXX" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Adresse</Label>
                    <Input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} placeholder="Casablanca" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Plan</Label>
                  <div className="flex gap-2">
                    {PLANS.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setForm({ ...form, plan: p.value })}
                        className={`flex-1 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                          form.plan === p.value
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Compte administrateur</p>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Nom de l'administrateur</Label>
                      <Input value={form.adminNom} onChange={(e) => setForm({ ...form, adminNom: e.target.value })} placeholder="Mohamed Alami" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email *</Label>
                      <Input value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} placeholder="admin@residence.ma" type="email" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Mot de passe *</Label>
                      <div className="relative">
                        <Input
                          type={showPass ? "text" : "password"}
                          value={form.adminPassword}
                          onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                          placeholder="••••••••"
                          className="pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {createError && (
                  <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    {createError}
                  </div>
                )}

                <Button
                  className="w-full"
                  loading={saving === "new"}
                  disabled={!form.nom.trim() || !form.adminEmail.trim() || !form.adminPassword.trim()}
                  onClick={createOrg}
                >
                  Créer l'organisation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{orgs.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{orgs.filter((o) => o.status === "active").length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Actives</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-500">{orgs.filter((o) => o.status !== "active").length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Inactives</p>
            </CardContent>
          </Card>
        </div>

        {/* Orgs list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : orgs.length === 0 ? (
          <Card>
            <CardContent className="py-16 flex flex-col items-center gap-3">
              <Building2 className="h-12 w-12 text-slate-300" />
              <p className="text-slate-500">Aucune organisation créée.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {orgs.map((org) => (
              <Card key={org.id} className={org.status !== "active" ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {org.nom[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 dark:text-white">{org.nom}</span>
                        <Badge className={`text-xs ${planColor(org.plan)}`}>{planLabel(org.plan)}</Badge>
                        <Badge className={`text-xs ${org.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                          {org.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {[org.email, org.telephone, org.adresse].filter(Boolean).join(" · ") || "Aucune info de contact"}
                      </p>
                    </div>

                    {/* Plan selector */}
                    <div className="flex gap-1 flex-shrink-0">
                      {PLANS.map((p) => (
                        <button
                          key={p.value}
                          disabled={saving === org.id}
                          onClick={() => void updatePlan(org.id, p.value)}
                          className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                            org.plan === p.value
                              ? planColor(p.value) + " ring-1 ring-current"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    {/* Toggle button */}
                    <Button
                      variant={org.status === "active" ? "destructive" : "success"}
                      size="sm"
                      loading={saving === org.id}
                      onClick={() => void toggleStatus(org)}
                      leftIcon={org.status === "active" ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                    >
                      {org.status === "active" ? "Désactiver" : "Activer"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ModernLayout>
  )
}

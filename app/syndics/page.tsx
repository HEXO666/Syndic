"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { getSupabaseClient } from "@/lib/supabase/client"
import { LoginForm } from "@/components/login-form"
import { ModernLayout } from "@/components/modern-layout"
import { Card, CardContent } from "@/components/ui/card-enhanced"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button-enhanced"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Shield, Building2, Plus, Trash2, Mail, Home, Eye, EyeOff, CheckSquare, Square } from "lucide-react"

type SyndicRow = {
  id: string
  nom: string
  email: string
  immeubles: { id: string; nom: string; bloc?: string }[]
}

export default function SyndicsPage() {
  const { user, isLoading } = useAuth()
  const { immeubles, blocs } = useData()
  const supabase = getSupabaseClient()

  const [syndics, setSyndics] = useState<SyndicRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    nom: "", email: "", password: "", selectedImmeubles: [] as string[],
  })

  const loadSyndics = async () => {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, nom, email")
      .eq("role", "syndic")
      .order("nom")

    if (!profiles) { setLoading(false); return }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: links } = await (supabase as any)
      .from("syndic_immeubles")
      .select("syndic_id, immeuble_id") as { data: { syndic_id: string; immeuble_id: string }[] | null }

    setSyndics(profiles.map((p) => {
      const ids = links?.filter((l) => l.syndic_id === p.id).map((l) => l.immeuble_id) ?? []
      return {
        id: p.id,
        nom: p.nom,
        email: p.email,
        immeubles: ids.map((id) => {
          const imm = immeubles.find((i) => i.id === id)
          const bloc = imm ? blocs.find((b) => b.id === imm.bloqueId) : undefined
          return { id, nom: imm?.nom ?? id, bloc: bloc?.nom }
        }),
      }
    }))
    setLoading(false)
  }

  useEffect(() => {
    if (!user || user.role !== "admin") { setLoading(false); return }
    void loadSyndics()
  }, [user, immeubles])

  const toggleImmeuble = (id: string) => {
    setForm((prev) => ({
      ...prev,
      selectedImmeubles: prev.selectedImmeubles.includes(id)
        ? prev.selectedImmeubles.filter((x) => x !== id)
        : [...prev.selectedImmeubles, id],
    }))
  }

  const createSyndic = async () => {
    if (!form.nom || !form.email || !form.password) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/create-syndic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.nom,
          email: form.email,
          password: form.password,
          immeubleIds: form.selectedImmeubles,
        }),
      })
      if (res.ok) {
        setForm({ nom: "", email: "", password: "", selectedImmeubles: [] })
        setOpen(false)
        await loadSyndics()
      }
    } finally {
      setSaving(false)
    }
  }

  const deleteSyndic = async (id: string) => {
    await supabase.from("profiles").delete().eq("id", id)
    setSyndics((prev) => prev.filter((s) => s.id !== id))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!user) return <LoginForm />

  if (user.role !== "admin") {
    return (
      <ModernLayout title="Syndics">
        <div className="p-6 flex flex-col items-center justify-center py-20">
          <Shield className="h-16 w-16 text-red-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Accès réservé à l'administrateur.</p>
        </div>
      </ModernLayout>
    )
  }

  return (
    <ModernLayout title="Syndics">
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Syndics de bâtiment</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Créez et gérez les responsables par bâtiment
              </p>
            </div>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button leftIcon={<Plus className="h-4 w-4" />}>Nouveau syndic</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un syndic de bâtiment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Nom complet *</Label>
                  <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Ahmed Benali" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ahmed@syndic.ma" />
                </div>
                <div className="space-y-1.5">
                  <Label>Mot de passe *</Label>
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className="pr-9"
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bâtiments assignés</Label>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-100 dark:divide-slate-800">
                    {immeubles.length === 0 ? (
                      <p className="p-3 text-sm text-slate-400 text-center">Aucun bâtiment disponible</p>
                    ) : immeubles.map((imm) => {
                      const bloc = blocs.find((b) => b.id === imm.bloqueId)
                      const selected = form.selectedImmeubles.includes(imm.id)
                      return (
                        <button
                          key={imm.id}
                          type="button"
                          onClick={() => toggleImmeuble(imm.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${selected ? "bg-indigo-50 dark:bg-indigo-950/30" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                        >
                          {selected
                            ? <CheckSquare className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                            : <Square className="h-4 w-4 text-slate-300 flex-shrink-0" />
                          }
                          <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{imm.nom}</p>
                            {bloc && <p className="text-xs text-slate-500">{bloc.nom}</p>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  {form.selectedImmeubles.length > 0 && (
                    <p className="text-xs text-indigo-600">{form.selectedImmeubles.length} bâtiment(s) sélectionné(s)</p>
                  )}
                </div>

                <Button
                  className="w-full"
                  loading={saving}
                  disabled={!form.nom || !form.email || !form.password}
                  onClick={createSyndic}
                >
                  Créer le syndic
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : syndics.length === 0 ? (
          <Card>
            <CardContent className="py-16 flex flex-col items-center gap-3">
              <Building2 className="h-12 w-12 text-slate-300" />
              <p className="text-slate-500 dark:text-slate-400">Aucun syndic créé. Créez-en un pour commencer.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {syndics.map((s) => (
              <Card key={s.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {s.nom[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{s.nom}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-[160px]">{s.email}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-700 text-xs flex-shrink-0">Syndic</Badge>
                  </div>

                  {s.immeubles.length > 0 ? (
                    <div className="space-y-1 mb-3">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1.5">Bâtiments</p>
                      {s.immeubles.map((imm) => (
                        <div key={imm.id} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <Home className="h-3 w-3 flex-shrink-0 text-indigo-400" />
                          <span>{imm.nom}{imm.bloc ? ` · ${imm.bloc}` : ""}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic mb-3">Aucun bâtiment assigné</p>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20" leftIcon={<Trash2 className="h-3.5 w-3.5" />}>
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le syndic</AlertDialogTitle>
                        <AlertDialogDescription>
                          Supprimer <strong>{s.nom}</strong> ? Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => void deleteSyndic(s.id)} className="bg-red-600 hover:bg-red-700">
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ModernLayout>
  )
}

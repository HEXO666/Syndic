"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button-enhanced"
import { Input, Textarea } from "@/components/ui/input-enhanced"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card-enhanced"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData, type Immeuble } from "@/lib/data-context"
import { Building, Building2, X } from "lucide-react"

interface ImmeubleFormProps {
  immeuble?: Immeuble | null
  selectedBlocId?: string
  onSuccess: () => void
  onCancel: () => void
}

export function ImmeubleForm({ immeuble, selectedBlocId, onSuccess, onCancel }: ImmeubleFormProps) {
  const { blocs, addImmeuble, updateImmeuble } = useData()
  const [formData, setFormData] = useState({
    nom: "",
    bloqueId: selectedBlocId || "",
    description: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (immeuble) {
      setFormData({
        nom: immeuble.nom,
        bloqueId: immeuble.bloqueId,
        description: immeuble.description || "",
      })
      setErrors({})
    } else {
      setFormData({
        nom: "",
        bloqueId: selectedBlocId || "",
        description: "",
      })
      setErrors({})
    }
  }, [immeuble, selectedBlocId])

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!formData.nom.trim()) {
      nextErrors.nom = "Le nom de l'immeuble est requis"
    }
    if (!formData.bloqueId) {
      nextErrors.bloqueId = "Le bloc est obligatoire"
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      return
    }

    const selectedBloc = blocs.find((b) => b.id === formData.bloqueId)
    if (!selectedBloc) {
      setErrors({ bloqueId: "Bloc introuvable" })
      return
    }

    setIsSubmitting(true)
    try {
      const immeubleData = {
        ...formData,
        bloqueName: selectedBloc.nom,
      }

      if (immeuble) {
        updateImmeuble(immeuble.id, immeubleData)
      } else {
        addImmeuble(immeubleData)
      }

      onSuccess()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card variant="premium" className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center border-b border-slate-100 dark:border-slate-800">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Building className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl bg-gradient-to-r from-slate-800 via-indigo-700 to-blue-700 dark:from-white dark:via-indigo-300 dark:to-blue-300 bg-clip-text text-transparent">
          {immeuble ? "Modifier l'immeuble" : "Nouvel immeuble"}
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          {immeuble
            ? "Mettez à jour les informations de cet immeuble."
            : "Enregistrez un nouvel immeuble et rattachez-le à un bloc."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="nom"
            name="nom"
            label="Nom de l'immeuble"
            variant="modern"
            size="lg"
            placeholder="Ex: Immeuble 1, Bâtiment A"
            value={formData.nom}
            onChange={(e) => {
              const value = e.target.value
              setFormData({ ...formData, nom: value })
              if (errors.nom) {
                setErrors((prev) => {
                  if (!prev.nom) return prev
                  const next = { ...prev }
                  delete next.nom
                  return next
                })
              }
            }}
            error={errors.nom}
            required
            leftIcon={<Building2 className="h-4 w-4" />}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Bloc rattaché <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.bloqueId}
              onValueChange={(value) => {
                setFormData({ ...formData, bloqueId: value })
                setErrors((prev) => {
                  if (!prev.bloqueId) return prev
                  const next = { ...prev }
                  delete next.bloqueId
                  return next
                })
              }}
            >
              <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Sélectionnez un bloc" />
              </SelectTrigger>
              <SelectContent>
                {blocs.map((bloc) => (
                  <SelectItem key={bloc.id} value={bloc.id}>
                    {bloc.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bloqueId && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.bloqueId}</p>
            )}
          </div>

          <Textarea
            id="description"
            name="description"
            label="Description (optionnelle)"
            placeholder="Ajoutez des détails supplémentaires sur l'immeuble."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
          />

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onCancel} leftIcon={<X className="h-4 w-4" />}>
              Annuler
            </Button>
            <Button type="submit" variant="success" loading={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : immeuble ? "Modifier" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

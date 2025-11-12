"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button-enhanced"
import { Input, Textarea } from "@/components/ui/input-enhanced"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card-enhanced"
import { useData, type Bloque } from "@/lib/data-context"
import { Building2, Sparkles, X } from "lucide-react"

interface BlocFormProps {
  bloc?: Bloque | null
  onSuccess: () => void
  onCancel: () => void
}

export function BlocForm({ bloc, onSuccess, onCancel }: BlocFormProps) {
  const { addBloc, updateBloc } = useData()
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (bloc) {
      setFormData({
        nom: bloc.nom,
        description: bloc.description || "",
      })
      setErrors({})
    } else {
      setFormData({ nom: "", description: "" })
      setErrors({})
    }
  }, [bloc])

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!formData.nom.trim()) {
      nextErrors.nom = "Le nom du bloc est requis"
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    try {
      if (bloc) {
        updateBloc(bloc.id, formData)
      } else {
        addBloc(formData)
      }
      onSuccess()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card variant="premium" className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center border-b border-slate-100 dark:border-slate-800">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-800 dark:from-white dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
          {bloc ? "Modifier le bloc" : "Nouveau bloc"}
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          {bloc
            ? "Actualisez les informations de ce bloc résidentiel."
            : "Ajoutez un nouveau bloc pour organiser vos immeubles."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="nom"
            name="nom"
            label="Nom du bloc"
            variant="modern"
            size="lg"
            placeholder="Ex: Bloc A, Bloc Central"
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
            leftIcon={<Sparkles className="h-4 w-4" />}
          />

          <Textarea
            id="description"
            name="description"
            label="Description (optionnelle)"
            placeholder="Précisez les particularités ou services liés à ce bloc."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
          />

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onCancel} leftIcon={<X className="h-4 w-4" />}>
              Annuler
            </Button>
            <Button type="submit" variant="success" loading={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : bloc ? "Modifier" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

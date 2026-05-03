"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button-enhanced"
import { Input } from "@/components/ui/input-enhanced"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card-enhanced"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useData, type Bloque, type Immeuble } from "@/lib/data-context"
import { Building2, Home, FileText, Save, X } from "lucide-react"

interface ModernBlocFormProps {
  bloc?: Bloque | null
  onSuccess: () => void
  onCancel?: () => void
}

export function ModernBlocForm({ bloc, onSuccess, onCancel }: ModernBlocFormProps) {
  const { addBloc, updateBloc } = useData()
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (bloc) {
      setFormData({
        nom: bloc.nom,
        description: bloc.description || "",
      })
    }
  }, [bloc])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.nom.trim()) newErrors.nom = "Le nom du bloc est obligatoire"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
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
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  return (
    <Card  className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center border-b border-slate-100 dark:border-slate-800">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl bg-gradient-to-r from-slate-800 via-emerald-700 to-teal-800 dark:from-white dark:via-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
          {bloc ? "Modifier le bloc" : "Nouveau bloc"}
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Informations sur le bloc d'immeubles
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            variant="modern"
            size="lg"
            label="Nom du bloc"
            leftIcon={<Building2 className="h-4 w-4" />}
            value={formData.nom}
            onChange={(e) => handleInputChange("nom", e.target.value)}
            placeholder="Bloc A, Bloc B..."
            required
            error={errors.nom}
          />

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Description (optionnel)
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Description du bloc, caractéristiques particulières..."
              className="min-h-[100px] rounded-xl border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              leftIcon={<X className="h-4 w-4" />}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="success"
              loading={isSubmitting}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {isSubmitting ? "Enregistrement..." : bloc ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

interface ModernImmeubleFormProps {
  immeuble?: Immeuble | null
  blocId: string
  bloqueName: string
  onSuccess: () => void
  onCancel?: () => void
}

export function ModernImmeubleForm({ immeuble, blocId, bloqueName, onSuccess, onCancel }: ModernImmeubleFormProps) {
  const { addImmeuble, updateImmeuble } = useData()
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (immeuble) {
      setFormData({
        nom: immeuble.nom,
        description: immeuble.description || "",
      })
    }
  }, [immeuble])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.nom.trim()) newErrors.nom = "Le nom de l'immeuble est obligatoire"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const immeubleData = {
        ...formData,
        bloqueId: blocId,
        bloqueName: bloqueName,
      }

      if (immeuble) {
        updateImmeuble(immeuble.id, immeubleData)
      } else {
        addImmeuble(immeubleData)
      }
      onSuccess()
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  return (
    <Card  className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center border-b border-slate-100 dark:border-slate-800">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Home className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-800 dark:from-white dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
          {immeuble ? "Modifier l'immeuble" : "Nouvel immeuble"}
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Immeuble du bloc: {bloqueName}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            
            size="lg"
            label="Nom de l'immeuble"
            leftIcon={<Home className="h-4 w-4" />}
            value={formData.nom}
            onChange={(e) => handleInputChange("nom", e.target.value)}
            placeholder="Immeuble 1, Bâtiment A..."
            required
            error={errors.nom}
          />

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Description (optionnel)
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Description de l'immeuble, caractéristiques particulières..."
              className="min-h-[100px] rounded-xl border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:border-blue-500/50 focus:ring-blue-500/30"
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              leftIcon={<X className="h-4 w-4" />}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isSubmitting}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {isSubmitting ? "Enregistrement..." : immeuble ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
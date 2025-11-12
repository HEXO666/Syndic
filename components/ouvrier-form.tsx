"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button-enhanced"
import { Input } from "@/components/ui/input-enhanced"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card-enhanced"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Hammer, MapPin, Phone, User, Users, Wrench, X } from "lucide-react"
import { useData } from "@/lib/data-context"
import type { MetierOuvrier, Ouvrier } from "@/lib/data-context"

interface OuvrierFormProps {
  ouvrier?: Ouvrier | null
  onSuccess?: () => void
  onCancel?: () => void
}

const METIER_OPTIONS: MetierOuvrier[] = ["jardinier", "securite", "femme-de-menage", "maintenance", "autre"]

interface FormState {
  nom: string
  prenom: string
  adresse: string
  telephoneMaroc: string
  metier: MetierOuvrier
}

const createFormState = (ouvrier?: Ouvrier | null): FormState => ({
  nom: ouvrier?.nom || "",
  prenom: ouvrier?.prenom || "",
  adresse: ouvrier?.adresse || "",
  telephoneMaroc: ouvrier?.telephoneMaroc || "+212",
  metier: (ouvrier?.metier as MetierOuvrier | undefined) || "jardinier",
})

const isMetierOption = (value: string): value is MetierOuvrier =>
  METIER_OPTIONS.includes(value as MetierOuvrier)

export function OuvrierForm({ ouvrier, onSuccess, onCancel }: OuvrierFormProps) {
  const { addOuvrier, updateOuvrier } = useData()
  const [formData, setFormData] = useState<FormState>(createFormState(ouvrier))

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setFormData(createFormState(ouvrier))
    setErrors({})
  }, [ouvrier])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis"
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis"
    if (!formData.adresse.trim()) newErrors.adresse = "L'adresse est requise"
    if (!formData.telephoneMaroc.trim())
      newErrors.telephoneMaroc = "Le téléphone est requis"
    if (!formData.metier) newErrors.metier = "Le métier est requis"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const payload = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        adresse: formData.adresse.trim(),
        telephoneMaroc: formData.telephoneMaroc.trim(),
        metier: formData.metier,
      }

      if (ouvrier) {
        updateOuvrier(ouvrier.id, payload)
      } else {
        addOuvrier(payload)
      }
      onSuccess?.()
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card variant="premium" className="w-full max-w-3xl mx-auto">
      <CardHeader className="text-center border-b border-slate-100 dark:border-slate-800">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Wrench className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl bg-gradient-to-r from-slate-800 via-orange-700 to-amber-700 dark:from-white dark:via-orange-300 dark:to-amber-300 bg-clip-text text-transparent">
          {ouvrier ? "Modifier l'ouvrier" : "Nouvel ouvrier"}
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          {ouvrier
            ? "Actualisez le profil et les coordonnées de cet ouvrier."
            : "Ajoutez un nouvel intervenant et précisez ses missions."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="nom"
              label="Nom"
              placeholder="Martin"
              variant="modern"
              size="lg"
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
              leftIcon={<User className="h-4 w-4" />}
              required
            />
            <Input
              id="prenom"
              label="Prénom"
              placeholder="Pierre"
              variant="modern"
              size="lg"
              value={formData.prenom}
              onChange={(e) => {
                const value = e.target.value
                setFormData({ ...formData, prenom: value })
                if (errors.prenom) {
                  setErrors((prev) => {
                    if (!prev.prenom) return prev
                    const next = { ...prev }
                    delete next.prenom
                    return next
                  })
                }
              }}
              error={errors.prenom}
              leftIcon={<Users className="h-4 w-4" />}
              required
            />
          </div>

          <Input
            id="adresse"
            label="Adresse"
            placeholder="45 Rue des Travailleurs, Fès"
            variant="modern"
            size="lg"
            value={formData.adresse}
            onChange={(e) => {
              const value = e.target.value
              setFormData({ ...formData, adresse: value })
              if (errors.adresse) {
                setErrors((prev) => {
                  if (!prev.adresse) return prev
                  const next = { ...prev }
                  delete next.adresse
                  return next
                })
              }
            }}
            error={errors.adresse}
            leftIcon={<MapPin className="h-4 w-4" />}
            required
          />

          <Input
            id="telephoneMaroc"
            label="Téléphone Maroc (+212)"
            placeholder="+212 6 12 34 56 78"
            variant="modern"
            size="lg"
            value={formData.telephoneMaroc}
            onChange={(e) => {
              const value = e.target.value
              setFormData({ ...formData, telephoneMaroc: value })
              if (errors.telephoneMaroc) {
                setErrors((prev) => {
                  if (!prev.telephoneMaroc) return prev
                  const next = { ...prev }
                  delete next.telephoneMaroc
                  return next
                })
              }
            }}
            error={errors.telephoneMaroc}
            leftIcon={<Phone className="h-4 w-4" />}
            required
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Métier <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.metier}
              onValueChange={(value) => {
                if (!isMetierOption(value)) return
                setFormData({ ...formData, metier: value })
                setErrors((prev) => {
                  if (!prev.metier) return prev
                  const next = { ...prev }
                  delete next.metier
                  return next
                })
              }}
            >
              <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Sélectionner un métier" />
              </SelectTrigger>
              <SelectContent>
                {METIER_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "femme-de-menage"
                      ? "Femme de ménage"
                      : option.charAt(0).toUpperCase() + option.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.metier && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.metier}
              </p>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onCancel} leftIcon={<X className="h-4 w-4" />}>
              Annuler
            </Button>
            <Button type="submit" variant="success" loading={isSubmitting} leftIcon={<Hammer className="h-4 w-4" />}>
              {isSubmitting
                ? "Enregistrement..."
                : ouvrier
                  ? "Modifier"
                  : "Enregistrer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

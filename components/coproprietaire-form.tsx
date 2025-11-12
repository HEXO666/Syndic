"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button-enhanced"
import { Input, Textarea } from "@/components/ui/input-enhanced"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card-enhanced"
import { Globe2, Home, IdCard, MapPin, Phone, Shield, User, UserPlus, Users, X } from "lucide-react"

interface CoproprietaireFormProps {
  coproprietaire?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function CoproprietaireForm({
  coproprietaire,
  onSuccess,
  onCancel,
}: CoproprietaireFormProps) {
  const [formData, setFormData] = useState({
    nom: coproprietaire?.nom || "",
    prenom: coproprietaire?.prenom || "",
    adresse: coproprietaire?.adresse || "",
    telephoneMaroc: coproprietaire?.telephoneMaroc || "+212",
    habiteLEtranger: coproprietaire?.habiteLEtranger || false,
    adresseEtranger: coproprietaire?.adresseEtranger || "",
    numeroTitreFoncier: coproprietaire?.numeroTitreFoncier || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis"
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis"
    if (!formData.adresse.trim()) newErrors.adresse = "L'adresse est requise"
    if (!formData.telephoneMaroc.trim())
      newErrors.telephoneMaroc = "Le téléphone est requis"
    if (formData.habiteLEtranger && !formData.adresseEtranger.trim()) {
      newErrors.adresseEtranger = "L'adresse à l'étranger est requise"
    }
    if (!formData.numeroTitreFoncier.trim())
      newErrors.numeroTitreFoncier = "Le numéro de titre foncier est requis"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
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
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
          <UserPlus className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl bg-gradient-to-r from-slate-800 via-emerald-700 to-teal-700 dark:from-white dark:via-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
          {coproprietaire ? "Modifier le copropriétaire" : "Nouveau copropriétaire"}
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          {coproprietaire
            ? "Mettez à jour les informations de ce copropriétaire."
            : "Renseignez les informations clés du nouveau copropriétaire."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="nom"
              label="Nom"
              placeholder="Dupont"
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
              placeholder="Jean"
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

          <Textarea
            id="adresse"
            label="Adresse au Maroc"
            placeholder="123 Rue de la Paix, Casablanca"
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
            rows={3}
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

          <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Globe2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">
                    Résidence à l'étranger
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Indiquez si ce copropriétaire vit hors du Maroc.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant={formData.habiteLEtranger ? "success" : "outline"}
                onClick={() =>
                  setFormData((prev) => {
                    const nextValue = !prev.habiteLEtranger
                    if (!nextValue) {
                      setErrors((errs) => {
                        if (!errs.adresseEtranger) return errs
                        const next = { ...errs }
                        delete next.adresseEtranger
                        return next
                      })
                    }
                    return {
                      ...prev,
                      habiteLEtranger: nextValue,
                      adresseEtranger: nextValue ? prev.adresseEtranger : "",
                    }
                  })
                }
                leftIcon={<Shield className="h-3 w-3" />}
              >
                {formData.habiteLEtranger ? "Activé" : "Désactivé"}
              </Button>
            </div>

            {formData.habiteLEtranger && (
              <Input
                id="adresseEtranger"
                label="Adresse à l'étranger"
                placeholder="Paris, France"
                variant="modern"
                size="lg"
                value={formData.adresseEtranger}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData({
                    ...formData,
                    adresseEtranger: value,
                  })
                  if (errors.adresseEtranger) {
                    setErrors((prev) => {
                      if (!prev.adresseEtranger) return prev
                      const next = { ...prev }
                      delete next.adresseEtranger
                      return next
                    })
                  }
                }}
                error={errors.adresseEtranger}
                leftIcon={<MapPin className="h-4 w-4" />}
                required={formData.habiteLEtranger}
              />
            )}
          </div>

          <Input
            id="numeroTitreFoncier"
            label="Numéro de titre foncier"
            placeholder="12345/A/2024"
            variant="modern"
            size="lg"
            value={formData.numeroTitreFoncier}
            onChange={(e) => {
              const value = e.target.value
              setFormData({
                ...formData,
                numeroTitreFoncier: value,
              })
              if (errors.numeroTitreFoncier) {
                setErrors((prev) => {
                  if (!prev.numeroTitreFoncier) return prev
                  const next = { ...prev }
                  delete next.numeroTitreFoncier
                  return next
                })
              }
            }}
            error={errors.numeroTitreFoncier}
            leftIcon={<IdCard className="h-4 w-4" />}
            required
          />

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onCancel} leftIcon={<X className="h-4 w-4" />}>
              Annuler
            </Button>
            <Button type="submit" variant="success" loading={isSubmitting} leftIcon={<Home className="h-4 w-4" />}>
              {isSubmitting ? "Enregistrement..." : coproprietaire ? "Modifier" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

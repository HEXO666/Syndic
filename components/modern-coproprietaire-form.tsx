"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button-enhanced"
import { Input } from "@/components/ui/input-enhanced"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card-enhanced"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData, type Coproprietaire } from "@/lib/data-context"
import { User, MapPin, Phone, Building2, Home, FileText, Save, X, Check } from "lucide-react"

interface ModernCoproprietaireFormProps {
  coproprietaire?: Coproprietaire | null
  onSuccess: () => void
  onCancel?: () => void
}

export function ModernCoproprietaireForm({ coproprietaire, onSuccess, onCancel }: ModernCoproprietaireFormProps) {
  const { addCoproprietaire, updateCoproprietaire, blocs, getImmeublesByBloc } = useData()
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    adresse: "",
    cin: "",
    telephone: "",
    telephoneEtranger: "",
    bloque: "",
    immeuble: "",
    numeroAppartement: "",
    titreFoncier: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableImmeubles, setAvailableImmeubles] = useState<any[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (coproprietaire) {
      setFormData({
        nom: coproprietaire.nom,
        prenom: coproprietaire.prenom,
        adresse: coproprietaire.adresse,
        cin: coproprietaire.cin || "",
        telephone: coproprietaire.telephone || "",
        telephoneEtranger: coproprietaire.telephoneEtranger || "",
        bloque: coproprietaire.bloque,
        immeuble: coproprietaire.immeuble,
        numeroAppartement: coproprietaire.numeroAppartement,
        titreFoncier: coproprietaire.titreFoncier || "",
      })
      if (coproprietaire.bloque) {
        const blocSelectionne = blocs.find((b) => b.nom === coproprietaire.bloque)
        if (blocSelectionne) {
          setAvailableImmeubles(getImmeublesByBloc(blocSelectionne.id))
        }
      }
    }
  }, [coproprietaire, blocs, getImmeublesByBloc])

  const handleBlocChange = (blocNom: string) => {
    setFormData({ ...formData, bloque: blocNom, immeuble: "" })
    const blocSelectionne = blocs.find((b) => b.nom === blocNom)
    if (blocSelectionne) {
      setAvailableImmeubles(getImmeublesByBloc(blocSelectionne.id))
    } else {
      setAvailableImmeubles([])
    }
  }

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (stepNumber === 1) {
      if (!formData.nom.trim()) newErrors.nom = "Le nom est obligatoire"
      if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est obligatoire"
      if (!formData.cin.trim()) newErrors.cin = "Le CIN est obligatoire"
      if (!formData.telephone.trim()) newErrors.telephone = "Le téléphone est obligatoire"
    }

    if (stepNumber === 2) {
      if (!formData.bloque) newErrors.bloque = "Le bloc est obligatoire"
      if (!formData.immeuble) newErrors.immeuble = "L'immeuble est obligatoire"
      if (!formData.numeroAppartement.trim()) newErrors.numeroAppartement = "Le numéro d'appartement est obligatoire"
      if (!formData.titreFoncier.trim()) newErrors.titreFoncier = "Le titre foncier est obligatoire"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(1) || !validateStep(2)) return

    setIsSubmitting(true)
    try {
      if (coproprietaire) {
        updateCoproprietaire(coproprietaire.id, formData)
      } else {
        addCoproprietaire(formData)
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                stepNum === step
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-110"
                  : stepNum < step
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-500"
              }`}
            >
              {stepNum < step ? <Check className="h-4 w-4" /> : stepNum}
            </div>
            {stepNum < 2 && (
              <div
                className={`w-8 h-1 mx-2 rounded-full transition-all duration-300 ${
                  stepNum < step ? "bg-gradient-to-r from-emerald-500 to-green-600" : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <Card variant="premium" className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center border-b border-slate-100 dark:border-slate-800">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <User className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-800 dark:from-white dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
          {coproprietaire ? "Modifier le copropriétaire" : "Nouveau copropriétaire"}
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          {step === 1 ? "Informations personnelles" : "Informations de propriété"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        {renderStepIndicator()}

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  variant="modern"
                  size="lg"
                  label="Prénom"
                  leftIcon={<User className="h-4 w-4" />}
                  value={formData.prenom}
                  onChange={(e) => handleInputChange("prenom", e.target.value)}
                  placeholder="Prénom du copropriétaire"
                  required
                  error={errors.prenom}
                />
                <Input
                  variant="modern"
                  size="lg"
                  label="Nom de famille"
                  leftIcon={<User className="h-4 w-4" />}
                  value={formData.nom}
                  onChange={(e) => handleInputChange("nom", e.target.value)}
                  placeholder="Nom de famille"
                  required
                  error={errors.nom}
                />
              </div>

              <Input
                variant="modern"
                size="lg"
                label="CIN (Carte d'identité)"
                leftIcon={<FileText className="h-4 w-4" />}
                value={formData.cin}
                onChange={(e) => handleInputChange("cin", e.target.value)}
                placeholder="XX123456"
                required
                error={errors.cin}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  variant="modern"
                  size="lg"
                  label="Téléphone principal"
                  leftIcon={<Phone className="h-4 w-4" />}
                  value={formData.telephone}
                  onChange={(e) => handleInputChange("telephone", e.target.value)}
                  placeholder="+212 6XX XXX XXX"
                  required
                  error={errors.telephone}
                />
                <Input
                  variant="modern"
                  size="lg"
                  label="Téléphone étranger (optionnel)"
                  leftIcon={<Phone className="h-4 w-4" />}
                  value={formData.telephoneEtranger}
                  onChange={(e) => handleInputChange("telephoneEtranger", e.target.value)}
                  placeholder="+33 X XX XX XX XX"
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
                  type="button"
                  variant="default"
                  onClick={handleNext}
                  rightIcon={<span>→</span>}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-left duration-300">
              <Input
                variant="modern"
                size="lg"
                label="Adresse complète"
                leftIcon={<MapPin className="h-4 w-4" />}
                value={formData.adresse}
                onChange={(e) => handleInputChange("adresse", e.target.value)}
                placeholder="Adresse complète de résidence"
                required
                error={errors.adresse}
              />

              <Input
                variant="modern"
                size="lg"
                label="Titre Foncier"
                leftIcon={<FileText className="h-4 w-4" />}
                value={formData.titreFoncier}
                onChange={(e) => handleInputChange("titreFoncier", e.target.value)}
                placeholder="Numéro ou référence du titre foncier"
                required
                error={errors.titreFoncier}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Bloc <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.bloque} onValueChange={handleBlocChange}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Sélectionnez un bloc" />
                    </SelectTrigger>
                    <SelectContent>
                      {blocs.map((bloc) => (
                        <SelectItem key={bloc.id} value={bloc.nom}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {bloc.nom}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.bloque && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.bloque}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Immeuble <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.immeuble} onValueChange={(value) => handleInputChange("immeuble", value)}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Sélectionnez un immeuble" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableImmeubles.map((immeuble) => (
                        <SelectItem key={immeuble.id} value={immeuble.nom}>
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            {immeuble.nom}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.immeuble && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.immeuble}</p>
                  )}
                </div>

                <Input
                  variant="modern"
                  size="lg"
                  label="N° Appartement"
                  value={formData.numeroAppartement}
                  onChange={(e) => handleInputChange("numeroAppartement", e.target.value)}
                  placeholder="123"
                  required
                  error={errors.numeroAppartement}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  leftIcon={<span>←</span>}
                >
                  Retour
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  loading={isSubmitting}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  {isSubmitting ? "Enregistrement..." : coproprietaire ? "Modifier" : "Ajouter"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
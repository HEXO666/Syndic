"use client"

import type React from "react"
import { useCallback, useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button-enhanced"
import { Input } from "@/components/ui/input-enhanced"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card-enhanced"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useData, type Paiement, type Coproprietaire, type Immeuble } from "@/lib/data-context"
import {
  CreditCard,
  Banknote,
  Building,
  Building2,
  Calendar,
  FileText,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  Euro,
  User,
  Receipt,
  Home,
  MapPin,
  Phone,
} from "lucide-react"

interface ModernPaiementFormProps {
  paiement?: Paiement | null
  coproprietaireId?: string
  onSuccess: () => void
  onCancel?: () => void
}

interface AppartementOption {
  coproprietaireId: string
  numeroAppartement: string
  label: string
}

const COTISATION_ANNUELLE = 1200

const computeStatusFromMontant = (value: string): "paye" | "impaye" | "partiel" => {
  const montant = Number.parseFloat(value)
  if (!Number.isFinite(montant) || montant <= 0) {
    return "impaye"
  }
  if (montant >= COTISATION_ANNUELLE) {
    return "paye"
  }
  return "partiel"
}

export function ModernPaiementForm({ paiement, coproprietaireId, onSuccess, onCancel }: ModernPaiementFormProps) {
  const { addPaiement, updatePaiement, coproprietaires, blocs, getImmeublesByBloc } = useData()
  const router = useRouter()

  const [formData, setFormData] = useState({
    coproprietaireId: coproprietaireId || "",
    coproprietaireNom: "",
    montant: "",
    annee: new Date().getFullYear().toString(),
    datePaiement: new Date().toISOString().split("T")[0],
    methodePaiement: "especes" as "especes" | "cheque" | "virement",
    statut: "impaye" as "paye" | "impaye" | "partiel",
    numeroCheque: "",
    numeroVirement: "",
    notes: "",
  })
  const [selectedBlocId, setSelectedBlocId] = useState("")
  const [selectedImmeubleId, setSelectedImmeubleId] = useState("")
  const [availableImmeubles, setAvailableImmeubles] = useState<Immeuble[]>([])
  const [availableAppartements, setAvailableAppartements] = useState<AppartementOption[]>([])
  const [selectedCoproprietaire, setSelectedCoproprietaire] = useState<Coproprietaire | null>(null)
  const [statusTouched, setStatusTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const recommendedStatus = useMemo(() => computeStatusFromMontant(formData.montant), [formData.montant])

  const clearError = useCallback((key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const configureFromCopro = useCallback(
    (coproId: string) => {
      if (!coproId) {
        setSelectedCoproprietaire(null)
        return
      }

      const copro = coproprietaires.find((c) => c.id === coproId)
      if (!copro) {
        setSelectedCoproprietaire(null)
        return
      }

      setSelectedCoproprietaire(copro)

      setFormData((prev) => ({
        ...prev,
        coproprietaireId: coproId,
        coproprietaireNom: `${copro.prenom} ${copro.nom}`,
      }))

      const bloc = blocs.find((b) => b.nom === copro.bloque)
      if (bloc) {
        setSelectedBlocId(bloc.id)
        const immeublesList = getImmeublesByBloc(bloc.id)
        setAvailableImmeubles(immeublesList)
        const immeuble = immeublesList.find((i) => i.nom === copro.immeuble)
        setSelectedImmeubleId(immeuble ? immeuble.id : "")
      } else {
        setSelectedBlocId("")
        setAvailableImmeubles([])
        setSelectedImmeubleId("")
      }

      const appartOptions = coproprietaires
        .filter((c) => c.bloque === copro.bloque && c.immeuble === copro.immeuble)
        .map((c) => ({
          coproprietaireId: c.id,
          numeroAppartement: c.numeroAppartement,
          label: `Apt ${c.numeroAppartement} - ${c.prenom} ${c.nom}`,
        }))
      setAvailableAppartements(appartOptions)
    },
    [blocs, coproprietaires, getImmeublesByBloc],
  )

  const normalizeDate = (value: string) => {
    if (!value) {
      return new Date().toISOString().split("T")[0]
    }
    return value.includes("T") ? value.split("T")[0] : value
  }

  useEffect(() => {
    if (paiement) {
      setFormData({
        coproprietaireId: paiement.coproprietaireId,
        coproprietaireNom: paiement.coproprietaireNom,
        montant: paiement.montant.toString(),
        annee: paiement.annee,
        datePaiement: normalizeDate(paiement.datePaiement),
        methodePaiement: paiement.methodePaiement,
        statut: paiement.statut,
        numeroCheque: paiement.numeroCheque || "",
        numeroVirement: paiement.numeroVirement || "",
        notes: paiement.notes || "",
      })
      setStatusTouched(true)
      configureFromCopro(paiement.coproprietaireId)
    } else {
      const today = new Date().toISOString().split("T")[0]
      setFormData({
        coproprietaireId: coproprietaireId || "",
        coproprietaireNom: "",
        montant: "",
        annee: new Date().getFullYear().toString(),
        datePaiement: today,
        methodePaiement: "especes",
        statut: "impaye",
        numeroCheque: "",
        numeroVirement: "",
        notes: "",
      })
      setSelectedBlocId("")
      setSelectedImmeubleId("")
      setAvailableImmeubles([])
      setAvailableAppartements([])
      setSelectedCoproprietaire(null)
      setStatusTouched(false)
      if (coproprietaireId) {
        configureFromCopro(coproprietaireId)
      }
    }
    setErrors({})
  }, [paiement, coproprietaireId, configureFromCopro])

  const handleBlocChange = (blocId: string) => {
    setSelectedBlocId(blocId)
    setSelectedImmeubleId("")
    setAvailableImmeubles(blocId ? getImmeublesByBloc(blocId) : [])
    setAvailableAppartements([])
    setFormData((prev) => ({ ...prev, coproprietaireId: "", coproprietaireNom: "" }))
    setSelectedCoproprietaire(null)
    clearError("bloc")
    clearError("coproprietaireId")
  }

  const handleImmeubleChange = (immeubleId: string) => {
    setSelectedImmeubleId(immeubleId)
    clearError("immeuble")
    clearError("coproprietaireId")
    setFormData((prev) => ({ ...prev, coproprietaireId: "", coproprietaireNom: "" }))
    setSelectedCoproprietaire(null)

    if (!immeubleId) {
      setAvailableAppartements([])
      return
    }

    const blocNom = blocs.find((b) => b.id === selectedBlocId)?.nom
    const immeuble = availableImmeubles.find((i) => i.id === immeubleId)
    if (!blocNom || !immeuble) {
      setAvailableAppartements([])
      return
    }

    const appartOptions = coproprietaires
      .filter((c) => c.bloque === blocNom && c.immeuble === immeuble.nom)
      .map((c) => ({
        coproprietaireId: c.id,
        numeroAppartement: c.numeroAppartement,
        label: `Apt ${c.numeroAppartement} - ${c.prenom} ${c.nom}`,
      }))
    setAvailableAppartements(appartOptions)
  }

  const handleAppartementChange = (coproId: string) => {
    clearError("coproprietaireId")
    if (!coproId) {
      setFormData((prev) => ({ ...prev, coproprietaireId: "", coproprietaireNom: "" }))
      setSelectedCoproprietaire(null)
      return
    }

    const copro = coproprietaires.find((c) => c.id === coproId) || null
    setFormData((prev) => ({
      ...prev,
      coproprietaireId: coproId,
      coproprietaireNom: copro ? `${copro.prenom} ${copro.nom}` : "",
    }))
    setSelectedCoproprietaire(copro)
  }

  const handleStatusChange = (value: "paye" | "impaye" | "partiel") => {
    setStatusTouched(true)
    clearError("statut")
    setFormData((prev) => ({ ...prev, statut: value }))
  }

  const handleApplySuggestedStatus = () => {
    setStatusTouched(false)
    setFormData((prev) => ({ ...prev, statut: recommendedStatus }))
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    if (field === "montant") {
      clearError("montant")
      setFormData((prev) => ({
        ...prev,
        montant: value,
        statut: statusTouched ? prev.statut : computeStatusFromMontant(value),
      }) as typeof prev)
      return
    }

    if (field === "methodePaiement") {
      clearError("methodePaiement")
    }
    if (field === "datePaiement") {
      clearError("datePaiement")
    }
    if (field === "annee") {
      clearError("annee")
    }

    setFormData((prev) => ({ ...prev, [field]: value } as typeof prev))
  }

  const getStatusColor = () => {
    switch (formData.statut) {
      case "paye":
        return "text-emerald-600 bg-emerald-50 border-emerald-200"
      case "partiel":
        return "text-orange-600 bg-orange-50 border-orange-200"
      default:
        return "text-red-600 bg-red-50 border-red-200"
    }
  }

  const getStatusIcon = () => {
    switch (formData.statut) {
      case "paye":
        return <CheckCircle className="h-4 w-4" />
      case "partiel":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <X className="h-4 w-4" />
    }
  }

  const getStatusText = (status: "paye" | "impaye" | "partiel") => {
    switch (status) {
      case "paye":
        return "Paiement réglé"
      case "partiel":
        return "Paiement en cours"
      default:
        return "Paiement en retard"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.coproprietaireId) {
      newErrors.coproprietaireId = "Le copropriétaire est obligatoire"
    }
    if (!selectedBlocId && !formData.coproprietaireId) {
      newErrors.bloc = "Le bloc est obligatoire"
    }
    if (!selectedImmeubleId && !formData.coproprietaireId) {
      newErrors.immeuble = "L'immeuble est obligatoire"
    }
    if (!formData.montant) {
      newErrors.montant = "Le montant est obligatoire"
    }
    if (!formData.annee) {
      newErrors.annee = "L'année est obligatoire"
    }
    if (!formData.datePaiement) {
      newErrors.datePaiement = "La date de paiement est obligatoire"
    }
    if (!formData.methodePaiement) {
      newErrors.methodePaiement = "La méthode de paiement est obligatoire"
    }

    const montantNum = Number.parseFloat(formData.montant)
    if (!Number.isFinite(montantNum) || montantNum <= 0) {
      newErrors.montant = "Le montant doit être supérieur à 0"
    }

    if (formData.methodePaiement === "cheque" && !formData.numeroCheque.trim()) {
      newErrors.numeroCheque = "Le numéro de chèque est requis"
    }

    if (formData.methodePaiement === "virement" && !formData.numeroVirement.trim()) {
      newErrors.numeroVirement = "La référence de virement est requise"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const copro = selectedCoproprietaire || coproprietaires.find((c) => c.id === formData.coproprietaireId)
    if (!copro) {
      setErrors({ coproprietaireId: "Sélection de copropriétaire invalide" })
      return
    }

    setIsSubmitting(true)
    try {
      const isoDate = new Date(formData.datePaiement).toISOString()
      const montantRestant = Math.max(0, COTISATION_ANNUELLE - montantNum)

      const paiementData = {
        coproprietaireId: formData.coproprietaireId,
        coproprietaireNom: `${copro.prenom} ${copro.nom}`,
        montant: montantNum,
        annee: formData.annee,
        datePaiement: isoDate,
        methodePaiement: formData.methodePaiement,
        numeroCheque: formData.numeroCheque || undefined,
        numeroVirement: formData.numeroVirement || undefined,
        notes: formData.notes || undefined,
        montantDu: COTISATION_ANNUELLE,
        montantRestant,
        statut: formData.statut,
      }

      if (paiement) {
        updatePaiement(paiement.id, paiementData)
      } else {
        addPaiement(paiementData)
        router.push("/blocs-immeubles")
      }

      onSuccess()
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
  <Card variant="premium" className="w-full max-w-3xl mx-auto">
      <CardHeader className="text-center border-b border-slate-100 dark:border-slate-800">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <CreditCard className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-800 dark:from-white dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
          {paiement ? "Modifier le paiement" : "Nouveau paiement"}
        </CardTitle>
      
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {formData.montant && (
            <div className={`p-4 rounded-xl border-2 ${getStatusColor()} transition-all duration-300`}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon()}
                  <div>
                    <p className="font-semibold">{getStatusText(formData.statut)}</p>
                    <p className="text-sm opacity-75">
                      Montant: {formData.montant || "0"} DH / {COTISATION_ANNUELLE} DH
                      {recommendedStatus !== formData.statut && (
                        <span className="ml-2">
                          Suggestion: {getStatusText(recommendedStatus)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {recommendedStatus !== formData.statut && (
                  <Button type="button" variant="link" size="sm" onClick={handleApplySuggestedStatus}>
                    Appliquer la suggestion
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Bloc <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedBlocId} onValueChange={handleBlocChange}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Sélectionnez un bloc" />
                </SelectTrigger>
                <SelectContent>
                  {blocs.map((bloc) => (
                    <SelectItem key={bloc.id} value={bloc.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {bloc.nom}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bloc && <p className="text-sm text-red-600 dark:text-red-400">{errors.bloc}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Immeuble <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedImmeubleId} onValueChange={handleImmeubleChange} disabled={!selectedBlocId}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Sélectionnez un immeuble" />
                </SelectTrigger>
                <SelectContent>
                  {availableImmeubles.map((immeuble) => (
                    <SelectItem key={immeuble.id} value={immeuble.id}>
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        {immeuble.nom}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.immeuble && <p className="text-sm text-red-600 dark:text-red-400">{errors.immeuble}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Appartement <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.coproprietaireId}
                onValueChange={handleAppartementChange}
                disabled={!availableAppartements.length}
              >
                <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Sélectionnez un appartement" />
                </SelectTrigger>
                <SelectContent>
                  {availableAppartements.map((option) => (
                    <SelectItem key={option.coproprietaireId} value={option.coproprietaireId}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.coproprietaireId && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.coproprietaireId}</p>
              )}
            </div>
          </div>

          {selectedCoproprietaire && (
            <Card variant="glass" className="border border-blue-200/40 dark:border-blue-800/40">
              <CardContent className="pt-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold flex items-center justify-center">
                      {selectedCoproprietaire.prenom.charAt(0)}
                      {selectedCoproprietaire.nom.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {selectedCoproprietaire.prenom} {selectedCoproprietaire.nom}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {selectedCoproprietaire.bloque} • {selectedCoproprietaire.immeuble} • Apt {selectedCoproprietaire.numeroAppartement}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {selectedCoproprietaire.telephone}
                    </span>
                    {selectedCoproprietaire.titreFoncier && (
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Titre foncier: {selectedCoproprietaire.titreFoncier}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              variant="modern"
              size="lg"
              label="Année de cotisation"
              leftIcon={<Calendar className="h-4 w-4" />}
              type="number"
              min="2000"
              max="2100"
              value={formData.annee}
              onChange={(e) => handleInputChange("annee", e.target.value)}
              placeholder="2024"
              required
              error={errors.annee}
            />

            <Input
              variant="modern"
              size="lg"
              label="Montant du paiement (DH)"
              leftIcon={<Euro className="h-4 w-4" />}
              type="number"
              step="0.01"
              min="0"
              value={formData.montant}
              onChange={(e) => handleInputChange("montant", e.target.value)}
              placeholder={`${COTISATION_ANNUELLE}.00`}
              required
              error={errors.montant}
            />

            <Input
              variant="modern"
              size="lg"
              label="Date de paiement"
              leftIcon={<Calendar className="h-4 w-4" />}
              type="date"
              value={formData.datePaiement}
              onChange={(e) => handleInputChange("datePaiement", e.target.value)}
              required
              error={errors.datePaiement}
            />

            <div className="text-xs text-slate-500 mt-6">
              Montant annuel attendu: {COTISATION_ANNUELLE.toLocaleString("fr-FR")} DH
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Statut du paiement
              </Label>
              <Select value={formData.statut} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paye">Payé</SelectItem>
                  <SelectItem value="partiel">En cours</SelectItem>
                  <SelectItem value="impaye">En retard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Méthode de paiement <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.methodePaiement}
                onValueChange={(value) => handleInputChange("methodePaiement", value)}
              >
                <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Sélectionnez la méthode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="especes">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      Espèces
                    </div>
                  </SelectItem>
                  <SelectItem value="virement">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Virement bancaire
                    </div>
                  </SelectItem>
                  <SelectItem value="cheque">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Chèque
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.methodePaiement && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.methodePaiement}</p>
              )}
            </div>
          </div>

          {formData.methodePaiement === "cheque" && (
            <Input
              variant="glass"
              size="lg"
              label="Numéro de chèque"
              leftIcon={<Receipt className="h-4 w-4" />}
              value={formData.numeroCheque}
              onChange={(e) => handleInputChange("numeroCheque", e.target.value)}
              placeholder="Numéro du chèque"
              required
              error={errors.numeroCheque}
            />
          )}

          {formData.methodePaiement === "virement" && (
            <Input
              variant="glass"
              size="lg"
              label="Référence du virement"
              leftIcon={<Building className="h-4 w-4" />}
              value={formData.numeroVirement}
              onChange={(e) => handleInputChange("numeroVirement", e.target.value)}
              placeholder="Référence du virement"
              required
              error={errors.numeroVirement}
            />
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Notes (optionnel)
            </Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Commentaires ou précisions..."
              className="min-h-[80px] rounded-xl border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500"
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
              {isSubmitting ? "Enregistrement..." : paiement ? "Modifier" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
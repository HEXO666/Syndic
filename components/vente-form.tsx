"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button-enhanced"
import { Input, Textarea } from "@/components/ui/input-enhanced"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card-enhanced"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useData, type Vente, type Coproprietaire, type Immeuble } from "@/lib/data-context"
import { Building2, Calendar, FileText, Home, MapPin, NotebookPen, User, UserCheck, Users, X } from "lucide-react"

interface VenteFormProps {
  vente?: Vente | null
  onSubmit: (vente: Omit<Vente, "id" | "dateCreation">) => Promise<void> | void
  onCancel?: () => void
}

interface VenteFormState {
  vendeurId: string
  vendeurNom: string
  vendeurContact: string
  acheteurNom: string
  acheteurContact: string
  acheteurEmail: string
  blocId: string
  blocNom: string
  immeubleId: string
  immeubleNom: string
  numeroAppartement: string
  dateVente: string
  dateQuitus: string
  notes: string
}

const defaultState: VenteFormState = {
  vendeurId: "",
  vendeurNom: "",
  vendeurContact: "",
  acheteurNom: "",
  acheteurContact: "",
  acheteurEmail: "",
  blocId: "",
  blocNom: "",
  immeubleId: "",
  immeubleNom: "",
  numeroAppartement: "",
  dateVente: "",
  dateQuitus: "",
  notes: "",
}

const formatDateForInput = (value?: string) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}

export function VenteForm({ vente, onSubmit, onCancel }: VenteFormProps) {
  const { coproprietaires, blocs, getImmeublesByBloc, immeubles } = useData()
  const [formData, setFormData] = useState<VenteFormState>(() => {
    if (!vente) return defaultState

    const blocIdFromNom = blocs.find((bloc) => bloc.nom === vente.blocNom)?.id ?? vente.blocId
    const immeubleIdFromNom = immeubles.find((im) => im.nom === vente.immeubleNom)?.id ?? vente.immeubleId

    return {
      vendeurId: vente.vendeurId,
      vendeurNom: vente.vendeurNom,
      vendeurContact: vente.vendeurContact ?? "",
      acheteurNom: vente.acheteurNom,
      acheteurContact: vente.acheteurContact ?? "",
      acheteurEmail: vente.acheteurEmail ?? "",
      blocId: blocIdFromNom ?? "",
      blocNom: vente.blocNom,
      immeubleId: immeubleIdFromNom ?? "",
      immeubleNom: vente.immeubleNom,
      numeroAppartement: vente.numeroAppartement,
      dateVente: formatDateForInput(vente.dateVente),
      dateQuitus: formatDateForInput(vente.dateQuitus),
      notes: vente.notes ?? "",
    }
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const immeublesOptions = useMemo(() => {
    if (!formData.blocId) return [] as Immeuble[]
    return getImmeublesByBloc(formData.blocId)
  }, [formData.blocId, getImmeublesByBloc])

  useEffect(() => {
    if (!vente) return
    if (formData.blocId && !formData.immeubleId) {
      const immeubleMatch = immeublesOptions.find((im) => im.nom === vente.immeubleNom)
      if (immeubleMatch) {
        setFormData((prev) => ({ ...prev, immeubleId: immeubleMatch.id }))
      }
    }
  }, [vente, formData.blocId, formData.immeubleId, immeublesOptions])

  const handleVendorChange = (value: string) => {
    const selected = coproprietaires.find((copro) => copro.id === value)
    if (!selected) {
      setFormData((prev) => ({
        ...prev,
        vendeurId: value,
        vendeurNom: "",
        vendeurContact: "",
      }))
      return
    }

    const blocMatch = blocs.find((bloc) => bloc.nom === selected.bloque)
    const blocId = blocMatch?.id ?? ""
    const blocNom = blocMatch?.nom ?? selected.bloque
    const immeubleList = blocId ? getImmeublesByBloc(blocId) : []
    const immeubleMatch = immeubleList.find((im) => im.nom === selected.immeuble)

    setFormData((prev) => ({
      ...prev,
      vendeurId: selected.id,
      vendeurNom: `${selected.prenom} ${selected.nom}`.trim(),
      vendeurContact: selected.telephone ?? "",
      blocId,
      blocNom: blocNom ?? "",
      immeubleId: immeubleMatch?.id ?? "",
      immeubleNom: immeubleMatch?.nom ?? selected.immeuble,
      numeroAppartement: selected.numeroAppartement ?? prev.numeroAppartement,
    }))
  }

  const handleBlocChange = (value: string) => {
    const bloc = blocs.find((b) => b.id === value)
    setFormData((prev) => ({
      ...prev,
      blocId: value,
      blocNom: bloc?.nom ?? "",
      immeubleId: "",
      immeubleNom: "",
    }))
  }

  const handleImmeubleChange = (value: string) => {
    const immeuble = immeublesOptions.find((im) => im.id === value)
    setFormData((prev) => ({
      ...prev,
      immeubleId: value,
      immeubleNom: immeuble?.nom ?? "",
    }))
  }

  const updateField = (field: keyof VenteFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validateForm = () => {
    const validationErrors: Record<string, string> = {}

    if (!formData.vendeurId) validationErrors.vendeurId = "Sélectionnez un vendeur"
    if (!formData.acheteurNom.trim()) validationErrors.acheteurNom = "Le nom de l'acheteur est requis"
    if (!formData.blocId || !formData.blocNom) validationErrors.blocId = "Sélectionnez un bloc"
    if (!formData.immeubleId || !formData.immeubleNom) validationErrors.immeubleId = "Sélectionnez un immeuble"
    if (!formData.numeroAppartement.trim()) validationErrors.numeroAppartement = "Numéro d'appartement requis"
    if (!formData.dateQuitus) validationErrors.dateQuitus = "La date de quitus est requise"

    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        ...formData,
        dateVente: formData.dateVente || new Date().toISOString(),
        dateQuitus: formData.dateQuitus,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedVendor: Coproprietaire | undefined = useMemo(
    () => coproprietaires.find((copro) => copro.id === formData.vendeurId),
    [coproprietaires, formData.vendeurId]
  )

  return (
    <Card variant="premium" className="w-full max-w-3xl mx-auto">
      <CardHeader className="text-center border-b border-slate-100 dark:border-slate-800">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <UserCheck className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl bg-gradient-to-r from-slate-800 via-purple-700 to-amber-700 dark:from-white dark:via-purple-300 dark:to-amber-300 bg-clip-text text-transparent">
          {vente ? "Modifier la vente" : "Nouvelle vente"}
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          Renseignez les détails du transfert de propriété et la date du quitus.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        {selectedVendor && (
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-blue-200/60 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-900/20">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
              Vendeur sélectionné
            </Badge>
            <div className="text-sm text-slate-700 dark:text-slate-300">
              <p className="font-semibold">{`${selectedVendor.prenom} ${selectedVendor.nom}`}</p>
              <p>{selectedVendor.bloque} · {selectedVendor.immeuble} · Apt {selectedVendor.numeroAppartement}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Vendeur <span className="text-red-500">*</span>
            </label>
            <Select value={formData.vendeurId} onValueChange={handleVendorChange}>
              <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Sélectionnez un copropriétaire" />
              </SelectTrigger>
              <SelectContent>
                {coproprietaires.length === 0 && (
                  <div className="px-3 py-2 text-sm text-slate-500">
                    Aucun copropriétaire disponible
                  </div>
                )}
                {coproprietaires.map((copro) => (
                  <SelectItem key={copro.id} value={copro.id}>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">
                        {copro.prenom} {copro.nom}
                      </span>
                      <span className="text-xs text-slate-500">
                        {copro.bloque} · {copro.immeuble} · Apt {copro.numeroAppartement}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.vendeurId && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.vendeurId}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nom complet de l'acheteur"
              placeholder="Nom et prénom"
              variant="modern"
              size="lg"
              value={formData.acheteurNom}
              onChange={(event) => updateField("acheteurNom", event.target.value)}
              required
              error={errors.acheteurNom}
              leftIcon={<User className="h-4 w-4" />}
            />
            <Input
              label="Contact de l'acheteur"
              placeholder="Téléphone ou mobile"
              variant="modern"
              size="lg"
              value={formData.acheteurContact}
              onChange={(event) => updateField("acheteurContact", event.target.value)}
              leftIcon={<Users className="h-4 w-4" />}
            />
          </div>

          <Input
            label="Email de l'acheteur (optionnel)"
            placeholder="acheteur@email.com"
            type="email"
            variant="modern"
            size="lg"
            value={formData.acheteurEmail}
            onChange={(event) => updateField("acheteurEmail", event.target.value)}
            leftIcon={<NotebookPen className="h-4 w-4" />}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Bloc <span className="text-red-500">*</span>
              </label>
              <Select value={formData.blocId} onValueChange={handleBlocChange}>
                <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Choisissez un bloc" />
                </SelectTrigger>
                <SelectContent>
                  {blocs.length === 0 && (
                    <div className="px-3 py-2 text-sm text-slate-500">
                      Aucun bloc enregistré
                    </div>
                  )}
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
              {errors.blocId && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.blocId}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Immeuble <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.immeubleId}
                onValueChange={handleImmeubleChange}
                disabled={!formData.blocId}
              >
                <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder={formData.blocId ? "Choisissez un immeuble" : "Sélectionnez un bloc d'abord"} />
                </SelectTrigger>
                <SelectContent>
                  {immeublesOptions.length === 0 && (
                    <div className="px-3 py-2 text-sm text-slate-500">
                      Aucun immeuble disponible
                    </div>
                  )}
                  {immeublesOptions.map((immeuble) => (
                    <SelectItem key={immeuble.id} value={immeuble.id}>
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        {immeuble.nom}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.immeubleId && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.immeubleId}</p>
              )}
            </div>

            <Input
              label="Numéro d'appartement"
              placeholder="Ex: B12"
              variant="modern"
              size="lg"
              value={formData.numeroAppartement}
              onChange={(event) => updateField("numeroAppartement", event.target.value)}
              required
              error={errors.numeroAppartement}
              leftIcon={<MapPin className="h-4 w-4" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Date de vente"
              type="date"
              variant="modern"
              size="lg"
              value={formData.dateVente}
              onChange={(event) => updateField("dateVente", event.target.value)}
              leftIcon={<Calendar className="h-4 w-4" />}
            />
            <Input
              label="Date de quitus"
              type="date"
              variant="modern"
              size="lg"
              value={formData.dateQuitus}
              onChange={(event) => updateField("dateQuitus", event.target.value)}
              required
              error={errors.dateQuitus}
              leftIcon={<FileText className="h-4 w-4" />}
            />
          </div>

          <Textarea
            label="Notes complémentaires"
            placeholder="Informations supplémentaires sur la vente, clauses particulières, etc."
            value={formData.notes}
            onChange={(event) => updateField("notes", event.target.value)}
          />

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
              leftIcon={<UserCheck className="h-4 w-4" />}
            >
              {vente ? "Mettre à jour" : "Enregistrer la vente"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

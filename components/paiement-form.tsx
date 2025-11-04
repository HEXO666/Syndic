"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData, type Paiement } from "@/lib/data-context"

interface PaiementFormProps {
  paiement?: Paiement | null
  onSuccess: () => void
}

export function PaiementForm({ paiement, onSuccess }: PaiementFormProps) {
  const { addPaiement, updatePaiement, coproprietaires } = useData()
  const [formData, setFormData] = useState({
    coproprietaireId: "",
    coproprietaireNom: "",
    montant: "",
    typePaiement: "charges_mensuelles" as const,
    moisConcerne: "",
    datePaiement: "",
    dateEcheance: "",
    statut: "en_attente" as const,
    methodePaiement: "virement" as const,
    numeroCheque: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (paiement) {
      setFormData({
        coproprietaireId: paiement.coproprietaireId,
        coproprietaireNom: paiement.coproprietaireNom,
        montant: paiement.montant.toString(),
        typePaiement: paiement.typePaiement,
        moisConcerne: paiement.moisConcerne,
        datePaiement: paiement.datePaiement.split("T")[0],
        dateEcheance: paiement.dateEcheance.split("T")[0],
        statut: paiement.statut,
        methodePaiement: paiement.methodePaiement,
        numeroCheque: paiement.numeroCheque || "",
        notes: paiement.notes || "",
      })
    } else {
      // Set default dates
      const today = new Date().toISOString().split("T")[0]
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      const echeance = nextMonth.toISOString().split("T")[0]

      setFormData((prev) => ({
        ...prev,
        datePaiement: today,
        dateEcheance: echeance,
        moisConcerne: new Date().toISOString().slice(0, 7), // YYYY-MM format
      }))
    }
  }, [paiement])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const paiementData = {
        ...formData,
        montant: Number.parseFloat(formData.montant),
        datePaiement: new Date(formData.datePaiement).toISOString(),
        dateEcheance: new Date(formData.dateEcheance).toISOString(),
        numeroCheque: formData.numeroCheque || undefined,
        notes: formData.notes || undefined,
      }

      if (paiement) {
        updatePaiement(paiement.id, paiementData)
      } else {
        addPaiement(paiementData)
      }

      setFormData({
        coproprietaireId: "",
        coproprietaireNom: "",
        montant: "",
        typePaiement: "charges_mensuelles",
        moisConcerne: "",
        datePaiement: "",
        dateEcheance: "",
        statut: "en_attente",
        methodePaiement: "virement",
        numeroCheque: "",
        notes: "",
      })
      onSuccess()
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleCoproprietaireChange = (coproprietaireId: string) => {
    const coproprietaire = coproprietaires.find((c) => c.id === coproprietaireId)
    if (coproprietaire) {
      setFormData({
        ...formData,
        coproprietaireId,
        coproprietaireNom: `${coproprietaire.prenom} ${coproprietaire.nom}`,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="coproprietaire">Copropriétaire *</Label>
          <Select value={formData.coproprietaireId} onValueChange={handleCoproprietaireChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un copropriétaire" />
            </SelectTrigger>
            <SelectContent>
              {coproprietaires.map((coproprietaire) => (
                <SelectItem key={coproprietaire.id} value={coproprietaire.id}>
                  {coproprietaire.prenom} {coproprietaire.nom} - Apt {coproprietaire.numeroAppartement}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="montant">Montant (€) *</Label>
          <Input
            id="montant"
            type="number"
            step="0.01"
            value={formData.montant}
            onChange={(e) => handleInputChange("montant", e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="typePaiement">Type de paiement *</Label>
          <Select value={formData.typePaiement} onValueChange={(value) => handleInputChange("typePaiement", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="charges_mensuelles">Charges mensuelles</SelectItem>
              <SelectItem value="travaux">Travaux</SelectItem>
              <SelectItem value="reparations">Réparations</SelectItem>
              <SelectItem value="autres">Autres</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="moisConcerne">Mois concerné *</Label>
          <Input
            id="moisConcerne"
            type="month"
            value={formData.moisConcerne}
            onChange={(e) => handleInputChange("moisConcerne", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="datePaiement">Date de paiement *</Label>
          <Input
            id="datePaiement"
            type="date"
            value={formData.datePaiement}
            onChange={(e) => handleInputChange("datePaiement", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateEcheance">Date d'échéance *</Label>
          <Input
            id="dateEcheance"
            type="date"
            value={formData.dateEcheance}
            onChange={(e) => handleInputChange("dateEcheance", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="statut">Statut *</Label>
          <Select value={formData.statut} onValueChange={(value) => handleInputChange("statut", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paye">Payé</SelectItem>
              <SelectItem value="en_attente">En attente</SelectItem>
              <SelectItem value="en_retard">En retard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="methodePaiement">Méthode de paiement *</Label>
          <Select
            value={formData.methodePaiement}
            onValueChange={(value) => handleInputChange("methodePaiement", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="especes">Espèces</SelectItem>
              <SelectItem value="cheque">Chèque</SelectItem>
              <SelectItem value="virement">Virement</SelectItem>
              <SelectItem value="carte">Carte bancaire</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.methodePaiement === "cheque" && (
        <div className="space-y-2">
          <Label htmlFor="numeroCheque">Numéro de chèque</Label>
          <Input
            id="numeroCheque"
            value={formData.numeroCheque}
            onChange={(e) => handleInputChange("numeroCheque", e.target.value)}
            placeholder="Numéro du chèque"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          placeholder="Notes additionnelles..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : paiement ? "Modifier" : "Enregistrer"}
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Annuler
        </Button>
      </div>
    </form>
  )
}

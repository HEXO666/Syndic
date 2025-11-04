"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData, type Coproprietaire } from "@/lib/data-context"

interface CoproprietaireFormProps {
  coproprietaire?: Coproprietaire | null
  onSuccess: () => void
}

export function CoproprietaireForm({ coproprietaire, onSuccess }: CoproprietaireFormProps) {
  const { addCoproprietaire, updateCoproprietaire, blocs, getImmeublesByBloc } = useData()
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    adresse: "",
    cin: "",
    telephone: "",
    bloque: "",
    immeuble: "",
    numeroAppartement: "",
    numeroTitreFoncier: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableImmeubles, setAvailableImmeubles] = useState<any[]>([])

  useEffect(() => {
    if (coproprietaire) {
      setFormData({
        nom: coproprietaire.nom,
        prenom: coproprietaire.prenom,
        adresse: coproprietaire.adresse,
        cin: coproprietaire.cin || "",
        telephone: coproprietaire.telephone || "",
        bloque: coproprietaire.bloque,
        immeuble: coproprietaire.immeuble,
        numeroAppartement: coproprietaire.numeroAppartement,
        numeroTitreFoncier: coproprietaire.numeroTitreFoncier || "",
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
    setFormData({ ...formData, bloque: blocNom, immeuble: "" }) // Reset immeuble quand bloc change
    const blocSelectionne = blocs.find((b) => b.nom === blocNom)
    if (blocSelectionne) {
      setAvailableImmeubles(getImmeublesByBloc(blocSelectionne.id))
    } else {
      setAvailableImmeubles([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (coproprietaire) {
        updateCoproprietaire(coproprietaire.id, formData)
      } else {
        addCoproprietaire(formData)
      }

      setFormData({
        nom: "",
        prenom: "",
        adresse: "",
        cin: "",
        telephone: "",
        bloque: "",
        immeuble: "",
        numeroAppartement: "",
        numeroTitreFoncier: "",
      })
      setAvailableImmeubles([])
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

  const numeroAppartements = Array.from({ length: 20 }, (_, i) => (i + 1).toString())

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prenom">Prénom *</Label>
          <Input
            id="prenom"
            value={formData.prenom}
            onChange={(e) => handleInputChange("prenom", e.target.value)}
            placeholder="Prénom du copropriétaire"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            value={formData.nom}
            onChange={(e) => handleInputChange("nom", e.target.value)}
            placeholder="Nom du copropriétaire"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cin">CIN *</Label>
          <Input
            id="cin"
            value={formData.cin}
            onChange={(e) => handleInputChange("cin", e.target.value)}
            placeholder="Numéro CIN"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telephone">Téléphone *</Label>
          <Input
            id="telephone"
            type="tel"
            value={formData.telephone}
            onChange={(e) => handleInputChange("telephone", e.target.value)}
            placeholder="Numéro de téléphone"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="adresse">Adresse *</Label>
        <Textarea
          id="adresse"
          value={formData.adresse}
          onChange={(e) => handleInputChange("adresse", e.target.value)}
          placeholder="Adresse complète"
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="numeroTitreFoncier">Numéro Titre Foncier *</Label>
        <Input
          id="numeroTitreFoncier"
          value={formData.numeroTitreFoncier}
          onChange={(e) => handleInputChange("numeroTitreFoncier", e.target.value)}
          placeholder="Numéro du titre foncier"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bloque">Bloque *</Label>
          <Select value={formData.bloque} onValueChange={handleBlocChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un bloc" />
            </SelectTrigger>
            <SelectContent>
              {blocs.map((bloc) => (
                <SelectItem key={bloc.id} value={bloc.nom}>
                  {bloc.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="immeuble">Immeuble *</Label>
          <Select
            value={formData.immeuble}
            onValueChange={(value) => handleInputChange("immeuble", value)}
            disabled={!formData.bloque}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un immeuble" />
            </SelectTrigger>
            <SelectContent>
              {availableImmeubles.map((immeuble) => (
                <SelectItem key={immeuble.id} value={immeuble.nom}>
                  {immeuble.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="numeroAppartement">N° Appartement *</Label>
          <Select
            value={formData.numeroAppartement}
            onValueChange={(value) => handleInputChange("numeroAppartement", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un numéro" />
            </SelectTrigger>
            <SelectContent>
              {numeroAppartements.map((numero) => (
                <SelectItem key={numero} value={numero}>
                  {numero}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : coproprietaire ? "Modifier" : "Ajouter"}
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Annuler
        </Button>
      </div>
    </form>
  )
}

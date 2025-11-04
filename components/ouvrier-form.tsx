"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData, type Ouvrier } from "@/lib/data-context"
import { useAuth } from "@/lib/auth-context"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface OuvrierFormProps {
  ouvrier?: Ouvrier | null
  onSuccess: () => void
}

export function OuvrierForm({ ouvrier, onSuccess }: OuvrierFormProps) {
  const { user } = useAuth()
  const { addOuvrier, updateOuvrier, professions, addProfession } = useData()
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    cin: "",
    adresse: "",
    profession: "",
  })
  const [newProfession, setNewProfession] = useState("")
  const [isProfessionDialogOpen, setIsProfessionDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (ouvrier) {
      setFormData({
        nom: ouvrier.nom,
        prenom: ouvrier.prenom,
        cin: ouvrier.cin,
        adresse: ouvrier.adresse,
        profession: ouvrier.profession,
      })
    }
  }, [ouvrier])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (ouvrier) {
        updateOuvrier(ouvrier.id, formData)
      } else {
        addOuvrier(formData)
      }

      setFormData({
        nom: "",
        prenom: "",
        cin: "",
        adresse: "",
        profession: "",
      })
      onSuccess()
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddProfession = () => {
    if (newProfession.trim()) {
      addProfession(newProfession.trim())
      setFormData({ ...formData, profession: newProfession.trim() })
      setNewProfession("")
      setIsProfessionDialogOpen(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prenom">Prénom *</Label>
          <Input
            id="prenom"
            value={formData.prenom}
            onChange={(e) => handleInputChange("prenom", e.target.value)}
            placeholder="Prénom de l'ouvrier"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            value={formData.nom}
            onChange={(e) => handleInputChange("nom", e.target.value)}
            placeholder="Nom de l'ouvrier"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cin">CIN *</Label>
        <Input
          id="cin"
          value={formData.cin}
          onChange={(e) => handleInputChange("cin", e.target.value)}
          placeholder="Numéro de carte d'identité"
          required
        />
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
        <div className="flex items-center justify-between">
          <Label htmlFor="profession">Profession *</Label>
          {user?.role === "admin" && (
            <Dialog open={isProfessionDialogOpen} onOpenChange={setIsProfessionDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Nouvelle profession
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une profession</DialogTitle>
                  <DialogDescription>
                    Ajoutez une nouvelle profession à la liste des options disponibles.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newProfession">Nom de la profession</Label>
                    <Input
                      id="newProfession"
                      value={newProfession}
                      onChange={(e) => setNewProfession(e.target.value)}
                      placeholder="Ex: Électricien, Plombier..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={handleAddProfession} disabled={!newProfession.trim()}>
                      Ajouter
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setNewProfession("")
                        setIsProfessionDialogOpen(false)
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <Select value={formData.profession} onValueChange={(value) => handleInputChange("profession", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez une profession" />
          </SelectTrigger>
          <SelectContent>
            {professions.map((profession) => (
              <SelectItem key={profession} value={profession}>
                {profession}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : ouvrier ? "Modifier" : "Ajouter"}
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Annuler
        </Button>
      </div>
    </form>
  )
}

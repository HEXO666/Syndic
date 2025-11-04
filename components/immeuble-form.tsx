"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useData, type Immeuble } from "@/lib/data-context"

interface ImmeubleFormProps {
  immeuble?: Immeuble | null
  selectedBlocId?: string
  onClose: () => void
}

export function ImmeubleForm({ immeuble, selectedBlocId, onClose }: ImmeubleFormProps) {
  const { blocs, addImmeuble, updateImmeuble } = useData()
  const [formData, setFormData] = useState({
    nom: "",
    bloqueId: selectedBlocId || "",
    description: "",
  })

  useEffect(() => {
    if (immeuble) {
      setFormData({
        nom: immeuble.nom,
        bloqueId: immeuble.bloqueId,
        description: immeuble.description || "",
      })
    } else if (selectedBlocId) {
      setFormData((prev) => ({ ...prev, bloqueId: selectedBlocId }))
    }
  }, [immeuble, selectedBlocId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nom.trim()) {
      alert("Le nom de l'immeuble est requis")
      return
    }

    if (!formData.bloqueId) {
      alert("Veuillez sélectionner un bloc")
      return
    }

    const selectedBloc = blocs.find((b) => b.id === formData.bloqueId)
    if (!selectedBloc) {
      alert("Bloc non trouvé")
      return
    }

    const immeubleData = {
      ...formData,
      bloqueName: selectedBloc.nom,
    }

    if (immeuble) {
      updateImmeuble(immeuble.id, immeubleData)
    } else {
      addImmeuble(immeubleData)
    }

    setFormData({ nom: "", bloqueId: "", description: "" })
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{immeuble ? "Modifier l'immeuble" : "Nouvel immeuble"}</DialogTitle>
          <DialogDescription>
            {immeuble ? "Modifiez les informations de l'immeuble." : "Ajoutez un nouvel immeuble à un bloc."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom de l'immeuble *</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Ex: Immeuble 1, Bâtiment A..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloqueId">Bloc *</Label>
            <Select value={formData.bloqueId} onValueChange={(value) => setFormData({ ...formData, bloqueId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un bloc" />
              </SelectTrigger>
              <SelectContent>
                {blocs.map((bloc) => (
                  <SelectItem key={bloc.id} value={bloc.id}>
                    {bloc.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description optionnelle de l'immeuble..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">{immeuble ? "Modifier" : "Ajouter"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

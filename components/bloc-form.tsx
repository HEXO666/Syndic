"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useData, type Bloque } from "@/lib/data-context"

interface BlocFormProps {
  bloc?: Bloque | null
  onClose: () => void
}

export function BlocForm({ bloc, onClose }: BlocFormProps) {
  const { addBloc, updateBloc } = useData()
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
  })

  useEffect(() => {
    if (bloc) {
      setFormData({
        nom: bloc.nom,
        description: bloc.description || "",
      })
    }
  }, [bloc])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nom.trim()) {
      alert("Le nom du bloc est requis")
      return
    }

    if (bloc) {
      updateBloc(bloc.id, formData)
    } else {
      addBloc(formData)
    }

    setFormData({ nom: "", description: "" })
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{bloc ? "Modifier le bloc" : "Nouveau bloc"}</DialogTitle>
          <DialogDescription>
            {bloc ? "Modifiez les informations du bloc." : "Ajoutez un nouveau bloc à votre résidence."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom du bloc *</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Ex: Bloc A, Bloc Principal..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description optionnelle du bloc..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">{bloc ? "Modifier" : "Ajouter"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

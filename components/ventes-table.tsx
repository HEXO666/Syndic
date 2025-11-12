"use client"

import { Card } from "@/components/ui/card-enhanced"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button-enhanced"
import { type Vente } from "@/lib/data-context"
import { Calendar, Edit3, FileText, Home, MapPin, Trash2, User, Users, Building2, FileCheck } from "lucide-react"

interface VentesTableProps {
  ventes: Vente[]
  onEdit?: (vente: Vente) => void
  onDelete?: (vente: Vente) => void
}

const formatDate = (value?: string) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function VentesTable({ ventes, onEdit, onDelete }: VentesTableProps) {
  if (ventes.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
          Aucune vente enregistrée
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Créez une première vente pour suivre les changements de propriétaires.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-5">
      {ventes.map((vente) => (
        <Card
          key={vente.id}
          variant="glass"
          className="p-6 border border-slate-200/60 dark:border-slate-800/50 hover:border-slate-300/60 dark:hover:border-slate-700/60 transition-all"
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <User className="h-4 w-4" />
                <span className="font-semibold">{vente.vendeurNom}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Users className="h-3.5 w-3.5" />
                <span>{vente.vendeurContact || "Contact non renseigné"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <FileText className="h-4 w-4" />
                <span className="font-semibold">{vente.acheteurNom}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Users className="h-3.5 w-3.5" />
                <span>{vente.acheteurContact || vente.acheteurEmail || "—"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Home className="h-4 w-4" />
                <span className="font-medium">
                  Appartement {vente.numeroAppartement || "—"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="h-3.5 w-3.5" />
                <span>Immeuble : {vente.immeubleNom || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Building2 className="h-3.5 w-3.5" />
                <span>Bloc : {vente.blocNom || "—"}</span>
              </div>
              {vente.notes && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {vente.notes}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(vente.dateVente)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <FileCheck className="h-4 w-4" />
                <span>Quitus : {formatDate(vente.dateQuitus)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                {vente.dateQuitus ? "Quitus enregistré" : "Quitus manquant"}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit?.(vente)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete?.(vente)}
                className="text-red-600 hover:text-red-700 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button-enhanced"
import { Card } from "@/components/ui/card-enhanced"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Phone, Briefcase } from "lucide-react"
import type { Ouvrier } from "@/lib/data-context"


interface OuvriersTableProps {
  ouvriers?: Ouvrier[]
  onEdit?: (ouvrier: Ouvrier) => void
  onDelete?: (id: string) => void
  onToggleStatus?: (id: string) => void
}

export function OuvriersTable({
  ouvriers = [],
  onEdit,
  onDelete,
  onToggleStatus,
}: OuvriersTableProps) {
  if (ouvriers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">
          Aucun ouvrier trouvé
        </p>
      </div>
    )
  }

  const getMetierColor = (metier: string) => {
    switch (metier?.toLowerCase()) {
      case "jardinier":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
      case "securite":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
      case "femme-de-menage":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-200"
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-200"
    }
  }

  return (
    <div className="grid gap-4">
      {ouvriers.map((ouvrier) => (
        <Card
          key={ouvrier.id}
          variant="glass"
          className="p-4 border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300/50 dark:hover:border-slate-600/50 transition-all"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-center">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {ouvrier.prenom} {ouvrier.nom}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {ouvrier.adresse}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Phone className="h-4 w-4 flex-shrink-0" />
              {ouvrier.telephoneMaroc}
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 flex-shrink-0 text-slate-500" />
              <Badge className={getMetierColor(ouvrier.metier)}>
                {ouvrier.metier === "femme-de-menage"
                  ? "Femme de ménage"
                  : ouvrier.metier?.charAt(0).toUpperCase() +
                    ouvrier.metier?.slice(1)}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                className={
                  ouvrier.statut === "actif"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                    : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }
              >
                {ouvrier.statut === "actif" ? "Actif" : "Inactif"}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                className={
                  ouvrier.statut === "actif"
                    ? "text-emerald-600 hover:text-emerald-700"
                    : "text-slate-500 hover:text-slate-600"
                }
                onClick={() => onToggleStatus?.(ouvrier.id)}
              >
                {ouvrier.statut === "actif" ? "Désactiver" : "Activer"}
              </Button>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit?.(ouvrier)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete?.(ouvrier.id)}
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

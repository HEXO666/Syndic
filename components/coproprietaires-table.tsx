"use client"

import { Button } from "@/components/ui/button-enhanced"
import { Card } from "@/components/ui/card-enhanced"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, MapPin, Phone } from "lucide-react"

interface CoproprietaireData {
  id: string
  nom: string
  prenom: string
  adresse: string
  telephoneMaroc: string
  numeroTitreFoncier: string
  habiteLEtranger?: boolean
  adresseEtranger?: string
}

interface CoproprietairesTableProps {
  coproprietaires?: CoproprietaireData[]
  onEdit?: (coproprietaire: CoproprietaireData) => void
  onDelete?: (id: string) => void
}

export function CoproprietairesTable({
  coproprietaires = [],
  onEdit,
  onDelete,
}: CoproprietairesTableProps) {
  if (coproprietaires.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">
          Aucun copropriétaire trouvé
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {coproprietaires.map((copro) => (
        <Card
          key={copro.id}
          variant="glass"
          className="p-4 border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300/50 dark:hover:border-slate-600/50 transition-all"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-center">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {copro.prenom} {copro.nom}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Titre: {copro.numeroTitreFoncier}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{copro.adresse}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Phone className="h-4 w-4 flex-shrink-0" />
              {copro.telephoneMaroc}
            </div>

            <div className="flex gap-1">
              {copro.habiteLEtranger && (
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                  À l'étranger
                </Badge>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit?.(copro)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete?.(copro.id)}
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

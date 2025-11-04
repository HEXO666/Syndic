"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useData } from "@/lib/data-context"
import { Download, FileText } from "lucide-react"

interface CertificatGeneratorProps {
  onSuccess: () => void
}

export function CertificatGenerator({ onSuccess }: CertificatGeneratorProps) {
  const { coproprietaires, generateCertificat, getPaiementsByCoproprietaire } = useData()
  const [selectedCoproprietaire, setSelectedCoproprietaire] = useState("")
  const [selectedPeriode, setSelectedPeriode] = useState("")
  const [generatedCertificat, setGeneratedCertificat] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Generate available periods (last 12 months)
  const generatePeriods = () => {
    const periods = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const period = date.toISOString().slice(0, 7) // YYYY-MM format
      const label = date.toLocaleDateString("fr-FR", { year: "numeric", month: "long" })
      periods.push({ value: period, label })
    }
    return periods
  }

  const periods = generatePeriods()

  const handleGenerate = () => {
    if (!selectedCoproprietaire || !selectedPeriode) return

    setIsGenerating(true)
    try {
      const certificat = generateCertificat(selectedCoproprietaire, selectedPeriode)
      setGeneratedCertificat(certificat)
    } catch (error) {
      console.error("Erreur lors de la génération:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedCertificat) return

    const content = `
CERTIFICAT DE PAIEMENT

Copropriétaire: ${generatedCertificat.coproprietaireNom}
Période: ${new Date(generatedCertificat.periode + "-01").toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
Montant total payé: ${generatedCertificat.montantTotal}€

Détail des paiements:
${generatedCertificat.paiements
  .map(
    (p: any) => `- ${p.typePaiement}: ${p.montant}€ (payé le ${new Date(p.datePaiement).toLocaleDateString("fr-FR")})`,
  )
  .join("\n")}

Certificat généré le: ${new Date(generatedCertificat.dateGeneration).toLocaleDateString("fr-FR")}

Syndic Pro - Gestion de Copropriété
    `

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `certificat-${generatedCertificat.coproprietaireNom.replace(/\s+/g, "-")}-${generatedCertificat.periode}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const selectedCoproprietaireData = coproprietaires.find((c) => c.id === selectedCoproprietaire)
  const paiementsPeriode =
    selectedCoproprietaire && selectedPeriode
      ? getPaiementsByCoproprietaire(selectedCoproprietaire).filter(
          (p) => p.moisConcerne === selectedPeriode && p.statut === "paye",
        )
      : []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="coproprietaire">Copropriétaire *</Label>
          <Select value={selectedCoproprietaire} onValueChange={setSelectedCoproprietaire}>
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
          <Label htmlFor="periode">Période *</Label>
          <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une période" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedCoproprietaire && selectedPeriode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aperçu</CardTitle>
            <CardDescription>
              Paiements de {selectedCoproprietaireData?.prenom} {selectedCoproprietaireData?.nom} pour{" "}
              {periods.find((p) => p.value === selectedPeriode)?.label}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paiementsPeriode.length > 0 ? (
              <div className="space-y-2">
                {paiementsPeriode.map((paiement) => (
                  <div key={paiement.id} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">
                      {paiement.typePaiement === "charges_mensuelles" && "Charges mensuelles"}
                      {paiement.typePaiement === "travaux" && "Travaux"}
                      {paiement.typePaiement === "reparations" && "Réparations"}
                      {paiement.typePaiement === "autres" && "Autres"}
                    </span>
                    <span className="font-medium">{paiement.montant}€</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total:</span>
                    <span>{paiementsPeriode.reduce((sum, p) => sum + p.montant, 0)}€</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Aucun paiement trouvé pour cette période</p>
            )}
          </CardContent>
        </Card>
      )}

      {generatedCertificat && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Certificat généré
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Copropriétaire:</strong> {generatedCertificat.coproprietaireNom}
              </p>
              <p>
                <strong>Période:</strong> {periods.find((p) => p.value === generatedCertificat.periode)?.label}
              </p>
              <p>
                <strong>Montant total:</strong> {generatedCertificat.montantTotal}€
              </p>
              <p>
                <strong>Nombre de paiements:</strong> {generatedCertificat.paiements.length}
              </p>
            </div>
            <Button onClick={handleDownload} className="mt-4">
              <Download className="h-4 w-4 mr-2" />
              Télécharger le certificat
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 pt-4">
        <Button
          onClick={handleGenerate}
          disabled={!selectedCoproprietaire || !selectedPeriode || paiementsPeriode.length === 0 || isGenerating}
        >
          {isGenerating ? "Génération..." : "Générer le certificat"}
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Fermer
        </Button>
      </div>
    </div>
  )
}

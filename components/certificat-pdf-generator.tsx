"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useData } from "@/lib/data-context"
import { useAuth } from "@/lib/auth-context"
import { Download, FileText, Building2, Calendar, User, DollarSign } from "lucide-react"

interface CertificatPDFGeneratorProps {
  onSuccess: () => void
}

export function CertificatPDFGenerator({ onSuccess }: CertificatPDFGeneratorProps) {
  const { coproprietaires, paiements, getArrieresByCoproprietaire } = useData()
  const { user } = useAuth()
  const [selectedCoproprietaire, setSelectedCoproprietaire] = useState("")
  const [selectedAnnee, setSelectedAnnee] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // Generate available years (current year and 4 previous years)
  const generateYears = () => {
    const years = []
    const currentYear = new Date().getFullYear()
    for (let i = 0; i <= 4; i++) {
      years.push((currentYear - i).toString())
    }
    return years
  }

  const years = generateYears()

  const handleGeneratePDF = () => {
    if (!selectedCoproprietaire || !selectedAnnee) return

    setIsGenerating(true)
    try {
      const coproprietaire = coproprietaires.find(c => c.id === selectedCoproprietaire)
      if (!coproprietaire) return

      // Get payment data for the selected year
      const paiementsAnnee = paiements.filter(p => 
        p.coproprietaireId === selectedCoproprietaire && 
        p.annee === selectedAnnee
      )
      
      const arrieres = getArrieresByCoproprietaire(selectedCoproprietaire)
      const montantPaye = paiementsAnnee.reduce((sum, p) => sum + p.montant, 0)
      const montantDu = 1200 // Montant annuel fixe
      const montantRestant = Math.max(0, montantDu - montantPaye)

      generatePDFContent({
        coproprietaire,
        annee: selectedAnnee,
        paiements: paiementsAnnee,
        montantPaye,
        montantDu,
        montantRestant,
        arrieres,
        gestionnaire: user?.name || "Administrateur"
      })

    } catch (error) {
      console.error("Erreur lors de la génération:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generatePDFContent = (data: any) => {
    const { coproprietaire, annee, paiements, montantPaye, montantDu, montantRestant, gestionnaire } = data
    
    // Create PDF-like HTML content
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Certificat de Paiement - ${coproprietaire.nom} ${coproprietaire.prenom}</title>
        <style>
            body { 
                font-family: 'Arial', sans-serif; 
                margin: 0; 
                padding: 40px; 
                background: white;
                color: #333;
                line-height: 1.6;
            }
            .header { 
                text-align: center; 
                margin-bottom: 40px; 
                border-bottom: 3px solid #2563eb;
                padding-bottom: 20px;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 10px;
            }
            .company-info {
                font-size: 14px;
                color: #666;
                margin-bottom: 20px;
            }
            .certificate-title {
                font-size: 24px;
                font-weight: bold;
                color: #1e40af;
                margin: 30px 0;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            .section {
                margin: 30px 0;
                padding: 20px;
                background: #f8fafc;
                border-left: 4px solid #2563eb;
                border-radius: 8px;
            }
            .section-title {
                font-size: 18px;
                font-weight: bold;
                color: #1e40af;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 15px 0;
            }
            .info-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e5e7eb;
            }
            .info-label {
                font-weight: bold;
                color: #4b5563;
            }
            .info-value {
                color: #1f2937;
            }
            .payment-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            .payment-table th,
            .payment-table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #e5e7eb;
            }
            .payment-table th {
                background: #f1f5f9;
                font-weight: bold;
                color: #1e40af;
            }
            .status-paid {
                background: #dcfce7;
                color: #166534;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            }
            .status-unpaid {
                background: #fef2f2;
                color: #dc2626;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            }
            .total-section {
                background: #1e40af;
                color: white;
                padding: 20px;
                border-radius: 8px;
                margin: 30px 0;
                text-align: center;
            }
            .total-amount {
                font-size: 32px;
                font-weight: bold;
                margin: 10px 0;
            }
            .signature-section {
                margin-top: 60px;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
            }
            .signature-box {
                text-align: center;
                width: 200px;
            }
            .signature-line {
                border-bottom: 2px solid #333;
                margin-bottom: 10px;
                height: 60px;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">🏢 SYNDIC PRO</div>
            <div class="company-info">
                Gestion Professionnelle de Copropriétés<br>
                Adresse: 123 Rue de la Résidence, Casablanca<br>
                Tél: +212 522 XXX XXX | Email: contact@syndicpro.ma
            </div>
        </div>

        <div class="certificate-title">
            📄 CERTIFICAT DE SITUATION FINANCIÈRE
        </div>

        <div class="section">
            <div class="section-title">
                👤 Informations du Copropriétaire
            </div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Nom complet:</span>
                    <span class="info-value">${coproprietaire.prenom} ${coproprietaire.nom}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">CIN:</span>
                    <span class="info-value">${coproprietaire.cin}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Téléphone:</span>
                    <span class="info-value">${coproprietaire.telephone}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Titre Foncier:</span>
                    <span class="info-value">${coproprietaire.titreFoncier}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Bloc:</span>
                    <span class="info-value">${coproprietaire.bloque}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Immeuble:</span>
                    <span class="info-value">${coproprietaire.immeuble}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Appartement:</span>
                    <span class="info-value">${coproprietaire.numeroAppartement}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Adresse:</span>
                    <span class="info-value">${coproprietaire.adresse}</span>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">
                💰 Situation Financière - Année ${annee}
            </div>
            
            ${paiements.length > 0 ? `
                <table class="payment-table">
                    <thead>
                        <tr>
                            <th>Date de Paiement</th>
                            <th>Montant</th>
                            <th>Méthode</th>
                            <th>Statut</th>
                            <th>Référence</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paiements.map((p: any) => `
                            <tr>
                                <td>${new Date(p.datePaiement).toLocaleDateString('fr-FR')}</td>
                                <td>${p.montant.toLocaleString()} DH</td>
                                <td>${p.methodePaiement === 'especes' ? 'Espèces' : p.methodePaiement === 'cheque' ? 'Chèque' : 'Virement'}</td>
                                <td>
                                    <span class="${p.statut === 'paye' ? 'status-paid' : 'status-unpaid'}">
                                        ${p.statut === 'paye' ? 'PAYÉ' : p.statut === 'partiel' ? 'PARTIEL' : 'IMPAYÉ'}
                                    </span>
                                </td>
                                <td>${p.numeroCheque || p.numeroVirement || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p style="text-align: center; color: #666; font-style: italic;">Aucun paiement enregistré pour cette année</p>'}
        </div>

        <div class="total-section">
            <h3 style="margin: 0;">RÉSUMÉ FINANCIER ${annee}</h3>
            <div style="display: flex; justify-content: space-around; margin: 20px 0;">
                <div>
                    <div>Montant Dû</div>
                    <div class="total-amount">${montantDu.toLocaleString()} DH</div>
                </div>
                <div>
                    <div>Montant Payé</div>
                    <div class="total-amount">${montantPaye.toLocaleString()} DH</div>
                </div>
                <div>
                    <div>Solde</div>
                    <div class="total-amount" style="color: ${montantRestant > 0 ? '#fbbf24' : '#22c55e'}">
                        ${montantRestant.toLocaleString()} DH
                    </div>
                </div>
            </div>
        </div>

        ${montantRestant > 0 ? `
            <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; text-align: center;">
                ⚠️ <strong>ATTENTION:</strong> Un solde de ${montantRestant.toLocaleString()} DH reste à régler.
            </div>
        ` : `
            <div style="background: #dcfce7; border: 2px solid #22c55e; padding: 15px; border-radius: 8px; text-align: center;">
                ✅ <strong>SITUATION RÉGULARISÉE:</strong> Tous les paiements de l'année ${annee} sont à jour.
            </div>
        `}

        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line"></div>
                <div><strong>Le Copropriétaire</strong></div>
                <div style="font-size: 12px; color: #666;">Signature et cachet</div>
            </div>
            <div style="text-align: center;">
                <div style="margin-bottom: 20px;">
                    <strong>Certificat émis le:</strong><br>
                    ${new Date().toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </div>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <div><strong>Le Gestionnaire</strong></div>
                <div style="font-size: 12px;">${gestionnaire}</div>
            </div>
        </div>

        <div class="footer">
            Ce certificat est généré automatiquement par le système Syndic Pro.<br>
            Pour toute question, veuillez contacter notre service client.<br>
            <strong>Document confidentiel - Ne pas reproduire sans autorisation</strong>
        </div>
    </body>
    </html>
    `

    // Create and download PDF-like HTML file
    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Certificat-${coproprietaire.nom}-${coproprietaire.prenom}-${annee}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const selectedCoproprietaireData = coproprietaires.find((c) => c.id === selectedCoproprietaire)
  const paiementsAnnee = selectedCoproprietaire && selectedAnnee
    ? paiements.filter(p => p.coproprietaireId === selectedCoproprietaire && p.annee === selectedAnnee)
    : []

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Générateur de Certificat PDF
        </CardTitle>
        <CardDescription>
          Génération de certificats de situation financière professionnels avec logo et signatures
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="coproprietaire">Copropriétaire *</Label>
            <Select value={selectedCoproprietaire} onValueChange={setSelectedCoproprietaire}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un copropriétaire" />
              </SelectTrigger>
              <SelectContent>
                {coproprietaires.map((cp) => (
                  <SelectItem key={cp.id} value={cp.id}>
                    {cp.prenom} {cp.nom} - {cp.bloque} {cp.immeuble}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="annee">Année *</Label>
            <Select value={selectedAnnee} onValueChange={setSelectedAnnee}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une année" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedCoproprietaireData && selectedAnnee && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Aperçu des informations</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Copropriétaire:</span> {selectedCoproprietaireData.prenom} {selectedCoproprietaireData.nom}
                </div>
                <div>
                  <span className="font-medium">Année:</span> {selectedAnnee}
                </div>
                <div>
                  <span className="font-medium">Propriété:</span> {selectedCoproprietaireData.bloque} - {selectedCoproprietaireData.immeuble} - Apt {selectedCoproprietaireData.numeroAppartement}
                </div>
                <div>
                  <span className="font-medium">Paiements:</span> {paiementsAnnee.length} enregistrement(s)
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center pt-4">
          <Button variant="outline" onClick={onSuccess}>
            Annuler
          </Button>
          <Button 
            onClick={handleGeneratePDF}
            disabled={!selectedCoproprietaire || !selectedAnnee || isGenerating}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? "Génération..." : "Générer le Certificat PDF"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
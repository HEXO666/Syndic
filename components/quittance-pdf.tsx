"use client"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button-enhanced"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileDown } from "lucide-react"

interface QuittancePDFProps {
  coproprietaireId?: string
  onClose?: () => void
}

export function QuittancePDF({ coproprietaireId, onClose }: QuittancePDFProps) {
  const { coproprietaires, paiements } = useData()
  const { user } = useAuth()

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i))

  const [selectedCopro, setSelectedCopro] = useState(coproprietaireId ?? "")
  const [selectedYear, setSelectedYear] = useState(String(currentYear))
  const [generating, setGenerating] = useState(false)

  const generate = () => {
    const copro = coproprietaires.find((c) => c.id === selectedCopro)
    if (!copro) return

    setGenerating(true)

    const annuePaiements = paiements.filter(
      (p) => p.coproprietaireId === selectedCopro && String(p.annee) === selectedYear,
    )
    const montantPaye = annuePaiements.reduce((s, p) => s + p.montant, 0)
    const montantDu = copro.montantAnnuel ?? 0
    const montantRestant = Math.max(0, montantDu - montantPaye)
    const statut = montantRestant === 0 ? "SOLDÉ" : montantPaye > 0 ? "PARTIEL" : "IMPAYÉ"
    const statutColor = statut === "SOLDÉ" ? "#16a34a" : statut === "PARTIEL" ? "#d97706" : "#dc2626"
    const dateGen = new Date().toLocaleDateString("fr-MA", { day: "2-digit", month: "long", year: "numeric" })

    const rows = annuePaiements.length > 0
      ? annuePaiements.map((p) => `
        <tr>
          <td>${p.datePaiement ? new Date(p.datePaiement).toLocaleDateString("fr-MA") : "—"}</td>
          <td>${p.montant.toLocaleString("fr-MA")} MAD</td>
          <td>${p.methodePaiement === "especes" ? "Espèces" : p.methodePaiement === "cheque" ? "Chèque" : "Virement"}</td>
          <td style="color:${p.statut === "paye" ? "#16a34a" : p.statut === "partiel" ? "#d97706" : "#dc2626"}">
            ${p.statut === "paye" ? "Payé" : p.statut === "partiel" ? "Partiel" : "Impayé"}
          </td>
        </tr>`).join("")
      : `<tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:20px">Aucun paiement enregistré pour ${selectedYear}</td></tr>`

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Quittance — ${copro.prenom} ${copro.nom} — ${selectedYear}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #1e293b; background: #fff; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; }
  .brand { font-size: 22px; font-weight: 700; color: #1e293b; letter-spacing: -0.5px; }
  .brand-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
  .doc-title { text-align: right; }
  .doc-title h1 { font-size: 18px; font-weight: 700; color: #3b82f6; }
  .doc-title p { font-size: 11px; color: #64748b; margin-top: 2px; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; font-weight: 600; margin-bottom: 8px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
  .info-label { font-size: 10px; color: #94a3b8; margin-bottom: 2px; }
  .info-value { font-size: 13px; font-weight: 600; color: #1e293b; }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; background: ${statutColor}22; color: ${statutColor}; border: 1px solid ${statutColor}44; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-size: 11px; color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0; }
  td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
  .totals { margin-top: 16px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
  .total-row { display: flex; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid #f1f5f9; }
  .total-row:last-child { border-bottom: none; background: #f8fafc; font-weight: 700; }
  .total-label { color: #64748b; }
  .total-value { font-weight: 600; font-variant-numeric: tabular-nums; }
  .footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; padding-top: 20px; border-top: 1px solid #e2e8f0; }
  .signature { text-align: center; }
  .sig-line { width: 180px; border-bottom: 1px solid #94a3b8; margin: 0 auto 6px; height: 40px; }
  .sig-label { font-size: 11px; color: #64748b; }
  @media print {
    body { padding: 20px; }
    button { display: none !important; }
  }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="brand">Syndic Pro</div>
    <div class="brand-sub">Gestion de copropriété</div>
  </div>
  <div class="doc-title">
    <h1>QUITTANCE DE PAIEMENT</h1>
    <p>Générée le ${dateGen}</p>
    <p>Année : ${selectedYear}</p>
  </div>
</div>

<div class="section">
  <div class="section-title">Informations copropriétaire</div>
  <div class="info-grid">
    <div class="info-box">
      <div class="info-label">Nom complet</div>
      <div class="info-value">${copro.prenom} ${copro.nom}</div>
    </div>
    <div class="info-box">
      <div class="info-label">Appartement</div>
      <div class="info-value">N° ${copro.numeroAppartement ?? "—"}</div>
    </div>
    <div class="info-box">
      <div class="info-label">CIN</div>
      <div class="info-value">${copro.cin ?? "—"}</div>
    </div>
    <div class="info-box">
      <div class="info-label">Statut ${selectedYear}</div>
      <div class="info-value"><span class="status-badge">${statut}</span></div>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">Détail des paiements — ${selectedYear}</div>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Montant</th>
        <th>Méthode</th>
        <th>Statut</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</div>

<div class="totals">
  <div class="total-row">
    <span class="total-label">Montant annuel dû</span>
    <span class="total-value">${montantDu.toLocaleString("fr-MA")} MAD</span>
  </div>
  <div class="total-row">
    <span class="total-label">Total payé</span>
    <span class="total-value" style="color:#16a34a">${montantPaye.toLocaleString("fr-MA")} MAD</span>
  </div>
  <div class="total-row">
    <span class="total-label">Solde restant</span>
    <span class="total-value" style="color:${montantRestant > 0 ? "#dc2626" : "#16a34a"}">${montantRestant.toLocaleString("fr-MA")} MAD</span>
  </div>
</div>

<div class="footer">
  <div>
    <p style="font-size:11px;color:#94a3b8">Gestionnaire : ${user?.name ?? "Administrateur"}</p>
    <p style="font-size:11px;color:#94a3b8;margin-top:2px">Document généré automatiquement par Syndic Pro</p>
  </div>
  <div class="signature">
    <div class="sig-line"></div>
    <div class="sig-label">Signature & Cachet du syndic</div>
  </div>
</div>

<script>window.onload = () => window.print()</script>
</body>
</html>`

    const blob = new Blob([html], { type: "text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const win = window.open(url, "_blank")
    if (!win) {
      const a = document.createElement("a")
      a.href = url
      a.download = `quittance-${copro.nom}-${selectedYear}.html`
      a.click()
    }
    setTimeout(() => URL.revokeObjectURL(url), 5000)
    setGenerating(false)
    onClose?.()
  }

  return (
    <div className="space-y-4">
      {!coproprietaireId && (
        <div className="space-y-1.5">
          <Label>Copropriétaire</Label>
          <Select value={selectedCopro} onValueChange={setSelectedCopro}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un copropriétaire" />
            </SelectTrigger>
            <SelectContent>
              {coproprietaires.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.prenom} {c.nom} — Appt {c.numeroAppartement}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Année</Label>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        className="w-full"
        loading={generating}
        disabled={!selectedCopro}
        onClick={generate}
        leftIcon={<FileDown className="h-4 w-4" />}
      >
        Générer la quittance PDF
      </Button>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useData } from "@/lib/data-context"
import {
  Building2, Users, Wrench, CreditCard, TrendingUp,
  AlertTriangle, CheckCircle, Calendar, Euro, FileText,
  Plus, ArrowUp, ArrowDown, ChevronRight,
} from "lucide-react"

/* ─── KPI Card ─── */
interface KpiProps {
  label: string
  value: string | number
  unit?: string
  sub?: string
  delta?: string
  deltaDir?: "up" | "down" | "muted"
  foot?: string
  Icon: React.ElementType
  tone?: "default" | "good" | "warn" | "bad"
}

function Kpi({ label, value, unit, sub, delta, deltaDir, foot, Icon, tone = "default" }: KpiProps) {
  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--line)",
      borderRadius: 14,
      padding: "16px 18px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 500, display: "flex", alignItems: "center", gap: 7 }}>
        <Icon style={{ width: 13, height: 13, color: "var(--ink-4)", strokeWidth: 1.8 }} />
        {label}
      </div>
      <div style={{
        fontFamily: "var(--font-inter-tight), sans-serif",
        fontSize: 28,
        fontWeight: 600,
        letterSpacing: "-0.025em",
        marginTop: 8,
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
        color: tone === "bad" ? "var(--bad)" : tone === "good" ? "var(--good)" : tone === "warn" ? "var(--warn)" : "var(--foreground)",
      }}>
        {value}
        {(unit || sub) && (
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-3)", marginLeft: 4, letterSpacing: 0 }}>
            {unit ?? sub}
          </span>
        )}
      </div>
      {(delta || foot) && (
        <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 8 }}>
          {delta && (
            <span style={{
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              fontVariantNumeric: "tabular-nums",
              color: deltaDir === "up" ? "var(--good)" : deltaDir === "down" ? "var(--bad)" : "var(--ink-3)",
            }}>
              {deltaDir === "up" && <ArrowUp style={{ width: 11, height: 11 }} />}
              {deltaDir === "down" && <ArrowDown style={{ width: 11, height: 11 }} />}
              {delta}
            </span>
          )}
          {foot && <span style={{ color: "var(--ink-3)" }}>· {foot}</span>}
        </div>
      )}
    </div>
  )
}

/* ─── Activity Feed ─── */
const ACTIVITIES = [
  { type: "pay",    who: "Fatima Zahra Bennani", what: "a effectué un paiement de", amt: "1 200 DH", when: "il y a 12 min", tag: "Espèces · 2025" },
  { type: "create", who: "Youssef El Amrani",    what: "a ajouté un nouveau copropriétaire", amt: "Karim Tazi", when: "il y a 1 h", tag: "Imm. B · Apt 304" },
  { type: "update", who: "Omar Idrissi",          what: "a mis à jour la fiche", amt: "Aïcha Berrada", when: "il y a 3 h", tag: "Téléphone" },
  { type: "pay",    who: "Hamid Cherkaoui",       what: "paiement partiel", amt: "600 / 1 200 DH", when: "il y a 5 h", tag: "Chèque #4471" },
  { type: "delete", who: "Youssef El Amrani",    what: "a archivé l'ouvrier", amt: "Mohamed Lahlou", when: "hier, 16:42", tag: "Sécurité" },
  { type: "create", who: "Système",               what: "quitus généré pour la vente", amt: "Apt 207 · Bloc A", when: "hier, 11:08", tag: "Vente" },
]

const ACT_COLORS: Record<string, { bg: string; color: string }> = {
  pay:    { bg: "#fff5dc", color: "#7a5400" },
  create: { bg: "var(--good-soft)", color: "var(--good)" },
  update: { bg: "var(--accent-blue-soft)", color: "var(--accent-blue-ink)" },
  delete: { bg: "var(--bad-soft)", color: "var(--bad)" },
}

function ActivityFeed() {
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 10px" }}>
        <div>
          <div style={{ fontFamily: "var(--font-inter-tight), sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em" }}>
            Activité récente
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>6 dernières actions</div>
        </div>
        <span style={{ fontSize: 11.5, color: "var(--ink-3)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          Voir tout <ChevronRight style={{ width: 11, height: 11 }} />
        </span>
      </div>

      <div>
        {ACTIVITIES.map((a, i) => {
          const colors = ACT_COLORS[a.type] ?? ACT_COLORS.create
          const ActIcon = a.type === "pay" ? Euro : a.type === "create" ? Plus : a.type === "update" ? CheckCircle : AlertTriangle
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 11,
                padding: "10px 18px",
                alignItems: "flex-start",
                borderTop: i === 0 ? "1px solid var(--line-2)" : "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{
                width: 26,
                height: 26,
                borderRadius: 7,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: colors.bg,
                color: colors.color,
              }}>
                <ActIcon style={{ width: 13, height: 13, strokeWidth: 2 }} />
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.4, flex: 1, minWidth: 0 }}>
                <span>
                  <b style={{ fontWeight: 500 }}>{a.who}</b>{" "}
                  <span style={{ color: "var(--ink-3)" }}>{a.what}</span>{" "}
                  <b style={{ fontWeight: 500 }}>{a.amt}</b>
                </span>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>
                  {a.tag} · {a.when}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Monthly Chart ─── */
const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"]
const PAID =    [38, 42, 51, 47, 55, 49, 44, 39, 52, 58, 61, 22]
const PENDING = [ 8, 11,  9, 14, 12, 16, 19, 23, 14, 11,  9, 32]

function MonthlyChart() {
  const max = 80
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 10px" }}>
        <div>
          <div style={{ fontFamily: "var(--font-inter-tight), sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em" }}>
            Collecte mensuelle des cotisations
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>
            Cotisation annuelle 1 200 DH × copropriétaires
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 14, padding: "0 18px 8px", fontSize: 11.5, color: "var(--ink-3)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "var(--ink)", verticalAlign: "middle" }} />
          Encaissé
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#d6cfbf", verticalAlign: "middle" }} />
          En attente
        </span>
        <span style={{ marginLeft: "auto", fontVariantNumeric: "tabular-nums" }}>
          Total : <b style={{ color: "var(--foreground)", fontWeight: 600 }}>148 800 DH</b>
        </span>
      </div>

      {/* SVG chart */}
      <div style={{ padding: "8px 18px 16px", height: 220 }}>
        <svg viewBox="0 0 600 200" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1="32" x2="600" y1={20 + i * 36} y2={20 + i * 36} stroke="var(--line-2)" strokeDasharray="2 3" />
          ))}
          {[0, 20, 40, 60, 80].map((v, i) => (
            <text key={v} x="0" y={163 - i * 36 + 3} fontSize="10" fill="var(--ink-4)" fontFamily="var(--font-mono), monospace">{v}</text>
          ))}

          {MONTHS.map((m, i) => {
            const bw = 30, gap = 14, x = 36 + i * (bw + gap)
            const ph = PAID[i] * 1.8
            const eh = PENDING[i] * 1.8
            const isHighlight = i === 10
            return (
              <g key={i}>
                <rect x={x} y={163 - eh} width={bw} height={eh} fill="#d6cfbf" rx="2" />
                <rect x={x} y={163 - eh - ph} width={bw} height={ph} fill="var(--ink)" rx="2" />
                {isHighlight && (
                  <text x={x + bw / 2} y={163 - eh - ph - 6} fontSize="10" fill="var(--foreground)" fontWeight="600" textAnchor="middle">
                    {PAID[i] + PENDING[i]}
                  </text>
                )}
                <text
                  x={x + bw / 2}
                  y="182"
                  fontSize="10"
                  fill={isHighlight ? "var(--foreground)" : "var(--ink-3)"}
                  fontWeight={isHighlight ? "600" : "400"}
                  textAnchor="middle"
                >
                  {m}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

/* ─── Quick Actions ─── */
function QuickBtn({ Icon, label, primary = false }: { Icon: React.ElementType; label: string; primary?: boolean }) {
  return (
    <button style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "7px 12px",
      borderRadius: 7,
      fontSize: 12.5,
      fontWeight: 500,
      cursor: "pointer",
      border: primary ? "none" : "1px solid var(--line)",
      background: primary ? "var(--ink)" : "var(--card)",
      color: primary ? "#fff" : "var(--ink-2)",
      fontFamily: "inherit",
      width: "100%",
      justifyContent: "flex-start",
      transition: "background 0.12s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = primary ? "#000" : "var(--surface-2)")}
    onMouseLeave={(e) => (e.currentTarget.style.background = primary ? "var(--ink)" : "var(--card)")}
    >
      <Icon style={{ width: 13, height: 13, strokeWidth: 2 }} />
      {label}
    </button>
  )
}

/* ─── Main Dashboard ─── */
export default function ModernDashboard() {
  const { coproprietaires, ouvriers, paiements, blocs, immeubles } = useData()
  const [stats, setStats] = useState({
    totalCopro: 0,
    activeOuvriers: 0,
    totalBlocs: 0,
    totalImmeubles: 0,
    montantCollecte: 0,
    partiels: 0,
    debiteurs: 0,
    tauxPaiement: 0,
  })

  useEffect(() => {
    const montantCollecte = paiements
      .filter((p) => p.statut === "paye")
      .reduce((s, p) => s + p.montant, 0)

    const tauxPaiement = coproprietaires.length > 0
      ? Math.round((paiements.filter((p) => p.statut === "paye").length / coproprietaires.length) * 100)
      : 0

    setStats({
      totalCopro: coproprietaires.length,
      activeOuvriers: ouvriers.filter((o) => o.statut === "actif").length,
      totalBlocs: blocs.length,
      totalImmeubles: immeubles.length,
      montantCollecte,
      partiels: paiements.filter((p) => p.statut === "partiel").length,
      debiteurs: coproprietaires.filter((c) => c.totalDettes > 0).length,
      tauxPaiement,
    })
  }, [coproprietaires, ouvriers, paiements, blocs, immeubles])

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div style={{ padding: "24px 28px 32px", background: "var(--background)", minHeight: "100%" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20, gap: 16 }}>
        <div>
          <div style={{
            fontFamily: "var(--font-inter-tight), sans-serif",
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "-0.018em",
            color: "var(--foreground)",
          }}>
            Tableau de bord
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>
            Vue d'ensemble · {today}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "7px 12px", borderRadius: 7, fontSize: 12.5, fontWeight: 500,
            cursor: "pointer", border: "1px solid var(--line)",
            background: "var(--card)", color: "var(--ink-2)", fontFamily: "inherit",
          }}>
            Exporter
          </button>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "7px 12px", borderRadius: 7, fontSize: 12.5, fontWeight: 500,
            cursor: "pointer", border: "none",
            background: "var(--ink)", color: "#fff", fontFamily: "inherit",
          }}>
            <Plus style={{ width: 13, height: 13, strokeWidth: 2 }} />
            Nouveau paiement
          </button>
        </div>
      </div>

      {/* Alert banner */}
      {stats.debiteurs > 0 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "11px 16px",
          borderRadius: 10,
          background: "#fff7e6",
          border: "1px solid #f5e0b3",
          marginBottom: 16,
          fontSize: 12.5,
        }}>
          <AlertTriangle style={{ width: 16, height: 16, color: "var(--warn)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <b style={{ fontWeight: 600 }}>{stats.debiteurs} copropriétaire{stats.debiteurs > 1 ? "s" : ""} en retard</b>
            {" "}
            <span style={{ color: "var(--ink-3)" }}>
              — soit {(stats.debiteurs * 1200).toLocaleString("fr-FR")} DH d'arriérés à recouvrer.
            </span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--accent-blue-ink)", cursor: "pointer", flexShrink: 0 }}>
            Voir les débiteurs →
          </span>
        </div>
      )}

      {/* 4-col KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 12 }}>
        <Kpi
          label="Copropriétaires"
          Icon={Users}
          value={stats.totalCopro}
          delta="+3 ce trimestre"
          deltaDir="up"
          foot="propriétaires enregistrés"
        />
        <Kpi
          label="Ouvriers actifs"
          Icon={Wrench}
          value={stats.activeOuvriers}
          foot={`sur ${ouvriers.length} au total`}
          deltaDir="muted"
        />
        <Kpi
          label="Immeubles"
          Icon={Building2}
          value={stats.totalImmeubles}
          sub={`· ${stats.totalBlocs} blocs`}
          foot="bâtiments gérés"
        />
        <Kpi
          label="Taux de paiement"
          Icon={TrendingUp}
          value={stats.tauxPaiement}
          unit="%"
          delta="+6 pts"
          deltaDir="up"
          foot="vs. année précédente"
          tone={stats.tauxPaiement >= 80 ? "good" : stats.tauxPaiement >= 60 ? "warn" : "bad"}
        />
      </div>

      {/* 3-col financial grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        <Kpi
          label="Montant collecté"
          Icon={Euro}
          value={stats.montantCollecte > 0 ? stats.montantCollecte.toLocaleString("fr-FR") : "0"}
          unit="DH"
          delta="paiements reçus cette année"
          deltaDir="up"
          tone="good"
        />
        <Kpi
          label="Paiements partiels"
          Icon={CreditCard}
          value={stats.partiels}
          delta="en attente de complément"
          deltaDir="muted"
          tone="warn"
        />
        <Kpi
          label="Débiteurs"
          Icon={AlertTriangle}
          value={stats.debiteurs}
          delta={stats.debiteurs > 0 ? `${(stats.debiteurs * 1200).toLocaleString("fr-FR")} DH dûs` : "aucune dette"}
          deltaDir={stats.debiteurs > 0 ? "down" : "up"}
          tone={stats.debiteurs === 0 ? "good" : "bad"}
        />
      </div>

      {/* 2-col: chart + activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12, marginBottom: 16 }}>
        <MonthlyChart />
        <ActivityFeed />
      </div>

      {/* Quick actions */}
      <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 18px" }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: "var(--font-inter-tight), sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em" }}>
            Actions rapides
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>Raccourcis vers les tâches fréquentes</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          <QuickBtn Icon={Users}     label="Ajouter un copropriétaire" primary />
          <QuickBtn Icon={CreditCard} label="Enregistrer un paiement" />
          <QuickBtn Icon={Wrench}    label="Gérer les ouvriers" />
          <QuickBtn Icon={FileText}  label="Générer un rapport" />
          <QuickBtn Icon={Building2} label="Ajouter un immeuble" />
        </div>
      </div>
    </div>
  )
}

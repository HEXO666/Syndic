"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { loadUserPermissions } from "@/lib/permissions"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, Users, Building2, Wrench, CreditCard,
  FileText, History, Handshake, Crown, Shield, ChevronDown, UserPlus,
  Globe, Settings,
} from "lucide-react"

const NAV_MAIN = [
  { id: "dash",     title: "Tableau de bord",   href: "/",               Icon: LayoutDashboard },
  { id: "espace",   title: "Mon espace",        href: "/espace",          Icon: Shield },
  { id: "copro",    title: "Copropriétaires",    href: "/coproprietaires", Icon: Users },
  { id: "ventes",   title: "Ventes",             href: "/ventes",         Icon: Handshake },
  { id: "blocs",    title: "Blocs & Immeubles",  href: "/blocs-immeubles", Icon: Building2, showBlocBadge: true },
  { id: "ouvriers", title: "Ouvriers",           href: "/ouvriers",       Icon: Wrench },
  { id: "paie",     title: "Paiements",          href: "/paiements",      Icon: CreditCard, showPaieBadge: true },
  { id: "hist",     title: "Historique",         href: "/historique",     Icon: History },
]

const NAV_ADMIN = [
  { id: "users",     title: "Utilisateurs",      href: "/utilisateurs",  Icon: Crown },
  { id: "syndics",   title: "Syndics",           href: "/syndics",       Icon: Building2 },
  { id: "add-copro", title: "Ajouter une copro", href: "/ajouter-copro", Icon: UserPlus },
  { id: "perms",     title: "Permissions",       href: "/permissions",   Icon: Shield },
  { id: "rep",       title: "Rapports",          href: "/rapports",      Icon: FileText },
]

const NAV_SUPER_ADMIN = [
  { id: "orgs",  title: "Organisations", href: "/super-admin/organisations", Icon: Globe },
  { id: "plans", title: "Plans",         href: "/super-admin/plans",         Icon: Settings },
]

function NavItem({
  href,
  Icon,
  title,
  badge,
  active,
}: {
  href: string
  Icon: React.ElementType
  title: string
  badge?: string
  active: boolean
}) {
  return (
    <Link href={href}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "7px 10px",
          borderRadius: 7,
          color: active ? "#ffffff" : "var(--ink-2)",
          background: active ? "var(--ink)" : "transparent",
          fontWeight: active ? 500 : 400,
          fontSize: 13,
          lineHeight: 1.3,
          cursor: "pointer",
          transition: "background 0.12s, color 0.12s",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = "var(--surface-2)" }}
        onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = "transparent" }}
      >
        <Icon style={{ width: 15, height: 15, flexShrink: 0, strokeWidth: 1.8 }} />
        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {title}
        </span>
        {badge && (
          <span style={{
            fontSize: 10.5,
            padding: "1px 6px",
            borderRadius: 10,
            fontWeight: 500,
            fontVariantNumeric: "tabular-nums",
            background: active ? "rgba(255,255,255,.16)" : "var(--surface-2)",
            color: active ? "#fff" : "var(--ink-3)",
            flexShrink: 0,
          }}>
            {badge}
          </span>
        )}
      </div>
    </Link>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: "var(--ink-4)",
      padding: "14px 10px 6px",
      fontWeight: 600,
    }}>
      {children}
    </div>
  )
}

export function ModernSidebar() {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const { blocNotifications, paiements } = useData()

  const permissions = user ? loadUserPermissions(user.id, user.role) : null
  const canManageCoproprietaires = !!permissions?.manage_coproprietaires
  const canCreateCoproAccounts = !!permissions?.create_coproprietaire_accounts

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href)

  useEffect(() => {
    if (!user) return

    let hrefs: string[] = []

    if (user.role === "super_admin") {
      hrefs = NAV_SUPER_ADMIN.map((i) => i.href)
    } else if (user.role === "copro") {
      hrefs = ["/espace"]
    } else {
      const mainHrefs = NAV_MAIN.filter((item) => {
        if (item.href === "/coproprietaires") return canManageCoproprietaires
        if (item.href === "/espace") return false
        return true
      }).map((i) => i.href)

      const adminHrefs = user.role === "admin"
        ? NAV_ADMIN.filter((item) => {
          if (item.href === "/ajouter-copro") return canCreateCoproAccounts
          return true
        }).map((i) => i.href)
        : []

      hrefs = Array.from(new Set([...mainHrefs, ...adminHrefs]))
    }

    const id = window.setTimeout(() => {
      hrefs.forEach((href) => {
        if (!isActive(href)) router.prefetch(href)
      })
    }, 0)

    return () => window.clearTimeout(id)
  }, [
    user,
    canManageCoproprietaires,
    canCreateCoproAccounts,
    router,
    pathname,
  ])

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "U"

  return (
    <aside style={{
      width: 236,
      flexShrink: 0,
      background: "var(--card)",
      borderRight: "1px solid var(--line)",
      display: "flex",
      flexDirection: "column",
      padding: "14px 12px",
      height: "100vh",
      overflowY: "auto",
      overflowX: "hidden",
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px 18px" }}>
        <div style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: "var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontFamily: "var(--font-inter-tight), sans-serif",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "-0.02em",
          position: "relative",
          flexShrink: 0,
        }}>
          SP
          <div style={{
            position: "absolute",
            inset: 3,
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,.18)",
            pointerEvents: "none",
          }} />
        </div>
        <div>
          <div style={{
            fontFamily: "var(--font-inter-tight), sans-serif",
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: "-0.01em",
            color: "var(--foreground)",
          }}>
            Syndic Pro
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: -1 }}>
            Résidence Al Mansour
          </div>
        </div>
      </div>

      {/* Super admin nav */}
      {user?.role === "super_admin" && (
        <>
          <SectionLabel>Plateforme</SectionLabel>
          <nav style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {NAV_SUPER_ADMIN.map((item) => (
              <NavItem key={item.href} href={item.href} Icon={item.Icon} title={item.title} active={isActive(item.href)} />
            ))}
          </nav>
        </>
      )}

      {/* Copro nav */}
      {user?.role === "copro" && (
        <>
          <SectionLabel>Mon compte</SectionLabel>
          <nav style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <NavItem href="/espace" Icon={Shield} title="Ma situation" active={isActive("/espace")} />
          </nav>
        </>
      )}

      {/* Admin / user / syndic nav */}
      {user?.role !== "super_admin" && user?.role !== "copro" && (
        <>
          <SectionLabel>Gestion</SectionLabel>
          <nav style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {NAV_MAIN.filter((item) => {
              if (item.href === "/coproprietaires") return canManageCoproprietaires
              if (item.href === "/espace") return false
              return true
            }).map((item) => {
              let badge: string | undefined
              if (item.showBlocBadge && blocNotifications > 0) badge = blocNotifications.toString()
              if (item.showPaieBadge && paiements.length > 0) badge = paiements.length.toString()
              return (
                <NavItem
                  key={item.href}
                  href={item.href}
                  Icon={item.Icon}
                  title={item.title}
                  badge={badge}
                  active={isActive(item.href)}
                />
              )
            })}
          </nav>

          {/* Admin section */}
          {user?.role === "admin" && (
            <>
              <SectionLabel>Administration</SectionLabel>
              <nav style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {NAV_ADMIN.filter((item) => {
                  if (item.href === "/ajouter-copro") return canCreateCoproAccounts
                  return true
                }).map((item) => (
                  <NavItem key={item.href} href={item.href} Icon={item.Icon} title={item.title} active={isActive(item.href)} />
                ))}
              </nav>
            </>
          )}
        </>
      )}

      <div style={{ flex: 1 }} />

      {/* User profile */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 9,
        background: "var(--surface-2)",
        border: "1px solid var(--line-2)",
        marginTop: 8,
        cursor: "pointer",
      }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #3a4ee8, #7d3ae8)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          fontSize: 11,
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: 12.5,
            fontWeight: 500,
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: "var(--foreground)",
          }}>
            {user?.name ?? "Utilisateur"}
          </div>
          <div style={{
            fontSize: 10.5,
            color: "var(--ink-3)",
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: 1,
          }}>
            {user?.role === "super_admin" ? (
              <><Crown style={{ width: 9, height: 9 }} /> Super Admin</>
            ) : user?.role === "admin" ? (
              <><Crown style={{ width: 9, height: 9 }} /> Administrateur</>
            ) : user?.role === "syndic" ? (
              <><Building2 style={{ width: 9, height: 9 }} /> Syndic</>
            ) : user?.role === "copro" ? (
              <><Shield style={{ width: 9, height: 9 }} /> Copropriétaire</>
            ) : (
              <><Shield style={{ width: 9, height: 9 }} /> Utilisateur</>
            )}
          </div>
        </div>
        <ChevronDown style={{ width: 13, height: 13, color: "var(--ink-4)", flexShrink: 0 }} />
      </div>
    </aside>
  )
}

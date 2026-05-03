"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/lib/theme-context"
import { Bell, Moon, Sun, Search, Menu, LogOut, Settings, User, Crown, Shield } from "lucide-react"

interface ModernHeaderProps {
  onMenuToggle?: () => void
  title?: string
}

export function ModernHeader({ onMenuToggle, title = "Tableau de bord" }: ModernHeaderProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "U"

  const iconBtnStyle: React.CSSProperties = {
    width: 30,
    height: 30,
    borderRadius: 7,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--ink-2)",
    cursor: "pointer",
    border: "none",
    background: "transparent",
    position: "relative",
  }

  return (
    <div style={{
      height: 54,
      borderBottom: "1px solid var(--line)",
      background: "var(--card)",
      display: "flex",
      alignItems: "center",
      padding: "0 22px",
      gap: 18,
      flexShrink: 0,
    }}>
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden"
        style={iconBtnStyle}
      >
        <Menu style={{ width: 15, height: 15, strokeWidth: 1.8 }} />
      </button>

      {/* Title */}
      <div style={{ flexShrink: 0 }}>
        <div style={{
          fontFamily: "var(--font-inter-tight), sans-serif",
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: "-0.01em",
          color: "var(--foreground)",
        }}>
          {title}
        </div>
      </div>

      {/* Search */}
      <div style={{
        flex: 1,
        maxWidth: 380,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "var(--surface-2)",
        border: "1px solid var(--line-2)",
        borderRadius: 8,
        padding: "6px 10px",
        fontSize: 12.5,
        color: "var(--ink-3)",
        cursor: "text",
      }}>
        <Search style={{ width: 13, height: 13, flexShrink: 0 }} />
        <span style={{ flex: 1 }}>Rechercher copropriétaire, immeuble…</span>
        <span style={{
          marginLeft: "auto",
          fontSize: 10,
          background: "var(--card)",
          border: "1px solid var(--line)",
          padding: "1px 5px",
          borderRadius: 4,
          color: "var(--ink-3)",
          fontFamily: "var(--font-mono), monospace",
          flexShrink: 0,
        }}>
          ⌘K
        </span>
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {/* Bell */}
        <button style={iconBtnStyle}>
          <Bell style={{ width: 15, height: 15, strokeWidth: 1.8 }} />
          <span style={{
            position: "absolute",
            top: 6,
            right: 7,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--accent-blue)",
            border: "1.5px solid var(--card)",
          }} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={iconBtnStyle}
          title={theme === "dark" ? "Mode clair" : "Mode sombre"}
        >
          {theme === "dark" ? (
            <Sun style={{ width: 15, height: 15, strokeWidth: 1.8 }} />
          ) : (
            <Moon style={{ width: 15, height: 15, strokeWidth: 1.8 }} />
          )}
        </button>

        {/* User menu */}
        <div ref={userMenuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
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
              cursor: "pointer",
              border: "none",
              flexShrink: 0,
            }}
          >
            {initials}
          </button>

          {showUserMenu && (
            <div style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              width: 220,
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: 10,
              boxShadow: "0 8px 24px rgba(21,23,27,.12)",
              zIndex: 50,
              overflow: "hidden",
            }}>
              {/* User info */}
              <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line-2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3a4ee8, #7d3ae8)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: 12,
                    flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user?.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user?.email}
                    </div>
                  </div>
                </div>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 8,
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 20,
                  background: user?.role === "admin" ? "#fff5dc" : "var(--accent-blue-soft)",
                  color: user?.role === "admin" ? "#7a5400" : "var(--accent-blue-ink)",
                  fontWeight: 500,
                }}>
                  {user?.role === "admin"
                    ? <><Crown style={{ width: 9, height: 9 }} /> Administrateur</>
                    : <><Shield style={{ width: 9, height: 9 }} /> Utilisateur</>
                  }
                </div>
              </div>

              {/* Menu items */}
              <div style={{ padding: 6 }}>
                {[
                  { Icon: User, label: "Mon Profil" },
                  { Icon: Settings, label: "Paramètres" },
                ].map(({ Icon, label }) => (
                  <button
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "7px 10px",
                      borderRadius: 7,
                      width: "100%",
                      fontSize: 13,
                      color: "var(--ink-2)",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Icon style={{ width: 14, height: 14 }} />
                    {label}
                  </button>
                ))}

                <div style={{ height: 1, background: "var(--line-2)", margin: "4px 0" }} />

                <button
                  onClick={() => { logout(); setShowUserMenu(false) }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 10px",
                    borderRadius: 7,
                    width: "100%",
                    fontSize: 13,
                    color: "var(--bad)",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bad-soft)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <LogOut style={{ width: 14, height: 14 }} />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

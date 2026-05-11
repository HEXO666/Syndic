"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Lock, Mail } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const success = await login(email, password)
    if (!success) setError("Email ou mot de passe incorrect")
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px 8px 36px",
    fontSize: 13,
    border: "1px solid var(--line)",
    borderRadius: 8,
    background: "var(--card)",
    color: "var(--foreground)",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.15s",
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--background)",
      padding: 16,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 380,
        background: "var(--card)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "var(--shadow-md)",
      }}>
        {/* Header */}
        <div style={{ padding: "28px 28px 20px", textAlign: "center", borderBottom: "1px solid var(--line-2)" }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "var(--ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
            color: "#fff",
            fontFamily: "var(--font-inter-tight), sans-serif",
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: "-0.02em",
            position: "relative",
          }}>
            SP
            <div style={{
              position: "absolute",
              inset: 4,
              borderRadius: 9,
              border: "1px solid rgba(255,255,255,.2)",
              pointerEvents: "none",
            }} />
          </div>
          <div style={{
            fontFamily: "var(--font-inter-tight), sans-serif",
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--foreground)",
          }}>
            Syndic Pro
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 4 }}>
            Connectez-vous à votre espace de gestion
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: 28 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 500, marginBottom: 6, color: "var(--ink-2)" }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--ink-4)", strokeWidth: 1.8 }} />
                <input
                  type="email"
                  placeholder="admin@syndic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent-blue)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 500, marginBottom: 6, color: "var(--ink-2)" }}>
                Mot de passe
              </label>
              <div style={{ position: "relative" }}>
                <Lock style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--ink-4)", strokeWidth: 1.8 }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent-blue)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                />
              </div>
            </div>

            {error && (
              <div style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: "var(--bad-soft)",
                border: "1px solid #f5c2c0",
                fontSize: 12.5,
                color: "var(--bad)",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "9px 12px",
                borderRadius: 8,
                background: "var(--ink)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
                fontFamily: "inherit",
                width: "100%",
                marginTop: 4,
              }}
            >
              {isLoading ? "Connexion en cours…" : "Se connecter"}
            </button>
          </form>

          <div style={{
            marginTop: 18,
            padding: "12px 14px",
            background: "var(--surface-2)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--ink-3)",
          }}>
            <div style={{ fontWeight: 500, marginBottom: 6, color: "var(--ink-2)" }}>Comptes de test</div>
            {[
              { label: "Super Admin", email: "superadmin@syndic.ma", password: "SuperAdmin2026!" },
              { label: "Admin",       email: "admin@syndic.com",      password: "Admin2026!" },
              { label: "Utilisateur", email: "user@syndic.com",       password: "user123" },
            ].map(({ label, email: e, password: p }) => (
              <div
                key={e}
                onClick={() => { setEmail(e); setPassword(p) }}
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 11,
                  padding: "4px 6px",
                  borderRadius: 5,
                  cursor: "pointer",
                  marginBottom: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--line-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ color: "var(--ink-4)", minWidth: 72, fontSize: 10.5, fontFamily: "inherit", fontWeight: 500 }}>{label}</span>
                <span>{e} / {p}</span>
              </div>
            ))}
            <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 4 }}>Cliquez pour remplir automatiquement</div>
          </div>
        </div>
      </div>
    </div>
  )
}

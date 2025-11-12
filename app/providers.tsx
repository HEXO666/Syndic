"use client"

import type React from "react"

import { AuthProvider } from "@/lib/auth-context"
import { DataProvider } from "@/lib/data-context"
import { ThemeProvider } from "@/lib/theme-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="syndic-theme">
      <AuthProvider>
        <DataProvider>{children}</DataProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

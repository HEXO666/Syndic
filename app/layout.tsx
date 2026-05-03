import type React from "react"
import type { Metadata } from "next"
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google"
import { Providers } from "./providers"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600"],
})

const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-tight",
  weight: ["400", "500", "600", "700"],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  title: "Syndic Pro — Gestion Professionnelle",
  description: "Application de gestion complète pour syndics de copropriété",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

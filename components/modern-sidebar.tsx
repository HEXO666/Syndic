"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button-enhanced"
import { Card } from "@/components/ui/card-enhanced"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Wrench, 
  CreditCard, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Crown,
  Shield,
  Bell,
  History,
  Handshake
} from "lucide-react"

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  badge?: string
  adminOnly?: boolean
  description?: string
}

const navItems: NavItem[] = [
  {
    title: "Tableau de bord",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
    description: "Vue d'ensemble"
  },
  {
    title: "Copropriétaires",
    href: "/coproprietaires",
    icon: <Users className="h-5 w-5" />,
    description: "Gestion des propriétaires"
  },
  {
    title: "Ventes",
    href: "/ventes",
    icon: <Handshake className="h-5 w-5" />,
    description: "Transferts de lots"
  },
  {
    title: "Blocs & Immeubles",
    href: "/blocs-immeubles",
    icon: <Building2 className="h-5 w-5" />,
    description: "Structure des bâtiments"
  },
  {
    title: "Ouvriers",
    href: "/ouvriers",
    icon: <Wrench className="h-5 w-5" />,
    description: "Personnel et métiers"
  },
  {
    title: "Paiements",
    href: "/paiements",
    icon: <CreditCard className="h-5 w-5" />,
    badge: "3",
    description: "Cotisations et factures"
  },
  {
    title: "Historique",
    href: "/historique",
    icon: <History className="h-5 w-5" />,
    description: "Journal des activités"
  },
  {
    title: "Utilisateurs",
    href: "/utilisateurs",
    icon: <Crown className="h-5 w-5" />,
    adminOnly: true,
    description: "Gestion des comptes"
  },
  {
    title: "Rapports",
    href: "/rapports",
    icon: <FileText className="h-5 w-5" />,
    description: "Certificats et documents"
  }
]

export function ModernSidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [notifications] = useState(5)
  const { blocNotifications, paiements } = useData()

  const filteredNavItems = navItems.filter(item => 
    !item.adminOnly || user?.role === "admin"
  )

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <Card 
      variant="glass" 
      className={`h-screen border-r border-l-0 border-t-0 border-b-0 rounded-none bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-72"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header avec logo */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Syndic Pro
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Gestion moderne
                  </p>
                </div>
              )}
            </div>
            
            {onToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="hidden lg:flex"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Profil utilisateur */}
        {!isCollapsed && (
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                  {user?.name || "Administrateur"}
                </p>
                <div className="flex items-center gap-1">
                  {user?.role === "admin" ? (
                    <>
                      <Crown className="h-3 w-3 text-amber-500" />
                      <span className="text-xs text-amber-600 dark:text-amber-400">Admin</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-3 w-3 text-blue-500" />
                      <span className="text-xs text-blue-600 dark:text-blue-400">Utilisateur</span>
                    </>
                  )}
                </div>
              </div>
              {notifications > 0 && (
                <div className="w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 p-4 overflow-y-auto">
          <nav className="space-y-2">
            {filteredNavItems.map((item) => {
              const active = isActive(item.href)
              let badgeValue = item.badge
              if (item.href === "/blocs-immeubles" && blocNotifications > 0) {
                badgeValue = blocNotifications.toString()
              }
              if (item.href === "/paiements") {
                badgeValue = paiements.length > 0 ? paiements.length.toString() : undefined
              }
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`
                    group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${active 
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25" 
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }
                    ${isCollapsed ? "justify-center" : ""}
                  `}>
                    <div className={`flex items-center justify-center ${active ? "text-white" : "text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"}`}>
                      {item.icon}
                    </div>
                    
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">
                            {item.title}
                          </span>
                          {badgeValue && (
                            <Badge variant="secondary" className={`ml-2 ${active ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"}`}>
                              {badgeValue}
                            </Badge>
                          )}
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${
                          active ? "text-white/80" : "text-slate-500 dark:text-slate-400"
                        }`}>
                          {item.description}
                        </p>
                      </div>
                    )}
                    
                    {/* Tooltip pour mode réduit */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.title}
                        {badgeValue && (
                          <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                            {badgeValue}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer avec actions rapides */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          {!isCollapsed && (
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                leftIcon={<Bell className="h-4 w-4" />}
              >
                <span>Notifications</span>
                {notifications > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {notifications}
                  </Badge>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                leftIcon={<Settings className="h-4 w-4" />}
              >
                Paramètres
              </Button>
            </div>
          )}
          
          {isCollapsed && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center relative"
              >
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </div>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
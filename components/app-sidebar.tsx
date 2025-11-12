"use client"

import type React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogOut, User, Home, Users, Wrench, Building2, CreditCard, History, Shield, Sparkles, Store } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    roles: ["admin", "user"],
    description: "Vue d'ensemble",
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Utilisateurs",
    url: "/utilisateurs",
    icon: Shield,
    roles: ["admin"],
    description: "Gestion des comptes",
    color: "from-red-500 to-pink-500"
  },
  {
    title: "Ouvriers",
    url: "/ouvriers",
    icon: Wrench,
    roles: ["admin", "user"],
    description: "Personnel de maintenance",
    color: "from-orange-500 to-amber-500"
  },
  {
    title: "Copropriétaires",
    url: "/coproprietaires",
    icon: Users,
    roles: ["admin", "user"],
    description: "Résidents de la copropriété",
    color: "from-emerald-500 to-teal-500"
  },
  {
    title: "Blocs & Immeubles",
    url: "/blocs-immeubles",
    icon: Building2,
    roles: ["admin", "user"],
    description: "Structure des bâtiments",
    color: "from-purple-500 to-violet-500"
  },
  {
    title: "Paiements",
    url: "/paiements",
    icon: CreditCard,
    roles: ["admin", "user"],
    description: "Gestion financière",
    color: "from-yellow-500 to-orange-500"
  },
  {
    title: "Historique",
    url: "/historique",
    icon: History,
    roles: ["admin"],
    description: "Journal des activités",
    color: "from-slate-500 to-gray-600"
  },
  {
    title: "Ventes",
    url: "/ventes",
    icon: Store,
    roles: ["admin", "user"],
    description: "Transferts de lots",
    color: "from-purple-500 to-amber-500"
  },
]

export function AppSidebar() {
  const { user, logout } = useAuth()

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user?.role || "user"))

  return (
    <Sidebar className="border-r-0 shadow-xl bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <SidebarHeader className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 px-6 py-4">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-800 dark:from-white dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
                Syndic
              </span>
              <span className="text-xl font-light text-slate-600 dark:text-slate-300">Pro</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Premium</span>
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300">
                v2.0
              </Badge>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-4 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className="group relative overflow-hidden rounded-xl border-0 p-0 h-auto hover:bg-transparent"
                  >
                    <a href={item.url} className="block">
                      <div className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-white/50 hover:to-slate-50/50 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50 hover:shadow-lg hover:scale-[1.02] group-hover:translate-x-1">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                          <item.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            {item.title}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                            {item.description}
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-6 space-y-4">
          {/* User Profile Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-800 dark:via-slate-800 dark:to-indigo-900 border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
            <div className="relative p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-transform hover:scale-105 ${
                    user?.role === "admin" 
                      ? "bg-gradient-to-br from-red-500 via-pink-500 to-rose-600" 
                      : "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600"
                  }`}>
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${
                    user?.role === "admin" ? "bg-red-500" : "bg-emerald-500"
                  }`}>
                    {user?.role === "admin" ? (
                      <Shield className="h-2 w-2 text-white m-1" />
                    ) : (
                      <User className="h-2 w-2 text-white m-1" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-white truncate">
                    {user?.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={user?.role === "admin" ? "destructive" : "secondary"}
                      className="text-xs px-2 py-0.5 font-medium"
                    >
                      {user?.role === "admin" ? (
                        <><Shield className="h-3 w-3 mr-1" />Admin</>
                      ) : (
                        <><User className="h-3 w-3 mr-1" />User</>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout} 
                  className="flex-1 h-9 text-sm font-medium transition-all hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:hover:bg-red-950 dark:hover:text-red-300 group"
                >
                  <LogOut className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
          
          {/* Footer Info */}
          <div className="text-center space-y-1">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              © 2024             </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Tous droits réservés
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

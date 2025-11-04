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

const SimpleIcon = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`w-4 h-4 flex items-center justify-center text-xs font-bold ${className}`}>{children}</div>
)

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: () => <SimpleIcon className="bg-blue-100 text-blue-600 rounded">📊</SimpleIcon>,
    roles: ["admin", "user"],
  },
  {
    title: "Ouvriers",
    url: "/ouvriers",
    icon: () => <SimpleIcon className="bg-orange-100 text-orange-600 rounded">🔧</SimpleIcon>,
    roles: ["admin", "user"],
  },
  {
    title: "Copropriétaires",
    url: "/coproprietaires",
    icon: () => <SimpleIcon className="bg-green-100 text-green-600 rounded">👥</SimpleIcon>,
    roles: ["admin", "user"],
  },
  {
    title: "Blocs & Immeubles",
    url: "/blocs-immeubles",
    icon: () => <SimpleIcon className="bg-purple-100 text-purple-600 rounded">🏢</SimpleIcon>,
    roles: ["admin", "user"],
  },
  {
    title: "Paiements",
    url: "/paiements",
    icon: () => <SimpleIcon className="bg-yellow-100 text-yellow-600 rounded">💳</SimpleIcon>,
    roles: ["admin", "user"],
  },
  {
    title: "Historique",
    url: "/historique",
    icon: () => <SimpleIcon className="bg-gray-100 text-gray-600 rounded">📋</SimpleIcon>,
    roles: ["admin"], // Only admin can see history
  },
]

export function AppSidebar() {
  const { user, logout } = useAuth()

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user?.role || "user"))

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white text-sm font-bold">
            S
          </div>
          <span className="font-bold text-lg">Syndic Pro</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">{user?.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="w-full bg-transparent">
            <span className="mr-2">🚪</span>
            Déconnexion
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/lib/theme-context"
import { Button } from "@/components/ui/button-enhanced"
import { Card } from "@/components/ui/card-enhanced"
import { 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Settings, 
  Bell, 
  Search,
  Menu,
  Crown,
  Shield,
  ChevronDown
} from "lucide-react"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"

interface ModernHeaderProps {
  onMenuToggle?: () => void
  title?: string
}

export function ModernHeader({ onMenuToggle, title = "Tableau de bord" }: ModernHeaderProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [notifications] = useState(3)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const getRoleIcon = () => {
    if (user?.role === "admin") return <Crown className="h-4 w-4 text-amber-500" />
    return <Shield className="h-4 w-4 text-blue-500" />
  }

  const getRoleLabel = () => {
    if (user?.role === "admin") return "Administrateur"
    return "Utilisateur"
  }

  const getRoleBadgeStyle = () => {
    if (user?.role === "admin") return "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200"
    return "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200"
  }

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <Card variant="glass" className="border-l-0 border-r-0 border-t-0 rounded-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden sm:block">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-800 dark:from-white dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Gestion immobilière moderne
            </p>
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="transition-transform hover:scale-110"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            )}
          </Button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  {user?.name || "Utilisateur"}
                </p>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${getRoleBadgeStyle()}`}>
                  {getRoleIcon()}
                  Mon Profil
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-600 dark:text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <Card variant="glass" className="absolute right-0 mt-2 w-56 shadow-2xl z-50 border border-slate-200/30 dark:border-slate-700/30">
                <div className="p-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg">
                      {user?.name?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                        {user?.name || "Utilisateur"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-4 space-y-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Mon Profil</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <Settings className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Paramètres</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => {
                        logout()
                        setShowUserMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-red-600 hover:text-red-700"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm font-medium">Déconnexion</span>
                    </button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
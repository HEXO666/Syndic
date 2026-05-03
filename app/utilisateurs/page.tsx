"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button-enhanced"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card-enhanced"
import { Badge } from "@/components/ui/badge"
import { ModernLayout } from "@/components/modern-layout"
import { useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"
import { UserForm } from "@/components/user-form"
import { UsersTable } from "@/components/users-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Users, Shield, User, Crown, Mail } from "lucide-react"

export default function UtilisateursPage() {
  const { user, isLoading, users, deleteUser } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  // Seuls les admins peuvent gérer les utilisateurs
  if (user.role !== "admin") {
    return (
      <ModernLayout title="Gestion des Utilisateurs">
        <div className="flex flex-col items-center justify-center py-20">
          <Shield className="h-20 w-20 text-red-500/60 mb-6" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Accès Refusé</h1>
          <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
            Vous devez être administrateur pour accéder à cette section de gestion des utilisateurs.
          </p>
        </div>
      </ModernLayout>
    )
  }

  const filteredUsers = users?.filter((u: any) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleEdit = (editUser: any) => {
    setSelectedUser(editUser)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setSelectedUser(null)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    if (id === user.id) {
      alert("Vous ne pouvez pas supprimer votre propre compte.")
      return
    }
    deleteUser?.(id)
  }

  const getRoleBadge = (role: string) => {
    if (role === "admin") {
      return (
        <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit">
          <Crown className="h-3 w-3" />
          Administrateur
        </Badge>
      )
    }
    return (
      <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 flex items-center gap-1 w-fit">
        <User className="h-3 w-3" />
        Utilisateur
      </Badge>
    )
  }

  return (
    <ModernLayout title="Gestion des Utilisateurs">
      <div className="p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-xl">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
                Gestion des Utilisateurs
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Gérez les comptes utilisateurs et leurs permissions d'accès
            </p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={handleAdd}
                variant="default"
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                Nouvel utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {selectedUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
                </DialogTitle>
                <DialogDescription>
                  {selectedUser 
                    ? "Modifiez les informations de l'utilisateur." 
                    : "Ajoutez un nouvel utilisateur au système."
                  }
                </DialogDescription>
              </DialogHeader>
              <UserForm 
                user={selectedUser}
                onSuccess={() => setIsFormOpen(false)}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((targetUser: any) => (
            <Card 
              key={targetUser.id} 
              variant="glass"
              className="group hover:shadow-2xl transition-all duration-300"
            >
              <div className="p-6 space-y-4">
                {/* User Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                      targetUser.role === "admin" 
                        ? "bg-gradient-to-br from-amber-500 to-orange-600" 
                        : "bg-gradient-to-br from-blue-500 to-indigo-600"
                    }`}>
                      {targetUser.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate">
                        {targetUser.name}
                      </h3>
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-sm truncate mt-1">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{targetUser.email}</span>
                      </div>
                    </div>
                  </div>
                  {targetUser.id === user.id && (
                    <Badge className="bg-blue-100 text-blue-800 border border-blue-200 text-xs">
                      Vous
                    </Badge>
                  )}
                </div>

                {/* Role Badge */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  {getRoleBadge(targetUser.role)}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(targetUser)}
                    className="gap-2 flex-1"
                  >
                    <Edit className="h-4 w-4" />
                    Modifier
                  </Button>
                  {targetUser.id !== user.id && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{targetUser.name}</strong> ? 
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(targetUser.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
              <Users className="h-12 w-12 text-slate-400 dark:text-slate-600" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {searchTerm ? "Aucun utilisateur trouvé" : "Aucun utilisateur configuré"}
            </p>
          </div>
        )}
      </div>
    </ModernLayout>
  )
}
"use client"

import { Button } from "@/components/ui/button-enhanced"
import { Card } from "@/components/ui/card-enhanced"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Mail, Phone, Shield } from "lucide-react"

interface UsersTableProps {
  users?: any[]
  onEdit?: (user: any) => void
  onDelete?: (userId: string) => void
}

export function UsersTable({ users = [], onEdit, onDelete }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">
          Aucun utilisateur trouvé
        </p>
      </div>
    )
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
      case "moderator":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
      case "user":
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
      case "suspended":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200"
      case "inactive":
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-200"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <Card
          key={user.id}
          variant="glass"
          className="p-4 border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300/50 dark:hover:border-slate-600/50 transition-all"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-center">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                @{user.username}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Mail className="h-4 w-4" />
              {user.email}
            </div>

            <div className="flex items-center gap-2">
              <Badge className={`${getRoleBadgeColor(user.role)}`}>
                {user.role === "admin" && <Shield className="h-3 w-3 mr-1 inline" />}
                {user.role}
              </Badge>
              <Badge className={getStatusBadgeColor(user.accountStatus)}>
                {user.accountStatus}
              </Badge>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit?.(user)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete?.(user.id)}
                className="text-red-600 hover:text-red-700 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

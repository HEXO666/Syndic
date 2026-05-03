"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button-enhanced"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card-enhanced"
import { AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react"

interface UserFormProps {
  user?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "user",
    accountStatus: user?.accountStatus || "active",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) newErrors.username = "Le nom d'utilisateur est requis"
    if (!formData.firstName.trim()) newErrors.firstName = "Le prénom est requis"
    if (!formData.lastName.trim()) newErrors.lastName = "Le nom de famille est requis"
    if (!formData.email.trim()) newErrors.email = "L'email est requis"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email invalide"
    if (!formData.phone.trim()) newErrors.phone = "Le téléphone est requis"
    if (!user && !formData.password) newErrors.password = "Le mot de passe est requis"
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSubmitted(true)
      setTimeout(() => {
        onSuccess?.()
      }, 1500)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-4">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {user ? "Utilisateur modifié" : "Utilisateur créé"}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-center">
          {user
            ? "Les informations de l'utilisateur ont été mises à jour avec succès."
            : "Le nouvel utilisateur a été créé avec succès."}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-semibold">
            Nom d'utilisateur
          </Label>
          <Input
            id="username"
            placeholder="john_doe"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className={errors.username ? "border-red-500" : ""}
          />
          {errors.username && (
            <div className="flex items-center gap-1 text-red-600 text-xs">
              <AlertCircle className="h-3 w-3" />
              {errors.username}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <div className="flex items-center gap-1 text-red-600 text-xs">
              <AlertCircle className="h-3 w-3" />
              {errors.email}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-semibold">
            Prénom
          </Label>
          <Input
            id="firstName"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className={errors.firstName ? "border-red-500" : ""}
          />
          {errors.firstName && (
            <div className="flex items-center gap-1 text-red-600 text-xs">
              <AlertCircle className="h-3 w-3" />
              {errors.firstName}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-semibold">
            Nom de famille
          </Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className={errors.lastName ? "border-red-500" : ""}
          />
          {errors.lastName && (
            <div className="flex items-center gap-1 text-red-600 text-xs">
              <AlertCircle className="h-3 w-3" />
              {errors.lastName}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-semibold">
          Téléphone
        </Label>
        <Input
          id="phone"
          placeholder="+212 6 12 34 56 78"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className={errors.phone ? "border-red-500" : ""}
        />
        {errors.phone && (
          <div className="flex items-center gap-1 text-red-600 text-xs">
            <AlertCircle className="h-3 w-3" />
            {errors.phone}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-semibold">
            Rôle
          </Label>
          <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
            <SelectTrigger id="role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Utilisateur</SelectItem>
              <SelectItem value="admin">Administrateur</SelectItem>
              <SelectItem value="moderator">Modérateur</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountStatus" className="text-sm font-semibold">
            Statut du compte
          </Label>
          <Select
            value={formData.accountStatus}
            onValueChange={(value) => setFormData({ ...formData, accountStatus: value })}
          >
            <SelectTrigger id="accountStatus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="suspended">Suspendu</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!user && (
        <Card variant="glass" className="p-4 border border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20">
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
              Sécurité du compte
            </h4>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 dark:text-slate-400"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold">
                Confirmer le mot de passe
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  {errors.confirmPassword}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="text-center">
        <button
          type="button"
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
        >
          Mot de passe oublié ?
        </button>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button
          type="button"
          variant="ghost"
          className="flex-1"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="default"
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? user
              ? "Modification..."
              : "Création..."
            : user
            ? "Modifier"
            : "Créer"}
        </Button>
      </div>
    </form>
  )
}

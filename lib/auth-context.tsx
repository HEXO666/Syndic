"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type UserRole = "admin" | "user"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  users: User[]
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  addUser: (userData: { name: string; email: string; role: UserRole; password: string }) => void
  updateUser: (id: string, userData: Partial<User & { password?: string }>) => void
  deleteUser: (id: string) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([
    { id: "1", email: "admin@syndic.com", name: "Administrateur", role: "admin" },
    { id: "2", email: "user@syndic.com", name: "Utilisateur", role: "user" },
  ])

  // Store user passwords separately (in real app, this would be hashed and stored securely)
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>({
    "1": "admin123",
    "2": "user123",
  })

  useEffect(() => {
    // Load data from localStorage only on client side
    if (typeof window !== "undefined") {
      const storedUser = window.localStorage.getItem("syndic-user")
      const storedUsers = window.localStorage.getItem("syndic-users")
      const storedPasswords = window.localStorage.getItem("syndic-passwords")
      
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers))
      }
      if (storedPasswords) {
        setUserPasswords(JSON.parse(storedPasswords))
      }
    }
    setIsLoading(false)
  }, [])

  // Save users to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("syndic-users", JSON.stringify(users))
    }
  }, [users])

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("syndic-passwords", JSON.stringify(userPasswords))
    }
  }, [userPasswords])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    const foundUser = users.find((u) => u.email === email && userPasswords[u.id] === password)

    if (foundUser) {
      setUser(foundUser)
      if (typeof window !== "undefined") {
        window.localStorage.setItem("syndic-user", JSON.stringify(foundUser))
      }
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("syndic-user")
    }
  }

  const addUser = (userData: { name: string; email: string; role: UserRole; password: string }) => {
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
    }
    
    setUsers(prev => [...prev, newUser])
    setUserPasswords(prev => ({ ...prev, [newUser.id]: userData.password }))
  }

  const updateUser = (id: string, userData: Partial<User & { password?: string }>) => {
    setUsers(prev => prev.map(u => 
      u.id === id 
        ? { ...u, ...userData } 
        : u
    ))
    
    if (userData.password) {
      setUserPasswords(prev => ({ ...prev, [id]: userData.password! }))
    }

    // Update current user if editing self
    if (user?.id === id) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      if (typeof window !== "undefined") {
        window.localStorage.setItem("syndic-user", JSON.stringify(updatedUser))
      }
    }
  }

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id))
    setUserPasswords(prev => {
      const newPasswords = { ...prev }
      delete newPasswords[id]
      return newPasswords
    })
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        users, 
        login, 
        logout, 
        addUser, 
        updateUser, 
        deleteUser, 
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-context"
import { LoginForm } from "@/components/login-form"
import { Search, History, User, Calendar, Activity, Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HistoriquePage() {
  const { user, isLoading } = useAuth()
  const { history } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAction, setFilterAction] = useState("all")
  const [filterEntity, setFilterEntity] = useState("all")
  const [filterUser, setFilterUser] = useState("all")

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  // Redirect non-admin users
  if (user.role !== "admin") {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <Alert>
                <AlertDescription>Accès refusé. Cette page est réservée aux administrateurs.</AlertDescription>
              </Alert>
            </div>
          </main>
        </div>
      </SidebarProvider>
    )
  }

  // Get unique values for filters
  const uniqueActions = Array.from(new Set(history.map((h) => h.action))).sort()
  const uniqueEntities = Array.from(new Set(history.map((h) => h.entity))).sort()
  const uniqueUsers = Array.from(new Set(history.map((h) => h.userName))).sort()

  // Filter history
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.entity.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAction = filterAction === "all" || item.action === filterAction
    const matchesEntity = filterEntity === "all" || item.entity === filterEntity
    const matchesUser = filterUser === "all" || item.userName === filterUser

    return matchesSearch && matchesAction && matchesEntity && matchesUser
  })

  // Group by date
  const groupedHistory = filteredHistory.reduce(
    (groups, item) => {
      const date = new Date(item.timestamp).toLocaleDateString("fr-FR")
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(item)
      return groups
    },
    {} as Record<string, typeof history>,
  )

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE":
        return "+"
      case "UPDATE":
        return "✏️"
      case "DELETE":
        return "🗑️"
      default:
        return "•"
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "text-green-600 bg-green-100"
      case "UPDATE":
        return "text-blue-600 bg-blue-100"
      case "DELETE":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case "Ouvrier":
        return "👷"
      case "Copropriétaire":
        return "👤"
      case "Paiement":
        return "💳"
      case "Profession":
        return "🔧"
      case "Certificat":
        return "📄"
      default:
        return "📋"
    }
  }

  const exportHistory = () => {
    const csvContent = [
      ["Date", "Heure", "Utilisateur", "Action", "Entité", "Détails"].join(","),
      ...filteredHistory.map((item) =>
        [
          new Date(item.timestamp).toLocaleDateString("fr-FR"),
          new Date(item.timestamp).toLocaleTimeString("fr-FR"),
          item.userName,
          item.action,
          item.entity,
          `"${item.details}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `historique-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Statistics
  const stats = {
    total: history.length,
    today: history.filter((h) => {
      const today = new Date().toDateString()
      return new Date(h.timestamp).toDateString() === today
    }).length,
    thisWeek: history.filter((h) => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(h.timestamp) > weekAgo
    }).length,
    byAction: uniqueActions.reduce(
      (acc, action) => {
        acc[action] = history.filter((h) => h.action === action).length
        return acc
      },
      {} as Record<string, number>,
    ),
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Historique des Actions</h1>
                <p className="text-muted-foreground">Suivi complet de toutes les activités du système</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportHistory}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter CSV
                </Button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">Depuis le début</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.today}</div>
                  <p className="text-xs text-muted-foreground">Actions du jour</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cette Semaine</CardTitle>
                  <History className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.thisWeek}</div>
                  <p className="text-xs text-muted-foreground">7 derniers jours</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{uniqueUsers.length}</div>
                  <p className="text-xs text-muted-foreground">Ont effectué des actions</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="timeline" className="space-y-4">
              <TabsList>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="statistics">Statistiques</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="space-y-4">
                {/* Filters */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher dans l'historique..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterAction} onValueChange={setFilterAction}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les actions</SelectItem>
                      {uniqueActions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterEntity} onValueChange={setFilterEntity}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Entité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les entités</SelectItem>
                      {uniqueEntities.map((entity) => (
                        <SelectItem key={entity} value={entity}>
                          {entity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterUser} onValueChange={setFilterUser}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les utilisateurs</SelectItem>
                      {uniqueUsers.map((userName) => (
                        <SelectItem key={userName} value={userName}>
                          {userName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge variant="secondary" className="text-sm">
                    {filteredHistory.length} action{filteredHistory.length > 1 ? "s" : ""}
                  </Badge>
                </div>

                {/* History Timeline */}
                <div className="space-y-6">
                  {Object.entries(groupedHistory)
                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                    .map(([date, items]) => (
                      <div key={date}>
                        <div className="flex items-center gap-2 mb-4">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-medium text-lg">{date}</h3>
                          <Badge variant="outline">{items.length} action(s)</Badge>
                        </div>
                        <div className="space-y-3 ml-6">
                          {items
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .map((item) => (
                              <Card key={item.id} className="hover:shadow-sm transition-shadow">
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-4">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${getActionColor(item.action)}`}
                                      >
                                        {getActionIcon(item.action)}
                                      </div>
                                      <div className="text-lg">{getEntityIcon(item.entity)}</div>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="text-xs">
                                          {item.action}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                          {item.entity}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(item.timestamp).toLocaleTimeString("fr-FR")}
                                        </span>
                                      </div>
                                      <p className="text-sm font-medium mb-1">{item.details}</p>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <User className="h-3 w-3" />
                                        <span>Par {item.userName}</span>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>

                {filteredHistory.length === 0 && (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucune action trouvée</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || filterAction !== "all" || filterEntity !== "all" || filterUser !== "all"
                        ? "Aucune action ne correspond à vos critères de recherche."
                        : "Aucune action n'a encore été enregistrée."}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="statistics" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Actions par Type</CardTitle>
                      <CardDescription>Répartition des actions effectuées</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(stats.byAction).map(([action, count]) => (
                          <div key={action} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${getActionColor(action)}`}
                              >
                                {getActionIcon(action)}
                              </div>
                              <span className="text-sm font-medium">{action}</span>
                            </div>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Utilisateurs les Plus Actifs</CardTitle>
                      <CardDescription>Classement par nombre d'actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {uniqueUsers
                          .map((userName) => ({
                            name: userName,
                            count: history.filter((h) => h.userName === userName).length,
                          }))
                          .sort((a, b) => b.count - a.count)
                          .slice(0, 5)
                          .map((user) => (
                            <div key={user.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{user.name}</span>
                              </div>
                              <Badge variant="secondary">{user.count} actions</Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

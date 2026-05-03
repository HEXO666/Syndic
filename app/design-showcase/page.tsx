"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button-enhanced"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card-enhanced"
import { Input } from "@/components/ui/input-enhanced"
import { ModernCoproprietaireForm } from "@/components/modern-coproprietaire-form"
import { ModernBlocForm, ModernImmeubleForm } from "@/components/modern-bloc-immeuble-forms"
import { ModernPaiementForm } from "@/components/modern-paiement-form"
import { 
  User, 
  Building2, 
  Home, 
  CreditCard, 
  Palette, 
  Sparkles,
  ArrowRight,
  Heart,
  Star,
  Zap
} from "lucide-react"

export default function DesignShowcase() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null)

  const demos = [
    {
      id: "buttons",
      title: "Boutons Enhanced",
      description: "Collection de boutons avec différents variants",
      icon: <Zap className="h-6 w-6" />,
    },
    {
      id: "cards",
      title: "Cartes modernes",
      description: "Cartes avec effets de glassmorphisme et gradients",
      icon: <Sparkles className="h-6 w-6" />,
    },
    {
      id: "inputs",
      title: "Champs de saisie",
      description: "Inputs avec variants modernes et animations",
      icon: <Palette className="h-6 w-6" />,
    },
    {
      id: "coproprietaire",
      title: "Form. Copropriétaire",
      description: "Formulaire multi-étapes pour les copropriétaires",
      icon: <User className="h-6 w-6" />,
    },
    {
      id: "bloc",
      title: "Form. Bloc",
      description: "Formulaire pour la gestion des blocs",
      icon: <Building2 className="h-6 w-6" />,
    },
    {
      id: "immeuble",
      title: "Form. Immeuble",
      description: "Formulaire pour les immeubles",
      icon: <Home className="h-6 w-6" />,
    },
    {
      id: "paiement",
      title: "Form. Paiement",
      description: "Formulaire avancé de gestion des paiements",
      icon: <CreditCard className="h-6 w-6" />,
    },
  ]

  const renderButtonShowcase = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Variants de base</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Variants Enhanced</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="success" leftIcon={<Star className="h-4 w-4" />}>Success</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="secondary" rightIcon={<ArrowRight className="h-4 w-4" />}>Secondary</Button>
          <Button variant="default" leftIcon={<Sparkles className="h-4 w-4" />}>Premium</Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Tailles</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="lg">Extra Large</Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">États</h3>
        <div className="flex flex-wrap gap-4">
          <Button loading>Loading...</Button>
          <Button disabled>Disabled</Button>
          <Button variant="default" leftIcon={<Heart className="h-4 w-4" />} rightIcon={<Star className="h-4 w-4" />}>
            With Icons
          </Button>
        </div>
      </div>
    </div>
  )

  const renderCardShowcase = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card variant="default">
        <CardHeader>
          <CardTitle>Carte Default</CardTitle>
          <CardDescription>Style par défaut</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Contenu de la carte avec le style standard.</p>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Carte Elevated</CardTitle>
          <CardDescription>Avec ombre prononcée</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Carte avec une élévation marquée pour attirer l'attention.</p>
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Carte Glass</CardTitle>
          <CardDescription>Effet glassmorphisme</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Carte avec effet de verre dépoli et transparence.</p>
        </CardContent>
      </Card>

      <Card variant="gradient">
        <CardHeader>
          <CardTitle>Carte Gradient</CardTitle>
          <CardDescription>Bordures colorées</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Carte avec des bordures dégradées colorées.</p>
        </CardContent>
      </Card>

      <Card variant="default">
        <CardHeader>
          <CardTitle>Carte Premium</CardTitle>
          <CardDescription>Style haut de gamme</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Carte avec un design premium et des effets sophistiqués.</p>
        </CardContent>
      </Card>

      <Card variant="interactive">
        <CardHeader>
          <CardTitle>Carte Interactive</CardTitle>
          <CardDescription>Hover effects</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Carte avec des effets au survol et interactions.</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderInputShowcase = () => (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">Variants d'inputs</h3>
        <div className="space-y-4">
          <Input 
            variant="default" 
            label="Input Default" 
            placeholder="Saisie standard" 
          />
          <Input 
            variant="modern" 
            label="Input Modern" 
            placeholder="Style moderne" 
            leftIcon={<User className="h-4 w-4" />}
          />
          <Input 
            variant="glass" 
            label="Input Glass" 
            placeholder="Effet glassmorphisme" 
          />
          <Input 
            variant="floating" 
            label="Input Floating" 
            placeholder="Label flottant" 
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Avec icônes et états</h3>
        <div className="space-y-4">
          <Input 
            variant="modern" 
            label="Email" 
            type="email"
            placeholder="votre.email@exemple.com" 
            leftIcon={<User className="h-4 w-4" />}
          />
          <Input 
            variant="modern" 
            label="Mot de passe" 
            type="password"
            placeholder="••••••••" 
          />
          <Input 
            variant="modern" 
            label="Montant" 
            type="number"
            placeholder="0.00" 
            leftIcon={<CreditCard className="h-4 w-4" />}
            error="Veuillez saisir un montant valide"
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-indigo-700 dark:from-white dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent mb-4">
            Design System Showcase
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Démonstration des composants modernisés de l'application Syndic
          </p>
        </div>

        {!activeDemo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {demos.map((demo) => (
              <Card 
                key={demo.id} 
                variant="interactive" 
                className="cursor-pointer"
                onClick={() => setActiveDemo(demo.id)}
              >
                <CardHeader className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                    {demo.icon}
                  </div>
                  <CardTitle className="text-xl">{demo.title}</CardTitle>
                  <CardDescription>{demo.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="outline" className="w-full">
                    Voir la démo <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="outline" onClick={() => setActiveDemo(null)}>
                ← Retour
              </Button>
              <h2 className="text-2xl font-bold">
                {demos.find(d => d.id === activeDemo)?.title}
              </h2>
            </div>

            <Card variant="default" className="p-8">
              {activeDemo === "buttons" && renderButtonShowcase()}
              {activeDemo === "cards" && renderCardShowcase()}
              {activeDemo === "inputs" && renderInputShowcase()}
              {activeDemo === "coproprietaire" && (
                <ModernCoproprietaireForm 
                  onSuccess={() => alert("Copropriétaire ajouté!")} 
                  onCancel={() => setActiveDemo(null)}
                />
              )}
              {activeDemo === "bloc" && (
                <ModernBlocForm 
                  onSuccess={() => alert("Bloc ajouté!")} 
                  onCancel={() => setActiveDemo(null)}
                />
              )}
              {activeDemo === "immeuble" && (
                <ModernImmeubleForm 
                  blocId="demo-bloc" 
                  bloqueName="Bloc Démo"
                  onSuccess={() => alert("Immeuble ajouté!")} 
                  onCancel={() => setActiveDemo(null)}
                />
              )}
              {activeDemo === "paiement" && (
                <ModernPaiementForm 
                  onSuccess={() => alert("Paiement ajouté!")} 
                  onCancel={() => setActiveDemo(null)}
                />
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
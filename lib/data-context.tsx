"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

export type MetierOuvrier = "jardinier" | "securite" | "femme-de-menage" | "maintenance" | "autre"

export interface Ouvrier {
  id: string
  nom: string
  prenom: string
  adresse: string
  telephoneMaroc: string
  metier: MetierOuvrier | string
  statut: "actif" | "inactif" // Possibilité de désactiver sans supprimer
  dateAjout: string
}

export interface Profession {
  id: string
  nom: string
  description?: string
  dateAjout: string
}

export interface Coproprietaire {
  id: string
  nom: string
  prenom: string
  adresse: string
  cin: string
  telephone: string
  telephoneEtranger?: string // Téléphone étranger (optionnel)
  bloque: string
  immeuble: string
  numeroAppartement: string
  titreFoncier: string // Renommé pour être plus clair
  montantAnnuel: number // Montant annuel fixe (1200 DH)
  totalDettes: number // Total des dettes accumulées
  dateAjout: string
}

export interface ActionHistory {
  id: string
  action: string
  entity: string
  entityId: string
  userId: string
  userName: string
  timestamp: string
  details: string
}

export interface Paiement {
  id: string
  coproprietaireId: string
  coproprietaireNom: string
  montant: number
  annee: string // Année de paiement (2024, 2025, etc.)
  montantDu: number // Montant total dû (1200 DH par défaut)
  montantRestant: number // Montant restant à payer après paiement partiel
  datePaiement: string
  statut: "paye" | "impaye" | "partiel" // Simplifié les statuts
  methodePaiement: "especes" | "cheque" | "virement" // Supprimé carte, ajusté selon spécifications
  numeroCheque?: string // Pour les paiements par chèque
  numeroVirement?: string // Pour les paiements par virement
  preuvePaiement?: string // URL ou base64 de la preuve de paiement
  notes?: string
  dateAjout: string
}

export interface Vente {
  id: string
  vendeurId: string
  vendeurNom: string
  vendeurContact?: string
  acheteurNom: string
  acheteurContact?: string
  acheteurEmail?: string
  blocId: string
  blocNom: string
  immeubleId: string
  immeubleNom: string
  numeroAppartement: string
  dateVente?: string
  dateQuitus: string
  notes?: string
  dateCreation: string
}

export interface CertificatPaiement {
  id: string
  coproprietaireId: string
  coproprietaireNom: string
  periode: string
  montantTotal: number
  paiements: Paiement[]
  dateGeneration: string
}

export interface ArrieresCoproprietaire {
  coproprietaireId: string
  coproprietaireNom: string
  montantTotal: number // Montant total des arriérés
  anneesImpayees: string[] // Liste des années non payées
  dernierPaiement?: string // Date du dernier paiement
}

export interface Bloque {
  id: string
  nom: string
  description?: string
  dateAjout: string
}

export interface Immeuble {
  id: string
  nom: string
  bloqueId: string
  bloqueName: string
  description?: string
  dateAjout: string
}

interface DataContextType {
  // Ouvriers
  ouvriers: Ouvrier[]
  addOuvrier: (ouvrier: Omit<Ouvrier, "id" | "dateAjout" | "statut">) => void
  updateOuvrier: (id: string, ouvrier: Partial<Ouvrier>) => void
  deleteOuvrier: (id: string) => void
  toggleOuvrierStatut: (id: string) => void // Activer/désactiver sans supprimer

  // Copropriétaires
  coproprietaires: Coproprietaire[]
  addCoproprietaire: (coproprietaire: Omit<Coproprietaire, "id" | "dateAjout" | "montantAnnuel" | "totalDettes">) => void
  updateCoproprietaire: (id: string, coproprietaire: Partial<Coproprietaire>) => void
  deleteCoproprietaire: (id: string) => void

  // Professions
  professions: Profession[]
  addProfession: (profession: Omit<Profession, "id" | "dateAjout">) => void
  updateProfession: (id: string, profession: Partial<Profession>) => void
  deleteProfession: (id: string) => void
  getProfessionsList: () => string[] // Pour les select/dropdown

  // Historique
  history: ActionHistory[]
  addToHistory: (action: string, entity: string, entityId: string, details: string) => void

  // Paiements
  paiements: Paiement[]
  addPaiement: (paiement: Omit<Paiement, "id" | "dateAjout">) => void
  updatePaiement: (id: string, paiement: Partial<Paiement>) => void
  deletePaiement: (id: string) => void
  getPaiementsByCoproprietaire: (coproprietaireId: string) => Paiement[]
  getArrieres: () => Paiement[]
  generateCertificat: (coproprietaireId: string, periode: string) => CertificatPaiement

  // Certificats
  certificats: CertificatPaiement[]

  getArrieresByCoproprietaire: (coproprietaireId: string) => ArrieresCoproprietaire
  getAllArrieres: () => ArrieresCoproprietaire[]
  payerCotisationAnnuelle: (
    coproprietaireId: string,
    annee: string,
    montant: number,
    methode: string,
    numeroRef?: string,
  ) => void

  // Blocs
  blocs: Bloque[]
  addBloc: (bloc: Omit<Bloque, "id" | "dateAjout">) => void
  updateBloc: (id: string, bloc: Partial<Bloque>) => void
  deleteBloc: (id: string) => void

  // Immeubles
  immeubles: Immeuble[]
  addImmeuble: (immeuble: Omit<Immeuble, "id" | "dateAjout">) => void
  updateImmeuble: (id: string, immeuble: Partial<Immeuble>) => void
  deleteImmeuble: (id: string) => void
  getImmeublesByBloc: (bloqueId: string) => Immeuble[]

  // UI notifications
  blocNotifications: number
  clearBlocNotifications: () => void

  // Ventes
  ventes: Vente[]
  addVente: (vente: Omit<Vente, "id" | "dateCreation">) => void
  updateVente: (id: string, vente: Partial<Vente>) => void
  deleteVente: (id: string) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const COTISATION_ANNUELLE = 1200 // Montant fixe de 1200 DH par an

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [ouvriers, setOuvriers] = useState<Ouvrier[]>(() => {
    const now = new Date().toISOString()
    return [
      {
        id: "ouvrier-1",
        nom: "Hassan",
        prenom: "Ahmed",
        adresse: "67 Rue des Fleurs, Casablanca",
        telephoneMaroc: "+212 6 98 76 54 32",
        metier: "jardinier",
        statut: "actif",
        dateAjout: now,
      },
      {
        id: "ouvrier-2",
        nom: "Benani",
        prenom: "Fatima",
        adresse: "89 Avenue Mohammed V, Fès",
        telephoneMaroc: "+212 7 12 34 56 78",
        metier: "femme-de-menage",
        statut: "actif",
        dateAjout: now,
      },
      {
        id: "ouvrier-3",
        nom: "Karim",
        prenom: "Youssef",
        adresse: "34 Boulevard Zerktouni, Rabat",
        telephoneMaroc: "+212 6 55 44 33 22",
        metier: "securite",
        statut: "actif",
        dateAjout: now,
      },
    ]
  })
  const [coproprietaires, setCoproprietaires] = useState<Coproprietaire[]>(() => {
    const now = new Date().toISOString()
    return [
      {
        id: "copro-1",
        nom: "Bennani",
        prenom: "Samir",
        adresse: "45 Rue des Jasmins, Casablanca",
        cin: "AA123456",
        telephone: "+212 6 22 44 55 66",
  telephoneEtranger: "",
        bloque: "Bloc Atlas",
        immeuble: "Atlas 1",
        numeroAppartement: "A12",
        titreFoncier: "TF-AT-2023-12",
        montantAnnuel: COTISATION_ANNUELLE,
        totalDettes: 0,
        dateAjout: now,
      },
      {
        id: "copro-2",
        nom: "El Amrani",
        prenom: "Imane",
        adresse: "12 Avenue Zerktouni, Marrakech",
        cin: "BB654321",
        telephone: "+212 6 55 11 22 33",
  telephoneEtranger: "",
        bloque: "Bloc Atlas",
        immeuble: "Atlas 2",
        numeroAppartement: "B08",
        titreFoncier: "TF-AT-2022-08",
        montantAnnuel: COTISATION_ANNUELLE,
        totalDettes: 0,
        dateAjout: now,
      },
    ]
  })
  const [professions, setProfessions] = useState<Profession[]>([
    { id: "1", nom: "Ménage", description: "Service de nettoyage", dateAjout: new Date().toISOString() },
    { id: "2", nom: "Sécurité", description: "Gardiennage et surveillance", dateAjout: new Date().toISOString() },
    { id: "3", nom: "Jardinage", description: "Entretien des espaces verts", dateAjout: new Date().toISOString() },
  ])
  const [history, setHistory] = useState<ActionHistory[]>([])
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [certificats, setCertificats] = useState<CertificatPaiement[]>([])
  const [blocs, setBlocs] = useState<Bloque[]>(() => {
    const now = new Date().toISOString()
    return [
      { id: "bloc-atlas", nom: "Bloc Atlas", description: "Résidence Atlas", dateAjout: now },
      { id: "bloc-cedre", nom: "Bloc Cèdre", description: "Quartier jardin", dateAjout: now },
    ]
  })
  const [immeubles, setImmeubles] = useState<Immeuble[]>(() => {
    const now = new Date().toISOString()
    return [
      {
        id: "immeuble-atlas-1",
        nom: "Atlas 1",
        bloqueId: "bloc-atlas",
        bloqueName: "Bloc Atlas",
        description: "Entrée principale",
        dateAjout: now,
      },
      {
        id: "immeuble-atlas-2",
        nom: "Atlas 2",
        bloqueId: "bloc-atlas",
        bloqueName: "Bloc Atlas",
        description: "Résidence sud",
        dateAjout: now,
      },
      {
        id: "immeuble-cedre-1",
        nom: "Cèdre 1",
        bloqueId: "bloc-cedre",
        bloqueName: "Bloc Cèdre",
        description: "Vue sur jardin",
        dateAjout: now,
      },
    ]
  })
  const [blocNotifications, setBlocNotifications] = useState<number>(0)
  const [ventes, setVentes] = useState<Vente[]>(() => {
    const now = new Date()
    const venteDate = new Date(now)
    venteDate.setMonth(venteDate.getMonth() - 1)
    return [
      {
        id: "vente-1",
        vendeurId: "copro-1",
        vendeurNom: "Samir Bennani",
        vendeurContact: "+212 6 22 44 55 66",
        acheteurNom: "Nadia El Fassi",
        acheteurContact: "+212 6 77 88 99 00",
        acheteurEmail: "nadia.elfassi@example.com",
        blocId: "bloc-atlas",
        blocNom: "Bloc Atlas",
        immeubleId: "immeuble-atlas-1",
        immeubleNom: "Atlas 1",
        numeroAppartement: "A12",
        dateVente: venteDate.toISOString(),
        dateQuitus: now.toISOString(),
        notes: "Quitus délivré après contrôle des charges et travaux.",
        dateCreation: now.toISOString(),
      },
    ]
  })

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    const storedOuvriers = window.localStorage.getItem("syndic-ouvriers")
    const storedCoproprietaires = window.localStorage.getItem("syndic-coproprietaires")
    const storedProfessions = window.localStorage.getItem("syndic-professions")
    const storedHistory = window.localStorage.getItem("syndic-history")
    const storedPaiements = window.localStorage.getItem("syndic-paiements")
    const storedCertificats = window.localStorage.getItem("syndic-certificats")
    const storedBlocs = window.localStorage.getItem("syndic-blocs")
    const storedImmeubles = window.localStorage.getItem("syndic-immeubles")
    const storedVentes = window.localStorage.getItem("syndic-ventes")
    const storedBlocNotifications = window.localStorage.getItem("syndic-bloc-notifications")

    if (storedOuvriers) {
      try {
        const parsed = JSON.parse(storedOuvriers)
        const normalized: Ouvrier[] = Array.isArray(parsed)
          ? parsed.map((item: any) => ({
              id: item.id ?? Date.now().toString(),
              nom: item.nom ?? "",
              prenom: item.prenom ?? "",
              adresse: item.adresse ?? "",
              telephoneMaroc: item.telephoneMaroc ?? item.telephone ?? "+212",
              metier: item.metier ?? item.profession ?? "autre",
              statut: item.statut === "inactif" ? "inactif" : "actif",
              dateAjout: item.dateAjout ?? new Date().toISOString(),
            }))
          : []
        setOuvriers(normalized)
      } catch (error) {
        console.error("Erreur lors du chargement des ouvriers:", error)
      }
    }
    if (storedCoproprietaires) setCoproprietaires(JSON.parse(storedCoproprietaires))
    if (storedProfessions) setProfessions(JSON.parse(storedProfessions))
    if (storedHistory) setHistory(JSON.parse(storedHistory))
    if (storedPaiements) setPaiements(JSON.parse(storedPaiements))
    if (storedCertificats) setCertificats(JSON.parse(storedCertificats))
    if (storedBlocs) setBlocs(JSON.parse(storedBlocs))
    if (storedImmeubles) setImmeubles(JSON.parse(storedImmeubles))
    if (storedVentes) setVentes(JSON.parse(storedVentes))
    if (storedBlocNotifications) setBlocNotifications(Number.parseInt(storedBlocNotifications, 10) || 0)
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("syndic-ouvriers", JSON.stringify(ouvriers))
  }, [ouvriers])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("syndic-coproprietaires", JSON.stringify(coproprietaires))
  }, [coproprietaires])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("syndic-professions", JSON.stringify(professions))
  }, [professions])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("syndic-history", JSON.stringify(history))
  }, [history])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("syndic-paiements", JSON.stringify(paiements))
  }, [paiements])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("syndic-certificats", JSON.stringify(certificats))
  }, [certificats])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("syndic-blocs", JSON.stringify(blocs))
  }, [blocs])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("syndic-immeubles", JSON.stringify(immeubles))
  }, [immeubles])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("syndic-ventes", JSON.stringify(ventes))
  }, [ventes])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("syndic-bloc-notifications", blocNotifications.toString())
  }, [blocNotifications])
  const incrementBlocNotifications = useCallback(() => {
    setBlocNotifications((prev) => prev + 1)
  }, [])

  const clearBlocNotifications = useCallback(() => {
    setBlocNotifications(0)
  }, [])


  // Constante pour le montant annuel selon cahier des charges  
  const addToHistory = (action: string, entity: string, entityId: string, details: string) => {
    const user = typeof window !== "undefined"
      ? JSON.parse(window.localStorage.getItem("syndic-user") || "{}")
      : {}
    const newHistoryItem: ActionHistory = {
      id: Date.now().toString(),
      action,
      entity,
      entityId,
      userId: user.id || "",
      userName: user.name || "",
      timestamp: new Date().toISOString(),
      details,
    }
    setHistory((prev) => [newHistoryItem, ...prev])
  }

  const addOuvrier = (ouvrier: Omit<Ouvrier, "id" | "dateAjout" | "statut">) => {
    const newOuvrier: Ouvrier = {
      ...ouvrier,
      id: Date.now().toString(),
      statut: "actif", // Par défaut actif
      dateAjout: new Date().toISOString(),
    }
    setOuvriers((prev) => [...prev, newOuvrier])
    addToHistory(
      "CREATE",
      "Ouvrier",
      newOuvrier.id,
      `Ajout de ${newOuvrier.prenom} ${newOuvrier.nom} (${newOuvrier.metier})`,
    )
  }

  const toggleOuvrierStatut = (id: string) => {
    setOuvriers((prev) =>
      prev.map((ouvrier) =>
        ouvrier.id === id
          ? { ...ouvrier, statut: ouvrier.statut === "actif" ? "inactif" : "actif" }
          : ouvrier,
      ),
    )
    const ouvrier = ouvriers.find((o) => o.id === id)
    if (ouvrier) {
      const nextStatus = ouvrier.statut === "actif" ? "inactif" : "actif"
      addToHistory(
        "UPDATE",
        "Ouvrier",
        id,
        `Statut de ${ouvrier.prenom} ${ouvrier.nom} mis à ${nextStatus}`,
      )
    }
  }

  const updateOuvrier = (id: string, updates: Partial<Ouvrier>) => {
    setOuvriers((prev) => prev.map((ouvrier) => (ouvrier.id === id ? { ...ouvrier, ...updates } : ouvrier)))
    const ouvrier = ouvriers.find((o) => o.id === id)
    if (ouvrier) {
      const nextPrenom = updates.prenom ?? ouvrier.prenom
      const nextNom = updates.nom ?? ouvrier.nom
      addToHistory("UPDATE", "Ouvrier", id, `Modification de ${nextPrenom} ${nextNom}`)
    }
  }

  const deleteOuvrier = (id: string) => {
    const ouvrier = ouvriers.find((o) => o.id === id)
    setOuvriers((prev) => prev.filter((ouvrier) => ouvrier.id !== id))
    if (ouvrier) {
      addToHistory("DELETE", "Ouvrier", id, `Suppression de ${ouvrier.prenom} ${ouvrier.nom}`)
    }
  }

  const addCoproprietaire = (coproprietaire: Omit<Coproprietaire, "id" | "dateAjout" | "montantAnnuel" | "totalDettes">) => {
    const newCoproprietaire: Coproprietaire = {
      ...coproprietaire,
      id: Date.now().toString(),
      montantAnnuel: COTISATION_ANNUELLE,
      totalDettes: 0, // Initialement aucune dette
      dateAjout: new Date().toISOString(),
    }
    setCoproprietaires((prev) => [...prev, newCoproprietaire])
    addToHistory(
      "CREATE",
      "Copropriétaire",
      newCoproprietaire.id,
      `Ajout de ${coproprietaire.prenom} ${coproprietaire.nom}`,
    )
  }

  const updateCoproprietaire = (id: string, updates: Partial<Coproprietaire>) => {
    setCoproprietaires((prev) =>
      prev.map((coproprietaire) => (coproprietaire.id === id ? { ...coproprietaire, ...updates } : coproprietaire)),
    )
    const coproprietaire = coproprietaires.find((c) => c.id === id)
    if (coproprietaire) {
      addToHistory("UPDATE", "Copropriétaire", id, `Modification de ${coproprietaire.prenom} ${coproprietaire.nom}`)
    }
  }

  const deleteCoproprietaire = (id: string) => {
    const coproprietaire = coproprietaires.find((c) => c.id === id)
    setCoproprietaires((prev) => prev.filter((coproprietaire) => coproprietaire.id !== id))
    if (coproprietaire) {
      addToHistory("DELETE", "Copropriétaire", id, `Suppression de ${coproprietaire.prenom} ${coproprietaire.nom}`)
    }
  }

  const addProfession = (profession: Omit<Profession, "id" | "dateAjout">) => {
    const existingProfession = professions.find(p => p.nom.toLowerCase() === profession.nom.toLowerCase())
    if (!existingProfession) {
      const newProfession: Profession = {
        ...profession,
        id: Date.now().toString(),
        dateAjout: new Date().toISOString(),
      }
      setProfessions((prev) => [...prev, newProfession])
      addToHistory("CREATE", "Profession", newProfession.id, `Ajout de la profession: ${profession.nom}`)
    }
  }

  const updateProfession = (id: string, updates: Partial<Profession>) => {
    setProfessions((prev) => prev.map((profession) => 
      profession.id === id ? { ...profession, ...updates } : profession
    ))
    const profession = professions.find((p) => p.id === id)
    if (profession) {
      addToHistory("UPDATE", "Profession", id, `Modification de la profession: ${profession.nom}`)
    }
  }

  const deleteProfession = (id: string) => {
    const profession = professions.find((p) => p.id === id)
    setProfessions((prev) => prev.filter((profession) => profession.id !== id))
    if (profession) {
      addToHistory("DELETE", "Profession", id, `Suppression de la profession: ${profession.nom}`)
    }
  }

  const getProfessionsList = (): string[] => {
    return professions.map(p => p.nom)
  }

  const addPaiement = (paiement: Omit<Paiement, "id" | "dateAjout">) => {
    const newPaiement: Paiement = {
      ...paiement,
      id: Date.now().toString(),
      dateAjout: new Date().toISOString(),
    }
    setPaiements((prev) => [...prev, newPaiement])
    incrementBlocNotifications()
    addToHistory(
      "CREATE",
      "Paiement",
      newPaiement.id,
      `Paiement de ${paiement.montant}€ - ${paiement.coproprietaireNom}`,
    )
  }

  const updatePaiement = (id: string, updates: Partial<Paiement>) => {
    setPaiements((prev) => prev.map((paiement) => (paiement.id === id ? { ...paiement, ...updates } : paiement)))
    const paiement = paiements.find((p) => p.id === id)
    if (paiement) {
      addToHistory("UPDATE", "Paiement", id, `Modification paiement - ${paiement.coproprietaireNom}`)
    }
  }

  const deletePaiement = (id: string) => {
    const paiement = paiements.find((p) => p.id === id)
    setPaiements((prev) => prev.filter((paiement) => paiement.id !== id))
    if (paiement) {
      addToHistory("DELETE", "Paiement", id, `Suppression paiement - ${paiement.coproprietaireNom}`)
    }
  }

  const getPaiementsByCoproprietaire = (coproprietaireId: string) => {
    return paiements.filter((p) => p.coproprietaireId === coproprietaireId)
  }

  const getArrieresByCoproprietaire = (coproprietaireId: string): ArrieresCoproprietaire => {
    const coproprietaire = coproprietaires.find((c) => c.id === coproprietaireId)
    const paiementsCopro = paiements.filter((p) => p.coproprietaireId === coproprietaireId && p.statut === "paye")

    const currentYear = new Date().getFullYear()
    const anneesPayees = paiementsCopro.map((p) => p.annee)
    const anneesImpayees: string[] = []

    // Vérifier les 10 dernières années (ajustable)
    for (let year = currentYear - 10; year <= currentYear; year++) {
      if (!anneesPayees.includes(year.toString())) {
        anneesImpayees.push(year.toString())
      }
    }

    const dernierPaiement = paiementsCopro.sort(
      (a, b) => new Date(b.datePaiement).getTime() - new Date(a.datePaiement).getTime(),
    )[0]

    return {
      coproprietaireId,
      coproprietaireNom: coproprietaire ? `${coproprietaire.prenom} ${coproprietaire.nom}` : "",
      montantTotal: anneesImpayees.length * COTISATION_ANNUELLE,
      anneesImpayees,
      dernierPaiement: dernierPaiement?.datePaiement,
    }
  }

  const getAllArrieres = (): ArrieresCoproprietaire[] => {
    return coproprietaires.map((c) => getArrieresByCoproprietaire(c.id)).filter((arrieres) => arrieres.montantTotal > 0)
  }

  const payerCotisationAnnuelle = (
    coproprietaireId: string,
    annee: string,
    montant: number,
    methode: string,
    numeroRef?: string,
  ) => {
    const coproprietaire = coproprietaires.find((c) => c.id === coproprietaireId)
    if (!coproprietaire) return

    const montantDu = 1200 // Montant annuel fixe selon cahier des charges
    const montantRestant = Math.max(0, montantDu - montant)
    
    const nouveauPaiement: Paiement = {
      id: Date.now().toString(),
      coproprietaireId,
      coproprietaireNom: `${coproprietaire.prenom} ${coproprietaire.nom}`,
      montant,
      montantDu,
      montantRestant,
      annee,
      datePaiement: new Date().toISOString(),
      statut: montantRestant === 0 ? "paye" : "partiel",
      methodePaiement: methode as "especes" | "cheque" | "virement",
      numeroCheque: methode === "cheque" ? numeroRef : undefined,
      numeroVirement: methode === "virement" ? numeroRef : undefined,
      dateAjout: new Date().toISOString(),
    }

    setPaiements((prev) => [...prev, nouveauPaiement])
    addToHistory(
      "CREATE",
      "Paiement",
      nouveauPaiement.id,
      `Paiement cotisation ${annee} - ${montant} DH - ${coproprietaire.prenom} ${coproprietaire.nom}`,
    )
  }

  const getArrieres = () => {
    return getAllArrieres().flatMap((arrieres) =>
      arrieres.anneesImpayees.map((annee) => ({
        id: `${arrieres.coproprietaireId}-${annee}`,
        coproprietaireId: arrieres.coproprietaireId,
        coproprietaireNom: arrieres.coproprietaireNom,
        montant: 0, // Montant payé = 0 pour arriérés
        montantDu: 1200, // Montant annuel fixe
        montantRestant: 1200, // Tout reste à payer
        annee,
        datePaiement: "",
        statut: "impaye" as const,
        methodePaiement: "especes" as const,
        dateAjout: "",
      })),
    )
  }

  const generateCertificat = (coproprietaireId: string, periode: string) => {
    const coproprietaire = coproprietaires.find((c) => c.id === coproprietaireId)
    const paiementsPeriode = paiements.filter(
      (p) => p.coproprietaireId === coproprietaireId && p.annee === periode && p.statut === "paye",
    )

    const certificat: CertificatPaiement = {
      id: Date.now().toString(),
      coproprietaireId,
      coproprietaireNom: coproprietaire ? `${coproprietaire.prenom} ${coproprietaire.nom}` : "",
      periode,
      montantTotal: paiementsPeriode.reduce((sum, p) => sum + p.montant, 0),
      paiements: paiementsPeriode,
      dateGeneration: new Date().toISOString(),
    }

    setCertificats((prev) => [...prev, certificat])
    addToHistory("CREATE", "Certificat", certificat.id, `Certificat généré pour ${certificat.coproprietaireNom}`)

    return certificat
  }

  const addBloc = (bloc: Omit<Bloque, "id" | "dateAjout">) => {
    const newBloc: Bloque = {
      ...bloc,
      id: Date.now().toString(),
      dateAjout: new Date().toISOString(),
    }
    setBlocs((prev) => [...prev, newBloc])
    addToHistory("CREATE", "Bloc", newBloc.id, `Ajout du bloc: ${bloc.nom}`)
  }

  const updateBloc = (id: string, updates: Partial<Bloque>) => {
    setBlocs((prev) => prev.map((bloc) => (bloc.id === id ? { ...bloc, ...updates } : bloc)))
    const bloc = blocs.find((b) => b.id === id)
    if (bloc) {
      addToHistory("UPDATE", "Bloc", id, `Modification du bloc: ${bloc.nom}`)
    }
  }

  const deleteBloc = (id: string) => {
    const bloc = blocs.find((b) => b.id === id)
    setBlocs((prev) => prev.filter((bloc) => bloc.id !== id))
    // Supprimer aussi les immeubles de ce bloc
    setImmeubles((prev) => prev.filter((immeuble) => immeuble.bloqueId !== id))
    if (bloc) {
      addToHistory("DELETE", "Bloc", id, `Suppression du bloc: ${bloc.nom}`)
    }
  }

  const addImmeuble = (immeuble: Omit<Immeuble, "id" | "dateAjout">) => {
    const newImmeuble: Immeuble = {
      ...immeuble,
      id: Date.now().toString(),
      dateAjout: new Date().toISOString(),
    }
    setImmeubles((prev) => [...prev, newImmeuble])
    addToHistory("CREATE", "Immeuble", newImmeuble.id, `Ajout de l'immeuble: ${immeuble.nom}`)
  }

  const updateImmeuble = (id: string, updates: Partial<Immeuble>) => {
    setImmeubles((prev) => prev.map((immeuble) => (immeuble.id === id ? { ...immeuble, ...updates } : immeuble)))
    const immeuble = immeubles.find((i) => i.id === id)
    if (immeuble) {
      addToHistory("UPDATE", "Immeuble", id, `Modification de l'immeuble: ${immeuble.nom}`)
    }
  }

  const deleteImmeuble = (id: string) => {
    const immeuble = immeubles.find((i) => i.id === id)
    setImmeubles((prev) => prev.filter((immeuble) => immeuble.id !== id))
    if (immeuble) {
      addToHistory("DELETE", "Immeuble", id, `Suppression de l'immeuble: ${immeuble.nom}`)
    }
  }

  const getImmeublesByBloc = useCallback(
    (bloqueId: string) => {
      return immeubles.filter((i) => i.bloqueId === bloqueId)
    },
    [immeubles],
  )

  const addVente = (vente: Omit<Vente, "id" | "dateCreation">) => {
    const nouvelleVente: Vente = {
      ...vente,
      id: Date.now().toString(),
      dateCreation: new Date().toISOString(),
    }
    setVentes((prev) => [nouvelleVente, ...prev])
    addToHistory(
      "CREATE",
      "Vente",
      nouvelleVente.id,
      `Vente de ${nouvelleVente.numeroAppartement} - ${nouvelleVente.vendeurNom} -> ${nouvelleVente.acheteurNom}`,
    )
  }

  const updateVente = (id: string, updates: Partial<Vente>) => {
    setVentes((prev) => prev.map((vente) => (vente.id === id ? { ...vente, ...updates } : vente)))
    const vente = ventes.find((v) => v.id === id)
    if (vente) {
      addToHistory(
        "UPDATE",
        "Vente",
        id,
        `Mise à jour de la vente ${vente.numeroAppartement} - ${vente.vendeurNom} -> ${vente.acheteurNom}`,
      )
    }
  }

  const deleteVente = (id: string) => {
    const vente = ventes.find((v) => v.id === id)
    setVentes((prev) => prev.filter((vente) => vente.id !== id))
    if (vente) {
      addToHistory(
        "DELETE",
        "Vente",
        id,
        `Suppression de la vente ${vente.numeroAppartement} - ${vente.vendeurNom} -> ${vente.acheteurNom}`,
      )
    }
  }

  return (
    <DataContext.Provider
      value={{
        ouvriers,
        addOuvrier,
        updateOuvrier,
        deleteOuvrier,
        toggleOuvrierStatut,
        coproprietaires,
        addCoproprietaire,
        updateCoproprietaire,
        deleteCoproprietaire,
        professions,
        addProfession,
        updateProfession,
        deleteProfession,
        getProfessionsList,
        history,
        addToHistory,
        paiements,
        addPaiement,
        updatePaiement,
        deletePaiement,
        getPaiementsByCoproprietaire,
        getArrieres,
        generateCertificat,
        certificats,
        getArrieresByCoproprietaire,
        getAllArrieres,
        payerCotisationAnnuelle,
        blocs,
        addBloc,
        updateBloc,
        deleteBloc,
        immeubles,
        addImmeuble,
        updateImmeuble,
        deleteImmeuble,
        getImmeublesByBloc,
        blocNotifications,
        clearBlocNotifications,
        ventes,
        addVente,
        updateVente,
        deleteVente
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

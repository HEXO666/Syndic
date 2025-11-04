"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Ouvrier {
  id: string
  nom: string
  prenom: string
  cin: string
  adresse: string
  profession: string
  dateAjout: string
}

export interface Coproprietaire {
  id: string
  nom: string
  prenom: string
  adresse: string
  cin: string // Ajout du champ CIN
  telephone: string // Ajout du champ téléphone
  bloque: string
  immeuble: string
  numeroAppartement: string
  numeroTitreFoncier: string // Ajout du numéro de titre foncier
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
  annee: string // Changé de moisConcerne à annee pour paiement annuel
  datePaiement: string
  statut: "paye" | "impaye" | "partiel" // Simplifié les statuts
  methodePaiement: "especes" | "cheque" | "virement" // Supprimé carte, ajusté selon spécifications
  numeroCheque?: string // Pour les paiements par chèque
  numeroVirement?: string // Pour les paiements par virement
  notes?: string
  dateAjout: string
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
  addOuvrier: (ouvrier: Omit<Ouvrier, "id" | "dateAjout">) => void
  updateOuvrier: (id: string, ouvrier: Partial<Ouvrier>) => void
  deleteOuvrier: (id: string) => void

  // Copropriétaires
  coproprietaires: Coproprietaire[]
  addCoproprietaire: (coproprietaire: Omit<Coproprietaire, "id" | "dateAjout">) => void
  updateCoproprietaire: (id: string, coproprietaire: Partial<Coproprietaire>) => void
  deleteCoproprietaire: (id: string) => void

  // Professions
  professions: string[]
  addProfession: (profession: string) => void

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
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const COTISATION_ANNUELLE = 1200 // Montant fixe de 1200 DH par an

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [ouvriers, setOuvriers] = useState<Ouvrier[]>([])
  const [coproprietaires, setCoproprietaires] = useState<Coproprietaire[]>([])
  const [professions, setProfessions] = useState<string[]>(["Ménage", "Sécurité", "Jardinage"])
  const [history, setHistory] = useState<ActionHistory[]>([])
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [certificats, setCertificats] = useState<CertificatPaiement[]>([])
  const [blocs, setBlocs] = useState<Bloque[]>([])
  const [immeubles, setImmeubles] = useState<Immeuble[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    const storedOuvriers = localStorage.getItem("syndic-ouvriers")
    const storedCoproprietaires = localStorage.getItem("syndic-coproprietaires")
    const storedProfessions = localStorage.getItem("syndic-professions")
    const storedHistory = localStorage.getItem("syndic-history")
    const storedPaiements = localStorage.getItem("syndic-paiements")
    const storedCertificats = localStorage.getItem("syndic-certificats")
    const storedBlocs = localStorage.getItem("syndic-blocs")
    const storedImmeubles = localStorage.getItem("syndic-immeubles")

    if (storedOuvriers) setOuvriers(JSON.parse(storedOuvriers))
    if (storedCoproprietaires) setCoproprietaires(JSON.parse(storedCoproprietaires))
    if (storedProfessions) setProfessions(JSON.parse(storedProfessions))
    if (storedHistory) setHistory(JSON.parse(storedHistory))
    if (storedPaiements) setPaiements(JSON.parse(storedPaiements))
    if (storedCertificats) setCertificats(JSON.parse(storedCertificats))
    if (storedBlocs) setBlocs(JSON.parse(storedBlocs))
    if (storedImmeubles) setImmeubles(JSON.parse(storedImmeubles))
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("syndic-ouvriers", JSON.stringify(ouvriers))
  }, [ouvriers])

  useEffect(() => {
    localStorage.setItem("syndic-coproprietaires", JSON.stringify(coproprietaires))
  }, [coproprietaires])

  useEffect(() => {
    localStorage.setItem("syndic-professions", JSON.stringify(professions))
  }, [professions])

  useEffect(() => {
    localStorage.setItem("syndic-history", JSON.stringify(history))
  }, [history])

  useEffect(() => {
    localStorage.setItem("syndic-paiements", JSON.stringify(paiements))
  }, [paiements])

  useEffect(() => {
    localStorage.setItem("syndic-certificats", JSON.stringify(certificats))
  }, [certificats])

  useEffect(() => {
    localStorage.setItem("syndic-blocs", JSON.stringify(blocs))
  }, [blocs])

  useEffect(() => {
    localStorage.setItem("syndic-immeubles", JSON.stringify(immeubles))
  }, [immeubles])

  const addToHistory = (action: string, entity: string, entityId: string, details: string) => {
    const user = JSON.parse(localStorage.getItem("syndic-user") || "{}")
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

  const addOuvrier = (ouvrier: Omit<Ouvrier, "id" | "dateAjout">) => {
    const newOuvrier: Ouvrier = {
      ...ouvrier,
      id: Date.now().toString(),
      dateAjout: new Date().toISOString(),
    }
    setOuvriers((prev) => [...prev, newOuvrier])
    addToHistory("CREATE", "Ouvrier", newOuvrier.id, `Ajout de ${ouvrier.prenom} ${ouvrier.nom}`)
  }

  const updateOuvrier = (id: string, updates: Partial<Ouvrier>) => {
    setOuvriers((prev) => prev.map((ouvrier) => (ouvrier.id === id ? { ...ouvrier, ...updates } : ouvrier)))
    const ouvrier = ouvriers.find((o) => o.id === id)
    if (ouvrier) {
      addToHistory("UPDATE", "Ouvrier", id, `Modification de ${ouvrier.prenom} ${ouvrier.nom}`)
    }
  }

  const deleteOuvrier = (id: string) => {
    const ouvrier = ouvriers.find((o) => o.id === id)
    setOuvriers((prev) => prev.filter((ouvrier) => ouvrier.id !== id))
    if (ouvrier) {
      addToHistory("DELETE", "Ouvrier", id, `Suppression de ${ouvrier.prenom} ${ouvrier.nom}`)
    }
  }

  const addCoproprietaire = (coproprietaire: Omit<Coproprietaire, "id" | "dateAjout">) => {
    const newCoproprietaire: Coproprietaire = {
      ...coproprietaire,
      id: Date.now().toString(),
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

  const addProfession = (profession: string) => {
    if (!professions.includes(profession)) {
      setProfessions((prev) => [...prev, profession])
      addToHistory("CREATE", "Profession", profession, `Ajout de la profession: ${profession}`)
    }
  }

  const addPaiement = (paiement: Omit<Paiement, "id" | "dateAjout">) => {
    const newPaiement: Paiement = {
      ...paiement,
      id: Date.now().toString(),
      dateAjout: new Date().toISOString(),
    }
    setPaiements((prev) => [...prev, newPaiement])
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

    const nouveauPaiement: Paiement = {
      id: Date.now().toString(),
      coproprietaireId,
      coproprietaireNom: `${coproprietaire.prenom} ${coproprietaire.nom}`,
      montant,
      annee,
      datePaiement: new Date().toISOString(),
      statut: "paye",
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
        montant: COTISATION_ANNUELLE,
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

  const getImmeublesByBloc = (bloqueId: string) => {
    return immeubles.filter((i) => i.bloqueId === bloqueId)
  }

  return (
    <DataContext.Provider
      value={{
        ouvriers,
        addOuvrier,
        updateOuvrier,
        deleteOuvrier,
        coproprietaires,
        addCoproprietaire,
        updateCoproprietaire,
        deleteCoproprietaire,
        professions,
        addProfession,
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

"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "./auth-context"
import { getSupabaseClient } from "./supabase/client"
import {
  blocsService,
  immeublesService,
  coproprietairesService,
  ouvriersService,
  professionsService,
  paiementsService,
  ventesService,
  certificatsService,
} from "./supabase/services"
import type {
  Bloc as DBBloc,
  Immeuble as DBImmeuble,
  Coproprietaire as DBCoproprietaire,
  Ouvrier as DBOuvrier,
  Profession as DBProfession,
  Paiement as DBPaiement,
} from "./supabase/types"

// ─── LOCAL TYPES ──────────────────────────────────────────────────────────────

export type MetierOuvrier = "jardinier" | "securite" | "femme-de-menage" | "maintenance" | "autre"

export interface Ouvrier {
  id: string
  nom: string
  prenom: string
  adresse: string
  telephoneMaroc: string
  metier: MetierOuvrier | string
  statut: "actif" | "inactif"
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
  telephoneEtranger?: string
  bloque: string
  immeuble: string
  numeroAppartement: string
  titreFoncier: string
  montantAnnuel: number
  totalDettes: number
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
  annee: string
  montantDu: number
  montantRestant: number
  datePaiement: string
  statut: "paye" | "impaye" | "partiel"
  methodePaiement: "especes" | "cheque" | "virement"
  numeroCheque?: string
  numeroVirement?: string
  preuvePaiement?: string
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
  montantTotal: number
  anneesImpayees: string[]
  dernierPaiement?: string
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

// ─── TYPE MAPPINGS ────────────────────────────────────────────────────────────

function mapBloc(b: DBBloc): Bloque {
  return { id: b.id, nom: b.nom, description: b.description ?? undefined, dateAjout: b.created_at }
}

function mapImmeuble(i: DBImmeuble & { blocs?: { nom: string } | null }): Immeuble {
  return {
    id: i.id,
    nom: i.nom,
    bloqueId: i.bloc_id,
    bloqueName: i.blocs?.nom ?? "",
    description: i.description ?? undefined,
    dateAjout: i.created_at,
  }
}

function mapCoproprietaire(
  c: DBCoproprietaire & {
    immeubles?: { nom: string; bloc_id: string; blocs?: { nom: string } | null } | null
  },
): Coproprietaire {
  return {
    id: c.id,
    nom: c.nom,
    prenom: c.prenom,
    adresse: c.adresse ?? "",
    cin: c.cin ?? "",
    telephone: c.telephone ?? "",
    telephoneEtranger: c.telephone_etranger ?? undefined,
    bloque: c.immeubles?.blocs?.nom ?? "",
    immeuble: c.immeubles?.nom ?? "",
    numeroAppartement: c.numero_appartement,
    titreFoncier: c.titre_foncier ?? "",
    montantAnnuel: c.montant_annuel,
    totalDettes: c.total_dettes,
    dateAjout: c.created_at,
  }
}

function mapOuvrier(o: DBOuvrier): Ouvrier {
  return {
    id: o.id,
    nom: o.nom,
    prenom: o.prenom,
    adresse: o.adresse ?? "",
    telephoneMaroc: o.telephone_maroc ?? "",
    metier: o.metier,
    statut: o.statut,
    dateAjout: o.created_at,
  }
}

function mapProfession(p: DBProfession): Profession {
  return { id: p.id, nom: p.nom, description: p.description ?? undefined, dateAjout: p.created_at }
}

function mapPaiement(
  p: DBPaiement & {
    coproprietaires?: { nom: string; prenom: string; numero_appartement: string } | null
  },
): Paiement {
  return {
    id: p.id,
    coproprietaireId: p.coproprietaire_id,
    coproprietaireNom: p.coproprietaires
      ? `${p.coproprietaires.prenom} ${p.coproprietaires.nom}`
      : "",
    montant: p.montant,
    annee: p.annee,
    montantDu: p.montant_du,
    montantRestant: p.montant_restant,
    datePaiement: p.date_paiement ?? "",
    statut: p.statut,
    methodePaiement: p.methode_paiement,
    numeroCheque: p.numero_cheque ?? undefined,
    numeroVirement: p.numero_virement ?? undefined,
    preuvePaiement: p.preuve_paiement ?? undefined,
    notes: p.notes ?? undefined,
    dateAjout: p.created_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVente(v: any): Vente {
  return {
    id: v.id,
    vendeurId: v.vendeur_id ?? "",
    vendeurNom: v.vendeur ? `${v.vendeur.prenom} ${v.vendeur.nom}` : "",
    vendeurContact: undefined,
    acheteurNom: v.acheteur_nom,
    acheteurContact: v.acheteur_contact ?? undefined,
    acheteurEmail: v.acheteur_email ?? undefined,
    blocId: v.immeubles?.bloc_id ?? "",
    blocNom: v.immeubles?.blocs?.nom ?? "",
    immeubleId: v.immeuble_id ?? "",
    immeubleNom: v.immeubles?.nom ?? "",
    numeroAppartement: v.numero_appartement,
    dateVente: v.date_vente ?? undefined,
    dateQuitus: v.date_quitus,
    notes: v.notes ?? undefined,
    dateCreation: v.created_at,
  }
}

// ─── CONTEXT TYPE ─────────────────────────────────────────────────────────────

interface DataContextType {
  ouvriers: Ouvrier[]
  addOuvrier: (ouvrier: Omit<Ouvrier, "id" | "dateAjout" | "statut">) => void
  updateOuvrier: (id: string, ouvrier: Partial<Ouvrier>) => void
  deleteOuvrier: (id: string) => void
  toggleOuvrierStatut: (id: string) => void

  coproprietaires: Coproprietaire[]
  addCoproprietaire: (
    coproprietaire: Omit<Coproprietaire, "id" | "dateAjout" | "montantAnnuel" | "totalDettes">,
  ) => void
  updateCoproprietaire: (id: string, coproprietaire: Partial<Coproprietaire>) => void
  deleteCoproprietaire: (id: string) => void

  professions: Profession[]
  addProfession: (profession: Omit<Profession, "id" | "dateAjout">) => void
  updateProfession: (id: string, profession: Partial<Profession>) => void
  deleteProfession: (id: string) => void
  getProfessionsList: () => string[]

  history: ActionHistory[]
  addToHistory: (action: string, entity: string, entityId: string, details: string) => void

  paiements: Paiement[]
  addPaiement: (paiement: Omit<Paiement, "id" | "dateAjout">) => void
  updatePaiement: (id: string, paiement: Partial<Paiement>) => void
  deletePaiement: (id: string) => void
  getPaiementsByCoproprietaire: (coproprietaireId: string) => Paiement[]
  getArrieres: () => Paiement[]
  generateCertificat: (coproprietaireId: string, periode: string) => CertificatPaiement

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

  blocs: Bloque[]
  addBloc: (bloc: Omit<Bloque, "id" | "dateAjout">) => void
  updateBloc: (id: string, bloc: Partial<Bloque>) => void
  deleteBloc: (id: string) => void

  immeubles: Immeuble[]
  addImmeuble: (immeuble: Omit<Immeuble, "id" | "dateAjout">) => void
  updateImmeuble: (id: string, immeuble: Partial<Immeuble>) => void
  deleteImmeuble: (id: string) => void
  getImmeublesByBloc: (bloqueId: string) => Immeuble[]

  blocNotifications: number
  clearBlocNotifications: () => void

  ventes: Vente[]
  addVente: (vente: Omit<Vente, "id" | "dateCreation">) => void
  updateVente: (id: string, vente: Partial<Vente>) => void
  deleteVente: (id: string) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const COTISATION_ANNUELLE = 1200

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth()
  const supabase = getSupabaseClient()

  const [orgId, setOrgId] = useState<string>("")
  const [ouvriers, setOuvriers] = useState<Ouvrier[]>([])
  const [coproprietaires, setCoproprietaires] = useState<Coproprietaire[]>([])
  const [professions, setProfessions] = useState<Profession[]>([])
  const [history, setHistory] = useState<ActionHistory[]>([])
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [certificats, setCertificats] = useState<CertificatPaiement[]>([])
  const [blocs, setBlocs] = useState<Bloque[]>([])
  const [immeubles, setImmeubles] = useState<Immeuble[]>([])
  const [ventes, setVentes] = useState<Vente[]>([])
  const [blocNotifications, setBlocNotifications] = useState(0)

  const loadAllData = useCallback(async () => {
    try {
      const { data: id } = await supabase.rpc("get_my_org_id")
      if (id) setOrgId(id as string)

      const [bData, iData, cData, oData, pData, prData, vData] = await Promise.all([
        blocsService.list(supabase),
        immeublesService.list(supabase),
        coproprietairesService.list(supabase),
        ouvriersService.list(supabase),
        paiementsService.list(supabase),
        professionsService.list(supabase),
        ventesService.list(supabase),
      ])

      setBlocs(bData.map(mapBloc))
      setImmeubles(iData.map(mapImmeuble))
      setCoproprietaires(cData.map(mapCoproprietaire))
      setOuvriers(oData.map(mapOuvrier))
      setPaiements(pData.map(mapPaiement))
      setProfessions(prData.map(mapProfession))
      setVentes(vData.map(mapVente))
    } catch (e) {
      console.error("Failed to load data:", e)
    }
  }, [supabase])

  const clearAllData = useCallback(() => {
    setOrgId("")
    setOuvriers([])
    setCoproprietaires([])
    setProfessions([])
    setHistory([])
    setPaiements([])
    setCertificats([])
    setBlocs([])
    setImmeubles([])
    setVentes([])
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (user) {
      void loadAllData()
    } else {
      clearAllData()
    }
  }, [user, authLoading, loadAllData, clearAllData])

  // ─── BLOCS ──────────────────────────────────────────────────────────────────

  const addBloc = async (bloc: Omit<Bloque, "id" | "dateAjout">) => {
    try {
      const created = await blocsService.create(supabase, { nom: bloc.nom, description: bloc.description ?? null })
      setBlocs((prev) => [...prev, mapBloc(created)])
    } catch (e) {
      console.error(e)
    }
  }

  const updateBloc = async (id: string, updates: Partial<Bloque>) => {
    try {
      const updated = await blocsService.update(supabase, id, {
        nom: updates.nom,
        description: updates.description,
      })
      setBlocs((prev) => prev.map((b) => (b.id === id ? mapBloc(updated) : b)))
    } catch (e) {
      console.error(e)
    }
  }

  const deleteBloc = async (id: string) => {
    try {
      await blocsService.delete(supabase, id)
      setBlocs((prev) => prev.filter((b) => b.id !== id))
      setImmeubles((prev) => prev.filter((i) => i.bloqueId !== id))
    } catch (e) {
      console.error(e)
    }
  }

  // ─── IMMEUBLES ──────────────────────────────────────────────────────────────

  const addImmeuble = async (immeuble: Omit<Immeuble, "id" | "dateAjout">) => {
    try {
      const created = await immeublesService.create(supabase, {
        nom: immeuble.nom,
        bloc_id: immeuble.bloqueId,
        description: immeuble.description ?? null,
        adresse: null,
      })
      const bloc = blocs.find((b) => b.id === immeuble.bloqueId)
      setImmeubles((prev) => [
        ...prev,
        {
          id: created.id,
          nom: created.nom,
          bloqueId: created.bloc_id,
          bloqueName: bloc?.nom ?? immeuble.bloqueName,
          description: created.description ?? undefined,
          dateAjout: created.created_at,
        },
      ])
    } catch (e) {
      console.error(e)
    }
  }

  const updateImmeuble = async (id: string, updates: Partial<Immeuble>) => {
    try {
      const payload: Partial<{ nom: string; description: string | null; adresse: string | null; bloc_id: string }> = {}
      if (updates.nom !== undefined) payload.nom = updates.nom
      if (updates.description !== undefined) payload.description = updates.description ?? null
      if (updates.bloqueId !== undefined) payload.bloc_id = updates.bloqueId
      const updated = await immeublesService.update(supabase, id, payload)
      const current = immeubles.find((i) => i.id === id)
      const bloc = blocs.find((b) => b.id === (updates.bloqueId ?? current?.bloqueId))
      setImmeubles((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                id: updated.id,
                nom: updated.nom,
                bloqueId: updated.bloc_id,
                bloqueName: bloc?.nom ?? i.bloqueName,
                description: updated.description ?? undefined,
                dateAjout: updated.created_at,
              }
            : i,
        ),
      )
    } catch (e) {
      console.error(e)
    }
  }

  const deleteImmeuble = async (id: string) => {
    try {
      await immeublesService.delete(supabase, id)
      setImmeubles((prev) => prev.filter((i) => i.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  const getImmeublesByBloc = useCallback(
    (bloqueId: string) => immeubles.filter((i) => i.bloqueId === bloqueId),
    [immeubles],
  )

  // ─── COPROPRIETAIRES ────────────────────────────────────────────────────────

  const addCoproprietaire = async (
    copro: Omit<Coproprietaire, "id" | "dateAjout" | "montantAnnuel" | "totalDettes">,
  ) => {
    try {
      const immeubleObj = immeubles.find((i) => i.nom === copro.immeuble)
      const created = await coproprietairesService.create(supabase, {
        nom: copro.nom,
        prenom: copro.prenom,
        adresse: copro.adresse || null,
        cin: copro.cin || null,
        telephone: copro.telephone || null,
        telephone_etranger: copro.telephoneEtranger || null,
        immeuble_id: immeubleObj?.id ?? null,
        numero_appartement: copro.numeroAppartement,
        titre_foncier: copro.titreFoncier || null,
      })
      setCoproprietaires((prev) => [
        ...prev,
        {
          id: created.id,
          nom: created.nom,
          prenom: created.prenom,
          adresse: created.adresse ?? "",
          cin: created.cin ?? "",
          telephone: created.telephone ?? "",
          telephoneEtranger: created.telephone_etranger ?? undefined,
          bloque: copro.bloque,
          immeuble: copro.immeuble,
          numeroAppartement: created.numero_appartement,
          titreFoncier: created.titre_foncier ?? "",
          montantAnnuel: created.montant_annuel,
          totalDettes: created.total_dettes,
          dateAjout: created.created_at,
        },
      ])
    } catch (e) {
      console.error(e)
    }
  }

  const updateCoproprietaire = async (id: string, updates: Partial<Coproprietaire>) => {
    try {
      const payload: Record<string, unknown> = {}
      if (updates.nom !== undefined) payload.nom = updates.nom
      if (updates.prenom !== undefined) payload.prenom = updates.prenom
      if (updates.adresse !== undefined) payload.adresse = updates.adresse
      if (updates.cin !== undefined) payload.cin = updates.cin
      if (updates.telephone !== undefined) payload.telephone = updates.telephone
      if (updates.telephoneEtranger !== undefined) payload.telephone_etranger = updates.telephoneEtranger
      if (updates.numeroAppartement !== undefined) payload.numero_appartement = updates.numeroAppartement
      if (updates.titreFoncier !== undefined) payload.titre_foncier = updates.titreFoncier
      if (updates.immeuble !== undefined) {
        const immeubleObj = immeubles.find((i) => i.nom === updates.immeuble)
        if (immeubleObj) payload.immeuble_id = immeubleObj.id
      }
      await coproprietairesService.update(supabase, id, payload)
      setCoproprietaires((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
    } catch (e) {
      console.error(e)
    }
  }

  const deleteCoproprietaire = async (id: string) => {
    try {
      await coproprietairesService.delete(supabase, id)
      setCoproprietaires((prev) => prev.filter((c) => c.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  // ─── OUVRIERS ───────────────────────────────────────────────────────────────

  const addOuvrier = async (ouvrier: Omit<Ouvrier, "id" | "dateAjout" | "statut">) => {
    try {
      const created = await ouvriersService.create(supabase, {
        nom: ouvrier.nom,
        prenom: ouvrier.prenom,
        adresse: ouvrier.adresse || null,
        telephone_maroc: ouvrier.telephoneMaroc || null,
        metier: ouvrier.metier,
      })
      setOuvriers((prev) => [...prev, mapOuvrier(created)])
    } catch (e) {
      console.error(e)
    }
  }

  const updateOuvrier = async (id: string, updates: Partial<Ouvrier>) => {
    try {
      const payload: Record<string, unknown> = {}
      if (updates.nom !== undefined) payload.nom = updates.nom
      if (updates.prenom !== undefined) payload.prenom = updates.prenom
      if (updates.adresse !== undefined) payload.adresse = updates.adresse
      if (updates.telephoneMaroc !== undefined) payload.telephone_maroc = updates.telephoneMaroc
      if (updates.metier !== undefined) payload.metier = updates.metier
      if (updates.statut !== undefined) payload.statut = updates.statut
      const updated = await ouvriersService.update(supabase, id, payload)
      setOuvriers((prev) => prev.map((o) => (o.id === id ? mapOuvrier(updated) : o)))
    } catch (e) {
      console.error(e)
    }
  }

  const deleteOuvrier = async (id: string) => {
    try {
      await ouvriersService.delete(supabase, id)
      setOuvriers((prev) => prev.filter((o) => o.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  const toggleOuvrierStatut = async (id: string) => {
    try {
      const updated = await ouvriersService.toggleStatut(supabase, id)
      setOuvriers((prev) => prev.map((o) => (o.id === id ? mapOuvrier(updated) : o)))
    } catch (e) {
      console.error(e)
    }
  }

  // ─── PROFESSIONS ────────────────────────────────────────────────────────────

  const addProfession = async (profession: Omit<Profession, "id" | "dateAjout">) => {
    if (professions.find((p) => p.nom.toLowerCase() === profession.nom.toLowerCase())) return
    try {
      const created = await professionsService.create(supabase, {
        nom: profession.nom,
        description: profession.description ?? null,
      })
      setProfessions((prev) => [...prev, mapProfession(created)])
    } catch (e) {
      console.error(e)
    }
  }

  const updateProfession = (id: string, updates: Partial<Profession>) => {
    setProfessions((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const deleteProfession = async (id: string) => {
    try {
      await professionsService.delete(supabase, id)
      setProfessions((prev) => prev.filter((p) => p.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  const getProfessionsList = (): string[] => professions.map((p) => p.nom)

  // ─── HISTORY ────────────────────────────────────────────────────────────────

  const addToHistory = (action: string, entity: string, entityId: string, details: string) => {
    // Services write to action_history via logAction; this adds a local echo for instant UI feedback
    setHistory((prev) => [
      {
        id: Date.now().toString(),
        action,
        entity,
        entityId,
        userId: "",
        userName: "",
        timestamp: new Date().toISOString(),
        details,
      },
      ...prev,
    ])
  }

  // ─── PAIEMENTS ──────────────────────────────────────────────────────────────

  const addPaiement = async (paiement: Omit<Paiement, "id" | "dateAjout">) => {
    if (!orgId) return
    try {
      const created = await supabase
        .from("paiements")
        .insert({
          organisation_id: orgId,
          coproprietaire_id: paiement.coproprietaireId,
          montant: paiement.montant,
          montant_du: paiement.montantDu,
          montant_restant: paiement.montantRestant,
          annee: paiement.annee,
          date_paiement: paiement.datePaiement || null,
          statut: paiement.statut,
          methode_paiement: paiement.methodePaiement,
          numero_cheque: paiement.numeroCheque ?? null,
          numero_virement: paiement.numeroVirement ?? null,
          preuve_paiement: paiement.preuvePaiement ?? null,
          notes: paiement.notes ?? null,
        })
        .select()
        .single()
      if (created.error) throw created.error
      setPaiements((prev) => [
        ...prev,
        { ...paiement, id: created.data.id, dateAjout: created.data.created_at },
      ])
      setBlocNotifications((prev) => prev + 1)
    } catch (e) {
      console.error(e)
    }
  }

  const updatePaiement = (id: string, updates: Partial<Paiement>) => {
    setPaiements((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const deletePaiement = async (id: string) => {
    try {
      await paiementsService.delete(supabase, id)
      setPaiements((prev) => prev.filter((p) => p.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  const getPaiementsByCoproprietaire = (coproprietaireId: string) =>
    paiements.filter((p) => p.coproprietaireId === coproprietaireId)

  const payerCotisationAnnuelle = async (
    coproprietaireId: string,
    annee: string,
    montant: number,
    methode: string,
    numeroRef?: string,
  ) => {
    try {
      const created = await paiementsService.payerCotisation(
        supabase,
        coproprietaireId,
        annee,
        montant,
        methode as "especes" | "cheque" | "virement",
        numeroRef,
      )
      const copro = coproprietaires.find((c) => c.id === coproprietaireId)
      setPaiements((prev) => [
        ...prev,
        {
          id: created.id,
          coproprietaireId,
          coproprietaireNom: copro ? `${copro.prenom} ${copro.nom}` : "",
          montant: created.montant,
          annee: created.annee,
          montantDu: created.montant_du,
          montantRestant: created.montant_restant,
          datePaiement: created.date_paiement ?? new Date().toISOString(),
          statut: created.statut,
          methodePaiement: created.methode_paiement,
          numeroCheque: created.numero_cheque ?? undefined,
          numeroVirement: created.numero_virement ?? undefined,
          preuvePaiement: created.preuve_paiement ?? undefined,
          notes: created.notes ?? undefined,
          dateAjout: created.created_at,
        },
      ])
      // Update local total_dettes optimistically
      setCoproprietaires((prev) =>
        prev.map((c) =>
          c.id === coproprietaireId ? { ...c, totalDettes: Math.max(0, c.totalDettes - montant) } : c,
        ),
      )
    } catch (e) {
      console.error(e)
    }
  }

  const getArrieresByCoproprietaire = (coproprietaireId: string): ArrieresCoproprietaire => {
    const copro = coproprietaires.find((c) => c.id === coproprietaireId)
    const payes = paiements.filter((p) => p.coproprietaireId === coproprietaireId && p.statut === "paye")
    const anneesPayees = payes.map((p) => p.annee)
    const currentYear = new Date().getFullYear()
    const anneesImpayees: string[] = []
    for (let y = currentYear - 10; y <= currentYear; y++) {
      if (!anneesPayees.includes(y.toString())) anneesImpayees.push(y.toString())
    }
    const dernierPaiement = payes.sort(
      (a, b) => new Date(b.datePaiement).getTime() - new Date(a.datePaiement).getTime(),
    )[0]
    return {
      coproprietaireId,
      coproprietaireNom: copro ? `${copro.prenom} ${copro.nom}` : "",
      montantTotal: anneesImpayees.length * COTISATION_ANNUELLE,
      anneesImpayees,
      dernierPaiement: dernierPaiement?.datePaiement,
    }
  }

  const getAllArrieres = (): ArrieresCoproprietaire[] =>
    coproprietaires.map((c) => getArrieresByCoproprietaire(c.id)).filter((a) => a.montantTotal > 0)

  const getArrieres = (): Paiement[] =>
    getAllArrieres().flatMap((a) =>
      a.anneesImpayees.map((annee) => ({
        id: `${a.coproprietaireId}-${annee}`,
        coproprietaireId: a.coproprietaireId,
        coproprietaireNom: a.coproprietaireNom,
        montant: 0,
        montantDu: 1200,
        montantRestant: 1200,
        annee,
        datePaiement: "",
        statut: "impaye" as const,
        methodePaiement: "especes" as const,
        dateAjout: "",
      })),
    )

  const generateCertificat = (coproprietaireId: string, periode: string): CertificatPaiement => {
    const copro = coproprietaires.find((c) => c.id === coproprietaireId)
    const paiementsPeriode = paiements.filter(
      (p) => p.coproprietaireId === coproprietaireId && p.annee === periode && p.statut === "paye",
    )
    const cert: CertificatPaiement = {
      id: Date.now().toString(),
      coproprietaireId,
      coproprietaireNom: copro ? `${copro.prenom} ${copro.nom}` : "",
      periode,
      montantTotal: paiementsPeriode.reduce((s, p) => s + p.montant, 0),
      paiements: paiementsPeriode,
      dateGeneration: new Date().toISOString(),
    }
    setCertificats((prev) => [...prev, cert])
    // Async persist in background — UI gets local copy immediately
    void certificatsService.generate(supabase, coproprietaireId, periode).catch(console.error)
    return cert
  }

  // ─── VENTES ─────────────────────────────────────────────────────────────────

  const addVente = async (vente: Omit<Vente, "id" | "dateCreation">) => {
    if (!orgId) return
    try {
      const created = await supabase
        .from("ventes")
        .insert({
          organisation_id: orgId,
          vendeur_id: vente.vendeurId || null,
          acheteur_nom: vente.acheteurNom,
          acheteur_contact: vente.acheteurContact ?? null,
          acheteur_email: vente.acheteurEmail ?? null,
          immeuble_id: vente.immeubleId || null,
          numero_appartement: vente.numeroAppartement,
          date_vente: vente.dateVente ?? null,
          date_quitus: vente.dateQuitus,
          notes: vente.notes ?? null,
        })
        .select()
        .single()
      if (created.error) throw created.error
      setVentes((prev) => [{ ...vente, id: created.data.id, dateCreation: created.data.created_at }, ...prev])
    } catch (e) {
      console.error(e)
    }
  }

  const updateVente = (id: string, updates: Partial<Vente>) => {
    setVentes((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)))
  }

  const deleteVente = async (id: string) => {
    try {
      await ventesService.delete(supabase, id)
      setVentes((prev) => prev.filter((v) => v.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  const clearBlocNotifications = useCallback(() => setBlocNotifications(0), [])

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
        deleteVente,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) throw new Error("useData must be used within a DataProvider")
  return context
}

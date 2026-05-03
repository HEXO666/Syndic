/**
 * Supabase data services — typed wrappers around every table.
 * Each function gets the supabase client as first arg so it can be used
 * from both client and server components.
 */
import type { SupabaseClient } from "@supabase/supabase-js"
import type {
  Database,
  Bloc, Immeuble, Coproprietaire, Ouvrier, Profession,
  Paiement, Vente, CertificatPaiement, ActionHistory,
  DashboardStats, CollecteMensuelle, Arriere,
} from "./types"

type DB = SupabaseClient<Database>

// ─── helpers ──────────────────────────────────────────────────────────────────

async function logAction(
  db: DB,
  action: "CREATE" | "UPDATE" | "DELETE",
  entity: string,
  entityId: string,
  details: string,
) {
  const orgId = await db.rpc("get_my_org_id").then((r) => r.data as string)
  if (!orgId) return
  await db.from("action_history").insert({
    organisation_id: orgId,
    action,
    entity,
    entity_id: entityId,
    details,
  })
}

// ─── BLOCS ────────────────────────────────────────────────────────────────────

export const blocsService = {
  async list(db: DB) {
    const { data, error } = await db.from("blocs").select("*").order("nom")
    if (error) throw error
    return data as Bloc[]
  },

  async create(db: DB, payload: Pick<Bloc, "nom" | "description">) {
    const orgId = (await db.rpc("get_my_org_id").then((r) => r.data)) as string
    const { data, error } = await db
      .from("blocs")
      .insert({ ...payload, organisation_id: orgId })
      .select()
      .single()
    if (error) throw error
    await logAction(db, "CREATE", "Bloc", data.id, `Ajout du bloc: ${data.nom}`)
    return data as Bloc
  },

  async update(db: DB, id: string, payload: Partial<Pick<Bloc, "nom" | "description">>) {
    const { data, error } = await db.from("blocs").update(payload).eq("id", id).select().single()
    if (error) throw error
    await logAction(db, "UPDATE", "Bloc", id, `Modification du bloc: ${data.nom}`)
    return data as Bloc
  },

  async delete(db: DB, id: string) {
    const { error } = await db.from("blocs").delete().eq("id", id)
    if (error) throw error
    await logAction(db, "DELETE", "Bloc", id, "Suppression du bloc")
  },
}

// ─── IMMEUBLES ────────────────────────────────────────────────────────────────

export const immeublesService = {
  async list(db: DB) {
    const { data, error } = await db.from("immeubles").select("*, blocs(nom)").order("nom")
    if (error) throw error
    return data as (Immeuble & { blocs: { nom: string } | null })[]
  },

  async byBloc(db: DB, blocId: string) {
    const { data, error } = await db.from("immeubles").select("*").eq("bloc_id", blocId).order("nom")
    if (error) throw error
    return data as Immeuble[]
  },

  async create(db: DB, payload: Pick<Immeuble, "nom" | "bloc_id" | "description" | "adresse">) {
    const orgId = (await db.rpc("get_my_org_id").then((r) => r.data)) as string
    const { data, error } = await db
      .from("immeubles")
      .insert({ ...payload, organisation_id: orgId })
      .select()
      .single()
    if (error) throw error
    await logAction(db, "CREATE", "Immeuble", data.id, `Ajout: ${data.nom}`)
    return data as Immeuble
  },

  async update(db: DB, id: string, payload: Partial<Pick<Immeuble, "nom" | "description" | "adresse" | "bloc_id">>) {
    const { data, error } = await db.from("immeubles").update(payload).eq("id", id).select().single()
    if (error) throw error
    await logAction(db, "UPDATE", "Immeuble", id, `Modification: ${data.nom}`)
    return data as Immeuble
  },

  async delete(db: DB, id: string) {
    const { error } = await db.from("immeubles").delete().eq("id", id)
    if (error) throw error
    await logAction(db, "DELETE", "Immeuble", id, "Suppression")
  },
}

// ─── COPROPRIETAIRES ─────────────────────────────────────────────────────────

export const coproprietairesService = {
  async list(db: DB) {
    const { data, error } = await db
      .from("coproprietaires")
      .select("*, immeubles(nom, bloc_id, blocs(nom))")
      .order("nom")
    if (error) throw error
    return data
  },

  async get(db: DB, id: string) {
    const { data, error } = await db
      .from("coproprietaires")
      .select("*, immeubles(nom, bloc_id, blocs(nom))")
      .eq("id", id)
      .single()
    if (error) throw error
    return data
  },

  async create(db: DB, payload: Omit<Coproprietaire, "id" | "organisation_id" | "montant_annuel" | "total_dettes" | "created_at" | "updated_at">) {
    const orgId = (await db.rpc("get_my_org_id").then((r) => r.data)) as string
    const { data, error } = await db
      .from("coproprietaires")
      .insert({ ...payload, organisation_id: orgId })
      .select()
      .single()
    if (error) throw error
    await logAction(db, "CREATE", "Copropriétaire", data.id, `Ajout: ${data.prenom} ${data.nom}`)
    return data as Coproprietaire
  },

  async update(db: DB, id: string, payload: Partial<Omit<Coproprietaire, "id" | "organisation_id" | "created_at" | "updated_at">>) {
    const { data, error } = await db.from("coproprietaires").update(payload).eq("id", id).select().single()
    if (error) throw error
    await logAction(db, "UPDATE", "Copropriétaire", id, `Modification: ${data.prenom} ${data.nom}`)
    return data as Coproprietaire
  },

  async delete(db: DB, id: string) {
    const { error } = await db.from("coproprietaires").delete().eq("id", id)
    if (error) throw error
    await logAction(db, "DELETE", "Copropriétaire", id, "Suppression")
  },

  async search(db: DB, query: string) {
    const { data, error } = await db
      .from("coproprietaires")
      .select("*")
      .or(`nom.ilike.%${query}%,prenom.ilike.%${query}%,cin.ilike.%${query}%,numero_appartement.ilike.%${query}%`)
      .order("nom")
    if (error) throw error
    return data as Coproprietaire[]
  },
}

// ─── OUVRIERS ─────────────────────────────────────────────────────────────────

export const ouvriersService = {
  async list(db: DB) {
    const { data, error } = await db.from("ouvriers").select("*").order("nom")
    if (error) throw error
    return data as Ouvrier[]
  },

  async create(db: DB, payload: Omit<Ouvrier, "id" | "organisation_id" | "statut" | "created_at" | "updated_at">) {
    const orgId = (await db.rpc("get_my_org_id").then((r) => r.data)) as string
    const { data, error } = await db
      .from("ouvriers")
      .insert({ ...payload, organisation_id: orgId })
      .select()
      .single()
    if (error) throw error
    await logAction(db, "CREATE", "Ouvrier", data.id, `Ajout: ${data.prenom} ${data.nom}`)
    return data as Ouvrier
  },

  async update(db: DB, id: string, payload: Partial<Omit<Ouvrier, "id" | "organisation_id" | "created_at" | "updated_at">>) {
    const { data, error } = await db.from("ouvriers").update(payload).eq("id", id).select().single()
    if (error) throw error
    await logAction(db, "UPDATE", "Ouvrier", id, `Modification: ${data.prenom} ${data.nom}`)
    return data as Ouvrier
  },

  async toggleStatut(db: DB, id: string) {
    const { data: current } = await db.from("ouvriers").select("statut, nom, prenom").eq("id", id).single()
    if (!current) throw new Error("Ouvrier not found")
    const newStatut = current.statut === "actif" ? "inactif" : "actif"
    const { data, error } = await db.from("ouvriers").update({ statut: newStatut }).eq("id", id).select().single()
    if (error) throw error
    await logAction(db, "UPDATE", "Ouvrier", id, `Statut → ${newStatut}: ${current.prenom} ${current.nom}`)
    return data as Ouvrier
  },

  async delete(db: DB, id: string) {
    const { error } = await db.from("ouvriers").delete().eq("id", id)
    if (error) throw error
    await logAction(db, "DELETE", "Ouvrier", id, "Suppression")
  },
}

// ─── PROFESSIONS ──────────────────────────────────────────────────────────────

export const professionsService = {
  async list(db: DB) {
    const { data, error } = await db.from("professions").select("*").order("nom")
    if (error) throw error
    return data as Profession[]
  },

  async create(db: DB, payload: Pick<Profession, "nom" | "description">) {
    const orgId = (await db.rpc("get_my_org_id").then((r) => r.data)) as string
    const { data, error } = await db
      .from("professions")
      .insert({ ...payload, organisation_id: orgId })
      .select()
      .single()
    if (error) throw error
    return data as Profession
  },

  async delete(db: DB, id: string) {
    const { error } = await db.from("professions").delete().eq("id", id)
    if (error) throw error
  },
}

// ─── PAIEMENTS ────────────────────────────────────────────────────────────────

export const paiementsService = {
  async list(db: DB) {
    const { data, error } = await db
      .from("paiements")
      .select("*, coproprietaires(nom, prenom, numero_appartement)")
      .order("created_at", { ascending: false })
    if (error) throw error
    return data as (Paiement & { coproprietaires: { nom: string; prenom: string; numero_appartement: string } | null })[]
  },

  async byCoproprietaire(db: DB, coproprietaireId: string) {
    const { data, error } = await db
      .from("paiements")
      .select("*")
      .eq("coproprietaire_id", coproprietaireId)
      .order("annee", { ascending: false })
    if (error) throw error
    return data as Paiement[]
  },

  async payerCotisation(
    db: DB,
    coproprietaireId: string,
    annee: string,
    montant: number,
    methode: "especes" | "cheque" | "virement",
    numeroRef?: string,
  ) {
    const { data, error } = await db.rpc("payer_cotisation", {
      p_coproprietaire_id: coproprietaireId,
      p_annee: annee,
      p_montant: montant,
      p_methode: methode,
      p_numero_ref: numeroRef,
    })
    if (error) throw error
    return data as Paiement
  },

  async create(db: DB, payload: Omit<Paiement, "id" | "created_at" | "updated_at">) {
    const { data, error } = await db.from("paiements").insert(payload).select().single()
    if (error) throw error
    await logAction(db, "CREATE", "Paiement", data.id, `Paiement ${data.montant} DH - ${data.annee}`)
    return data as Paiement
  },

  async update(db: DB, id: string, payload: Partial<Paiement>) {
    const { data, error } = await db.from("paiements").update(payload).eq("id", id).select().single()
    if (error) throw error
    return data as Paiement
  },

  async delete(db: DB, id: string) {
    const { error } = await db.from("paiements").delete().eq("id", id)
    if (error) throw error
    await logAction(db, "DELETE", "Paiement", id, "Suppression")
  },

  async getArrieres(db: DB) {
    const { data, error } = await db.from("arrieres").select("*")
    if (error) throw error
    return data as Arriere[]
  },
}

// ─── VENTES ───────────────────────────────────────────────────────────────────

export const ventesService = {
  async list(db: DB) {
    const { data, error } = await db
      .from("ventes")
      .select("*, vendeur:coproprietaires(nom, prenom), immeubles(nom, bloc_id, blocs(nom))")
      .order("created_at", { ascending: false })
    if (error) throw error
    return data
  },

  async create(db: DB, payload: Omit<Vente, "id" | "created_at" | "updated_at">) {
    const { data, error } = await db.from("ventes").insert(payload).select().single()
    if (error) throw error
    await logAction(db, "CREATE", "Vente", data.id, `Vente apt ${data.numero_appartement}`)
    return data as Vente
  },

  async update(db: DB, id: string, payload: Partial<Vente>) {
    const { data, error } = await db.from("ventes").update(payload).eq("id", id).select().single()
    if (error) throw error
    return data as Vente
  },

  async delete(db: DB, id: string) {
    const { error } = await db.from("ventes").delete().eq("id", id)
    if (error) throw error
    await logAction(db, "DELETE", "Vente", id, "Suppression")
  },
}

// ─── CERTIFICATS ──────────────────────────────────────────────────────────────

export const certificatsService = {
  async list(db: DB) {
    const { data, error } = await db
      .from("certificats_paiement")
      .select("*, coproprietaires(nom, prenom)")
      .order("created_at", { ascending: false })
    if (error) throw error
    return data as (CertificatPaiement & { coproprietaires: { nom: string; prenom: string } | null })[]
  },

  async generate(db: DB, coproprietaireId: string, periode: string) {
    const orgId = (await db.rpc("get_my_org_id").then((r) => r.data)) as string
    const { data: copro } = await db
      .from("coproprietaires")
      .select("nom, prenom")
      .eq("id", coproprietaireId)
      .single()

    const { data: paiementsData } = await db
      .from("paiements")
      .select("montant")
      .eq("coproprietaire_id", coproprietaireId)
      .eq("annee", periode)
      .eq("statut", "paye")

    const montantTotal = paiementsData?.reduce((s, p) => s + p.montant, 0) ?? 0

    const { data, error } = await db
      .from("certificats_paiement")
      .insert({ organisation_id: orgId, coproprietaire_id: coproprietaireId, periode, montant_total: montantTotal })
      .select()
      .single()
    if (error) throw error

    await logAction(db, "CREATE", "Certificat", data.id, `Certificat ${copro?.prenom} ${copro?.nom} - ${periode}`)
    return data as CertificatPaiement
  },
}

// ─── HISTORIQUE ───────────────────────────────────────────────────────────────

export const historyService = {
  async list(db: DB, limit = 100) {
    const { data, error } = await db
      .from("action_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)
    if (error) throw error
    return data as ActionHistory[]
  },
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

export const dashboardService = {
  async getStats(db: DB) {
    const orgId = (await db.rpc("get_my_org_id").then((r) => r.data)) as string
    const { data, error } = await db
      .from("dashboard_stats")
      .select("*")
      .eq("organisation_id", orgId)
      .single()
    if (error) throw error
    return data as DashboardStats
  },

  async getCollecteMensuelle(db: DB, annee?: number) {
    const orgId = (await db.rpc("get_my_org_id").then((r) => r.data)) as string
    let query = db
      .from("collecte_mensuelle")
      .select("*")
      .eq("organisation_id", orgId)
    if (annee) query = query.eq("annee", annee)
    const { data, error } = await query.order("mois")
    if (error) throw error
    return data as CollecteMensuelle[]
  },
}

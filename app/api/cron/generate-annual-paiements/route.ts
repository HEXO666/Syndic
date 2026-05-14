import { NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// Called by Vercel cron (GET) on Jan 1st each year, or manually by an admin.
// Creates an "impaye" paiement record for every copro that doesn't already
// have one for the target year, using their current montant_annuel as montant_du.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const yearParam = searchParams.get("year")
  const year = yearParam ? String(parseInt(yearParam, 10)) : String(new Date().getFullYear())

  // Auth: accept either the Vercel cron secret or a logged-in admin user
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get("authorization")
  const isCronCall = cronSecret && authHeader === `Bearer ${cronSecret}`

  if (!isCronCall) {
    // Fall back to session-based auth — must be admin or super_admin
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  const admin = createAdminSupabaseClient()

  // Fetch all copros across all organisations
  const { data: copros, error: coprosError } = await admin
    .from("coproprietaires")
    .select("id, organisation_id, montant_annuel")

  if (coprosError || !copros) {
    console.error("[generate-annual-paiements] fetch copros failed:", coprosError?.message)
    return NextResponse.json({ error: "Failed to fetch coproprietaires" }, { status: 500 })
  }

  // Fetch all paiements already existing for this year
  const { data: existing, error: existingError } = await admin
    .from("paiements")
    .select("coproprietaire_id")
    .eq("annee", year)

  if (existingError) {
    console.error("[generate-annual-paiements] fetch existing failed:", existingError?.message)
    return NextResponse.json({ error: "Failed to fetch existing paiements" }, { status: 500 })
  }

  const existingIds = new Set((existing ?? []).map((p) => p.coproprietaire_id))

  const toInsert = copros
    .filter((c) => !existingIds.has(c.id))
    .map((c) => ({
      organisation_id: c.organisation_id,
      coproprietaire_id: c.id,
      annee: year,
      statut: "impaye" as const,
      montant: 0,
      montant_du: c.montant_annuel,
      montant_restant: c.montant_annuel,
      methode_paiement: "especes" as const,
      date_paiement: null,
      numero_cheque: null,
      numero_virement: null,
    }))

  if (toInsert.length === 0) {
    return NextResponse.json({ year, created: 0, message: "All paiements already exist for this year" })
  }

  const { error: insertError } = await admin.from("paiements").insert(toInsert)

  if (insertError) {
    console.error("[generate-annual-paiements] insert failed:", insertError.message)
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  console.log(`[generate-annual-paiements] Created ${toInsert.length} impaye records for year ${year}`)
  return NextResponse.json({ year, created: toInsert.length })
}

import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

type Meta = {
  coproprietaire_id?: string
  coproprietaire_cin?: string
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const meta = (user.user_metadata ?? {}) as Meta
    const coproId = meta.coproprietaire_id
    const coproCin = meta.coproprietaire_cin

    if (!coproId && !coproCin) {
      return NextResponse.json({ linked: false })
    }

    const admin = createAdminSupabaseClient()

    const coproQuery = admin
      .from("coproprietaires")
      .select("*, immeubles(nom, bloc_id, blocs(nom))")

    const { data: copro, error: coproError } = coproId
      ? await coproQuery.eq("id", coproId).single()
      : await coproQuery.eq("cin", coproCin ?? "").single()

    if (coproError || !copro) {
      return NextResponse.json({ linked: false })
    }

    const { data: paiements, error: paieError } = await admin
      .from("paiements")
      .select("*")
      .eq("coproprietaire_id", copro.id)
      .order("annee", { ascending: false })

    if (paieError) {
      return NextResponse.json({ error: paieError.message }, { status: 400 })
    }

    return NextResponse.json({
      linked: true,
      coproprietaire: copro,
      paiements: paiements ?? [],
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

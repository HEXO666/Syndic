import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

type Body = {
  email: string
  password: string
  coproprietaireId: string
  coproprietaireCin?: string
  coproprietaireName: string
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: requesterProfile } = await supabase
      .from("profiles")
      .select("role, organisation_id")
      .eq("id", user.id)
      .single()

    if (!requesterProfile || requesterProfile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = (await req.json()) as Partial<Body>
    if (!body.email || !body.password || !body.coproprietaireId || !body.coproprietaireName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const admin = createAdminSupabaseClient()

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        nom: body.coproprietaireName,
        role: "copro",
        coproprietaire_id: body.coproprietaireId,
        coproprietaire_cin: body.coproprietaireCin ?? null,
      },
    })

    if (createError || !created.user) {
      return NextResponse.json({ error: createError?.message ?? "Failed to create user" }, { status: 400 })
    }

    const newUserId = created.user.id

    const { error: upsertError } = await admin.from("profiles").upsert({
      id: newUserId,
      nom: body.coproprietaireName,
      email: body.email,
      role: "copro",
      organisation_id: requesterProfile.organisation_id,
    })

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 400 })
    }

    // Link the new auth user to the coproprietaire row so RLS and the
    // situation API can look up by user_id instead of relying solely on metadata.
    await admin
      .from("coproprietaires")
      .update({ user_id: newUserId })
      .eq("id", body.coproprietaireId)

    return NextResponse.json({ userId: newUserId, email: body.email })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

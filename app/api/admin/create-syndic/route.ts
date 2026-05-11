import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

type Body = {
  nom: string
  email: string
  password: string
  immeubleIds: string[]
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: requesterProfile } = await supabase
      .from("profiles")
      .select("role, organisation_id")
      .eq("id", user.id)
      .single()

    if (!requesterProfile || requesterProfile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = (await req.json()) as Partial<Body>
    if (!body.email || !body.password || !body.nom) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const admin = createAdminSupabaseClient()

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: { nom: body.nom, role: "syndic" },
    })

    if (createError || !created.user) {
      return NextResponse.json({ error: createError?.message ?? "Failed to create user" }, { status: 400 })
    }

    const newUserId = created.user.id

    await admin.from("profiles").upsert({
      id: newUserId,
      nom: body.nom,
      email: body.email,
      role: "syndic",
      organisation_id: requesterProfile.organisation_id,
    })

    if (body.immeubleIds && body.immeubleIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any).from("syndic_immeubles").insert(
        body.immeubleIds.map((immeubleId) => ({
          syndic_id: newUserId,
          immeuble_id: immeubleId,
          organisation_id: requesterProfile.organisation_id!,
        })),
      )
    }

    return NextResponse.json({ userId: newUserId, email: body.email })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

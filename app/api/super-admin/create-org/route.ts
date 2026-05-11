import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

type Body = {
  nom: string
  email: string | null
  telephone: string | null
  adresse: string | null
  plan: string
  adminEmail: string
  adminPassword: string
  adminNom: string
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!profile || profile.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = (await req.json()) as Partial<Body>
    if (!body.nom || !body.adminEmail || !body.adminPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const admin = createAdminSupabaseClient()

    // 1. Create the organisation
    const { data: org, error: orgError } = await admin
      .from("organisations")
      .insert({
        nom: body.nom,
        email: body.email || null,
        telephone: body.telephone || null,
        adresse: body.adresse || null,
        plan: body.plan ?? "basic",
        status: "active",
      })
      .select()
      .single()

    if (orgError || !org) {
      return NextResponse.json({ error: orgError?.message ?? "Failed to create org" }, { status: 400 })
    }

    // 2. Create the admin auth user
    const adminNom = body.adminNom?.trim() || "Administrateur"
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: body.adminEmail,
      password: body.adminPassword,
      email_confirm: true,
      user_metadata: { nom: adminNom, role: "admin" },
    })

    if (createError || !created.user) {
      // Roll back org if user creation fails
      await admin.from("organisations").delete().eq("id", org.id)
      return NextResponse.json({ error: createError?.message ?? "Failed to create admin user" }, { status: 400 })
    }

    // 3. Create the admin profile linked to the org
    await admin.from("profiles").upsert({
      id: created.user.id,
      nom: adminNom,
      email: body.adminEmail,
      role: "admin",
      organisation_id: org.id,
    })

    return NextResponse.json({ org, adminId: created.user.id })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

type CoproMeta = {
  coproprietaire_id?: string
  coproprietaire_cin?: string
  username?: string
}

function isAdminBanDisabled(bannedUntil?: string) {
  if (!bannedUntil) return false
  const ts = Date.parse(bannedUntil)
  if (Number.isNaN(ts)) return true
  return ts > Date.now()
}

async function assertAdmin() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return { ok: false as const, status: 401, message: "Unauthorized" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organisation_id")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return { ok: false as const, status: 403, message: "Forbidden" }
  }

  return { ok: true as const, organisationId: profile.organisation_id as string | null }
}

export async function GET() {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.status })

  const admin = createAdminSupabaseClient()

  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200, page: 1 })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const users = data?.users ?? []

  const coproUsers = users
    .map((u) => {
      const meta = (u.user_metadata ?? {}) as CoproMeta
      return { u, meta }
    })
    .filter(({ meta }) => !!meta.coproprietaire_id)

  const coproIds = coproUsers.map(({ meta }) => meta.coproprietaire_id!).filter(Boolean)

  const { data: copros, error: coproError } = await admin
    .from("coproprietaires")
    .select("id, nom, prenom, cin, numero_appartement")
    .in("id", coproIds)

  if (coproError) return NextResponse.json({ error: coproError.message }, { status: 400 })

  const coproById = new Map<string, (typeof copros)[number]>()
  ;(copros ?? []).forEach((c) => coproById.set(c.id, c))

  const accounts = coproUsers.map(({ u, meta }) => {
    const coproId = meta.coproprietaire_id as string
    const copro = coproById.get(coproId) ?? null

    const email = u.email ?? ""
    const username = meta.username ?? email.split("@")[0] ?? ""

    return {
      userId: u.id,
      email,
      username,
      disabled: isAdminBanDisabled(u.banned_until ?? undefined),
      bannedUntil: u.banned_until ?? null,
      copro: copro
        ? {
            id: copro.id,
            nom: copro.nom,
            prenom: copro.prenom,
            cin: copro.cin,
            numeroAppartement: copro.numero_appartement,
          }
        : null,
    }
  })

  return NextResponse.json({ accounts })
}

type PatchBody = {
  userId: string
  email?: string
  password?: string
  username?: string
  disabled?: boolean
}

export async function PATCH(req: Request) {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.status })

  const body = (await req.json()) as Partial<PatchBody>
  if (!body.userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 })

  const admin = createAdminSupabaseClient()

  const { data: existing, error: existingError } = await admin.auth.admin.getUserById(body.userId)
  if (existingError || !existing.user) {
    return NextResponse.json({ error: existingError?.message ?? "User not found" }, { status: 404 })
  }

  const existingMeta = (existing.user.user_metadata ?? {}) as Record<string, unknown>
  const nextMeta = {
    ...existingMeta,
    ...(body.username !== undefined ? { username: body.username } : null),
  }

  const ban_duration = body.disabled === undefined ? undefined : body.disabled ? "876000h" : "none"

  const { data: updated, error: updateError } = await admin.auth.admin.updateUserById(body.userId, {
    ...(body.email !== undefined ? { email: body.email } : null),
    ...(body.password !== undefined ? { password: body.password } : null),
    user_metadata: nextMeta,
    ...(ban_duration !== undefined ? { ban_duration } : null),
  })

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 })

  if (body.email !== undefined) {
    await admin.from("profiles").update({ email: body.email }).eq("id", body.userId)
  }

  return NextResponse.json({ ok: true, userId: updated.user?.id ?? body.userId })
}

import { NextRequest, NextResponse } from 'next/server'
import { getProfile, setProfile } from '@/lib/kv'
import type { FocusProfile } from '@/lib/types'

export const runtime = 'nodejs'

// GET /api/profile — returns the stored focus profile (null if not yet saved)
export async function GET() {
  try {
    const profile = await getProfile()
    return NextResponse.json({ profile })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// PUT /api/profile — saves the focus profile (body: { profile: FocusProfile })
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const profile: FocusProfile = body.profile
    if (!profile || typeof profile !== 'object') {
      return NextResponse.json({ error: 'Missing profile' }, { status: 400 })
    }
    await setProfile(profile)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

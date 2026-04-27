import { NextRequest, NextResponse } from 'next/server'
import { analyzeVideo } from '@/lib/llm'
import type { AnalyzeRequest } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  let body: AnalyzeRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { title, channel, duration, category, transcript, profile } = body

  if (!title || !transcript || !profile) {
    return NextResponse.json({ error: 'Missing required fields: title, transcript, profile' }, { status: 400 })
  }

  try {
    const result = await analyzeVideo({
      title,
      channel: channel || 'Unknown',
      duration: Number(duration) || 60,
      category: category || 'general',
      transcript: String(transcript).slice(0, 80000),
      profile,
    })
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[/api/triage]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

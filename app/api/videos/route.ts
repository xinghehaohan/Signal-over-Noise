import { NextRequest, NextResponse } from 'next/server'
import { getVideos, setVideos } from '@/lib/kv'
import type { Video } from '@/lib/types'

export const runtime = 'nodejs'

// GET /api/videos — returns the stored video list
export async function GET() {
  try {
    const videos = await getVideos()
    return NextResponse.json({ videos })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// POST /api/videos — replaces the entire video list (body: { videos: Video[] })
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const videos: Video[] = Array.isArray(body.videos) ? body.videos : []
    await setVideos(videos)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// PATCH /api/videos — prepend a single video (body: { video: Video })
// Used by batch ingest to avoid read-modify-write races between concurrent workers.
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const video: Video = body.video
    if (!video || !video.id) {
      return NextResponse.json({ error: 'Missing video' }, { status: 400 })
    }
    const existing = await getVideos()
    await setVideos([video, ...existing])
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

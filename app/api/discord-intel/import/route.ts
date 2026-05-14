export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { importDiscordJsonlText } from '@/lib/discord-intel/import-jsonl'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded. Send a file field named "file".' }, { status: 400 })
    }

    const filename = (file as File).name ?? ''
    const isJsonl =
      filename.endsWith('.jsonl') || filename.endsWith('.ndjson')

    if (!isJsonl) {
      return NextResponse.json(
        { error: `Unsupported file type: ${filename}. Only .jsonl or .ndjson files are accepted.` },
        { status: 400 }
      )
    }

    const text = await (file as File).text()

    if (!text.trim()) {
      return NextResponse.json({ error: 'Uploaded file is empty.' }, { status: 400 })
    }

    const summary = await importDiscordJsonlText(text)

    return NextResponse.json({ success: true, data: summary })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

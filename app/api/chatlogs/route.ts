import { readdir } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

const DIR = path.join(process.cwd(), 'htmlFromDiscordChat')

function labelFromFilename(name: string): string {
  // Extract the channel portion between the double underscores
  const match = name.match(/__(.+?)_\d{4}-\d{2}-\d{2}_to_/)
  return match ? match[1] : name.replace('.html', '')
}

export async function GET() {
  const files = (await readdir(DIR)).filter(f => f.endsWith('.html'))
  const chatlogs = files.map(filename => ({
    filename,
    label: labelFromFilename(filename),
  }))
  return NextResponse.json(chatlogs)
}

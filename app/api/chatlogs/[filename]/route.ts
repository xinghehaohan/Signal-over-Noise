import { readFile } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

const DIR = path.join(process.cwd(), 'htmlFromDiscordChat')

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  // Prevent path traversal
  if (filename.includes('..') || filename.includes('/')) {
    return new NextResponse('Not found', { status: 404 })
  }
  const filePath = path.join(DIR, decodeURIComponent(filename))
  const html = await readFile(filePath, 'utf-8')
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

import { readdir } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

const DIR = path.join(process.cwd(), 'htmlFromDiscordChat')

const LABELS: Record<string, string> = {
  'liubianshi_en.html': 'Sixpence Report',
  'AI数据中心连接研报.html': 'AI Data Center',
  'stock_selection_report_back_2025_to_today.html': 'Stock Selection',
  'AI Assistant Daily Report.html': 'AI Daily Report',
  // '美股会员网-AI小助手05052026 142617 (1)_beautiful.html': 'AI小助手',
}

function labelFromFilename(name: string): string {
  if (LABELS[name]) return LABELS[name]
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

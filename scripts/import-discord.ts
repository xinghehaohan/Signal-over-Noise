/**
 * CLI import for large Discord JSONL files — bypasses the HTTP API entirely.
 *
 * Usage:
 *   npx tsx scripts/import-discord.ts path/to/export.jsonl
 *
 * Reads env from .env.local automatically.
 */

import * as fs from 'fs'
import * as readline from 'readline'
import * as path from 'path'
import * as crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// ── Load .env.local ────────────────────────────────────────────
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (key && !process.env[key]) process.env[key] = val
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const BATCH_SIZE = 500

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
})

// ── Types (inline to avoid Next.js path aliases) ──────────────
interface Manifest {
  type: 'manifest'
  channel_id: string
  channel_name: string
  server_id?: string
  server_name?: string
  chat_type?: string
  schema_version?: string
  run_id?: string
  start_date?: string
  end_date?: string
  exported_at?: string
  message_count?: number
}

interface RawMessage {
  id: string
  channel_id?: string
  type?: number
  content?: string
  timestamp?: string
  edited_timestamp?: string | null
  mention_everyone?: boolean
  pinned?: boolean
  tts?: boolean
  flags?: number
  attachments?: RawAttachment[]
  embeds?: unknown[]
  'author.id'?: string
  'author.username'?: string
  'author.global_name'?: string | null
  [key: string]: unknown
}

interface RawAttachment {
  id?: string
  filename?: string
  title?: string
  content_type?: string
  original_content_type?: string
  size?: number
  width?: number
  height?: number
  url?: string
  proxy_url?: string
}

// ── Helpers ───────────────────────────────────────────────────
function cleanName(name: string | undefined | null): string | null {
  if (!name) return null
  return name.replace(/[_-]/g, ' ').replace(/\s+/g, ' ').trim()
}

function buildMessageRow(
  msg: RawMessage,
  sourceId: string,
  runDbId: string,
  fallbackChannelId: string
) {
  const content = typeof msg.content === 'string' ? msg.content : ''
  const contentHash = crypto.createHash('sha256').update(content).digest('hex')
  const attachments = Array.isArray(msg.attachments) ? msg.attachments : []
  const embeds = Array.isArray(msg.embeds) ? msg.embeds : []
  return {
    source_id: sourceId,
    import_run_id: runDbId,
    external_message_id: msg.id,
    external_channel_id: (msg.channel_id as string) ?? fallbackChannelId,
    discord_message_type: typeof msg.type === 'number' ? msg.type : null,
    author_external_id: msg['author.id'] ?? null,
    author_username: msg['author.username'] ?? null,
    author_global_name: msg['author.global_name'] ?? null,
    content,
    content_hash: contentHash,
    created_at_source: msg.timestamp ?? null,
    edited_at_source: msg.edited_timestamp ?? null,
    mention_everyone: Boolean(msg.mention_everyone),
    pinned: Boolean(msg.pinned),
    tts: Boolean(msg.tts),
    flags: typeof msg.flags === 'number' ? msg.flags : null,
    has_attachments: attachments.length > 0,
    has_embeds: embeds.length > 0,
    raw: msg,
    updated_at: new Date().toISOString(),
  }
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Usage: npx tsx scripts/import-discord.ts <path-to-file.jsonl>')
    process.exit(1)
  }

  const absPath = path.resolve(filePath)
  if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${absPath}`)
    process.exit(1)
  }

  const fileSizeMB = (fs.statSync(absPath).size / 1024 / 1024).toFixed(1)
  console.log(`\nImporting: ${absPath} (${fileSizeMB} MB)`)

  // ── Stream-parse the JSONL ────────────────────────────────────
  const rl = readline.createInterface({
    input: fs.createReadStream(absPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })

  let manifest: Manifest | null = null
  const messages: RawMessage[] = []
  let lineNum = 0
  let parseErrors = 0

  for await (const line of rl) {
    const trimmed = line.trim()
    if (!trimmed) continue
    lineNum++

    try {
      const obj = JSON.parse(trimmed) as Record<string, unknown>
      if (lineNum === 1) {
        if (obj.type !== 'manifest') throw new Error('First line is not a manifest object')
        manifest = obj as unknown as Manifest
        console.log(`Channel : ${manifest.channel_name} (${manifest.channel_id})`)
        console.log(`Server  : ${manifest.server_name ?? 'unknown'}`)
        console.log(`Declared: ${manifest.message_count ?? '?'} messages\n`)
      } else {
        messages.push(obj as unknown as RawMessage)
      }
    } catch (err) {
      parseErrors++
      if (parseErrors <= 5) {
        console.warn(`  Parse error line ${lineNum}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }

  if (!manifest) {
    console.error('No manifest found — is this a valid Discord Intel JSONL?')
    process.exit(1)
  }

  console.log(`Parsed  : ${messages.length} messages (${parseErrors} parse errors)\n`)

  // ── Upsert discord_sources ────────────────────────────────────
  const { data: sourceData, error: sourceError } = await supabase
    .from('discord_sources')
    .upsert(
      {
        external_channel_id: manifest.channel_id,
        external_server_id: manifest.server_id ?? null,
        server_name_raw: manifest.server_name ?? null,
        channel_name_raw: manifest.channel_name,
        server_name_clean: cleanName(manifest.server_name),
        channel_name_clean: cleanName(manifest.channel_name),
        chat_type: manifest.chat_type ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'external_channel_id' }
    )
    .select('id')
    .single()

  if (sourceError || !sourceData) {
    console.error('Failed to upsert discord_sources:', sourceError?.message)
    process.exit(1)
  }

  const sourceId = sourceData.id as string

  // ── Create import run ─────────────────────────────────────────
  const runId = manifest.run_id ?? `${manifest.channel_id}_${manifest.exported_at}_${Date.now()}`
  const { data: runData, error: runError } = await supabase
    .from('discord_import_runs')
    .upsert(
      {
        source_id: sourceId,
        run_id: runId,
        schema_version: manifest.schema_version ?? null,
        range_start: manifest.start_date ?? null,
        range_end: manifest.end_date ?? null,
        message_count_declared: manifest.message_count ?? null,
        exported_at: manifest.exported_at ?? null,
        manifest_raw: manifest,
        status: 'importing',
      },
      { onConflict: 'run_id' }
    )
    .select('id')
    .single()

  if (runError || !runData) {
    console.error('Failed to create import run:', runError?.message)
    process.exit(1)
  }

  const runDbId = runData.id as string

  // ── Batch upsert messages ─────────────────────────────────────
  const totalBatches = Math.ceil(messages.length / BATCH_SIZE)
  let inserted = 0
  let attachmentCount = 0
  const importErrors: string[] = []
  const startTime = Date.now()

  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    const pct = Math.round((i / messages.length) * 100)
    process.stdout.write(`\r  Batch ${batchNum}/${totalBatches} — ${pct}% — ${elapsed}s`)

    const rows = batch.map(msg => buildMessageRow(msg, sourceId, runDbId, manifest!.channel_id))

    const { data: upserted, error: msgError } = await supabase
      .from('discord_messages')
      .upsert(rows, { onConflict: 'external_channel_id,external_message_id' })
      .select('id, external_message_id')

    if (msgError) {
      importErrors.push(`Batch ${batchNum}: ${msgError.message}`)
      continue
    }

    inserted += upserted?.length ?? 0

    // Attachments
    if (upserted && upserted.length > 0) {
      const msgIdMap = new Map<string, string>(
        upserted.map(m => [m.external_message_id as string, m.id as string])
      )

      for (const msg of batch) {
        const atts = Array.isArray(msg.attachments) ? msg.attachments : []
        if (atts.length === 0) continue
        const dbId = msgIdMap.get(msg.id)
        if (!dbId) continue

        await supabase.from('discord_attachments').delete().eq('message_id', dbId)

        const attRows = atts.map(att => ({
          message_id: dbId,
          external_attachment_id: att.id ?? null,
          filename: att.filename ?? null,
          title: att.title ?? null,
          content_type: att.content_type ?? null,
          original_content_type: att.original_content_type ?? null,
          size_bytes: typeof att.size === 'number' ? att.size : null,
          width: typeof att.width === 'number' ? att.width : null,
          height: typeof att.height === 'number' ? att.height : null,
          url: att.url ?? null,
          proxy_url: att.proxy_url ?? null,
          raw: att,
        }))

        const { error: attErr } = await supabase.from('discord_attachments').insert(attRows)
        if (attErr) importErrors.push(`Attachments msg ${msg.id}: ${attErr.message}`)
        else attachmentCount += attRows.length
      }
    }
  }

  // ── Finalise run ──────────────────────────────────────────────
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
  const finalStatus = importErrors.length > 0 ? 'partial' : 'completed'

  await supabase
    .from('discord_import_runs')
    .update({
      message_count_ingested: inserted,
      duplicate_count: 0,
      status: finalStatus,
      error: importErrors.length > 0 ? importErrors.slice(0, 20).join('\n') : null,
    })
    .eq('id', runDbId)

  process.stdout.write('\n\n')
  console.log(`Done in ${totalTime}s`)
  console.log(`  Messages  : ${inserted}`)
  console.log(`  Attachments: ${attachmentCount}`)
  if (importErrors.length > 0) {
    console.log(`  Errors (${importErrors.length}):`)
    importErrors.slice(0, 10).forEach(e => console.log(`    ${e}`))
  }
}

main().catch(err => {
  console.error('\nFatal:', err)
  process.exit(1)
})

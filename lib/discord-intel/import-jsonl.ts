import { createHash } from 'crypto'
import { getSupabaseAdmin } from './supabase-admin'
import { parseJsonlText } from './parse-jsonl'
import { cleanServerName, cleanChannelName } from './clean-names'
import type { DiscordRawMessage, DiscordRawAttachment, DiscordRawEmbed, ImportSummary } from './types'


const BATCH_SIZE = 500

export async function importDiscordJsonlText(text: string): Promise<ImportSummary> {
  const supabase = getSupabaseAdmin()
  const { manifest, messages, errors: parseErrors } = parseJsonlText(text)

  const importErrors: string[] = parseErrors.map(e => `Line ${e.line}: ${e.error}`)

  // 1. Upsert discord_sources
  const { data: sourceData, error: sourceError } = await supabase
    .from('discord_sources')
    .upsert(
      {
        external_channel_id: manifest.channel_id,
        external_server_id: manifest.server_id,
        server_name_raw: manifest.server_name,
        channel_name_raw: manifest.channel_name,
        server_name_clean: cleanServerName(manifest.server_name),
        channel_name_clean: cleanChannelName(manifest.channel_name),
        chat_type: manifest.chat_type,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'external_channel_id' }
    )
    .select('id')
    .single()

  if (sourceError || !sourceData) {
    throw new Error(`Failed to upsert discord_sources: ${sourceError?.message ?? 'no data returned'}`)
  }

  const sourceId = sourceData.id as string

  // 2. Determine run_id
  const runId =
    manifest.run_id ??
    `${manifest.channel_id}_${manifest.exported_at}_${Date.now()}`

  // 3. Insert discord_import_runs (upsert so reimporting the same run_id is safe)
  const { data: runData, error: runError } = await supabase
    .from('discord_import_runs')
    .upsert(
      {
        source_id: sourceId,
        run_id: runId,
        schema_version: manifest.schema_version,
        range_start: manifest.start_date,
        range_end: manifest.end_date,
        message_count_declared: manifest.message_count,
        exported_at: manifest.exported_at,
        manifest_raw: manifest,
        status: 'importing',
      },
      { onConflict: 'run_id' }
    )
    .select('id')
    .single()

  if (runError || !runData) {
    throw new Error(`Failed to create import run: ${runError?.message ?? 'no data returned'}`)
  }

  const runDbId = runData.id as string

  // 4. Process messages in batches
  let insertedOrUpdatedCount = 0
  let duplicateCount = 0
  let attachmentCount = 0
  let embedCount = 0

  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1

    // Build upsert rows
    const messageRows = batch.map(msg =>
      buildMessageRow(msg, sourceId, runDbId, manifest.channel_id)
    )

    const { data: upserted, error: msgError } = await supabase
      .from('discord_messages')
      .upsert(messageRows, { onConflict: 'external_channel_id,external_message_id' })
      .select('id, external_message_id')

    if (msgError) {
      importErrors.push(`Batch ${batchNum} upsert failed: ${msgError.message}`)
      continue
    }

    insertedOrUpdatedCount += upserted?.length ?? 0

    // 5. Process attachments
    if (upserted && upserted.length > 0) {
      const messageIdMap = new Map<string, string>(
        upserted.map(m => [m.external_message_id as string, m.id as string])
      )

      for (const msg of batch) {
        const attachments: DiscordRawAttachment[] = Array.isArray(msg.attachments)
          ? msg.attachments
          : []
        if (attachments.length === 0) continue

        const dbMessageId = messageIdMap.get(msg.id)
        if (!dbMessageId) continue

        await supabase.from('discord_attachments').delete().eq('message_id', dbMessageId)

        const attRows = attachments.map(att => ({
          message_id: dbMessageId,
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

        const { error: attError } = await supabase.from('discord_attachments').insert(attRows)

        if (attError) {
          importErrors.push(`Attachments for message ${msg.id}: ${attError.message}`)
        } else {
          attachmentCount += attRows.length
        }
      }

      // 5b. Process embeds
      for (const msg of batch) {
        const embeds: DiscordRawEmbed[] = Array.isArray(msg.embeds) ? msg.embeds : []
        if (embeds.length === 0) continue

        const dbMessageId = messageIdMap.get(msg.id)
        if (!dbMessageId) continue

        await supabase.from('discord_embeds').delete().eq('message_id', dbMessageId)

        const embedRows = embeds.map((emb, pos) => ({
          message_id: dbMessageId,
          position: pos,
          embed_type: emb.type ?? null,
          title: emb.title ?? null,
          description: emb.description ?? null,
          url: emb.url ?? null,
          color: typeof emb.color === 'number' ? emb.color : null,
          image_url: emb.image?.url ?? null,
          image_proxy_url: emb.image?.proxy_url ?? null,
          image_width: typeof emb.image?.width === 'number' ? emb.image.width : null,
          image_height: typeof emb.image?.height === 'number' ? emb.image.height : null,
          thumbnail_url: emb.thumbnail?.url ?? null,
          thumbnail_proxy_url: emb.thumbnail?.proxy_url ?? null,
          footer_text: emb.footer?.text ?? null,
          author_name: emb.author?.name ?? null,
          raw: emb,
        }))

        const { error: embError } = await supabase.from('discord_embeds').insert(embedRows)

        if (embError) {
          importErrors.push(`Embeds for message ${msg.id}: ${embError.message}`)
        } else {
          embedCount += embedRows.length
        }
      }
    }
  }

  // 6. Update import run with final stats
  const finalStatus =
    messages.length === 0 && importErrors.length > 0
      ? 'failed'
      : importErrors.length > 0
      ? 'partial'
      : 'completed'

  await supabase
    .from('discord_import_runs')
    .update({
      message_count_ingested: insertedOrUpdatedCount,
      duplicate_count: duplicateCount,
      status: finalStatus,
      error: importErrors.length > 0 ? importErrors.slice(0, 20).join('\n') : null,
    })
    .eq('id', runDbId)

  return {
    runId,
    sourceId,
    externalChannelId: manifest.channel_id,
    channelName: cleanChannelName(manifest.channel_name) ?? manifest.channel_name,
    serverName: cleanServerName(manifest.server_name) ?? manifest.server_name,
    declaredCount: manifest.message_count,
    parsedCount: messages.length,
    insertedOrUpdatedCount,
    duplicateCount,
    attachmentCount,
    embedCount,
    errors: importErrors,
  }
}

function buildMessageRow(
  msg: DiscordRawMessage,
  sourceId: string,
  runDbId: string,
  fallbackChannelId: string
) {
  const content = typeof msg.content === 'string' ? msg.content : ''
  const contentHash = createHash('sha256').update(content).digest('hex')
  const attachments = Array.isArray(msg.attachments) ? msg.attachments : []
  const embeds = Array.isArray(msg.embeds) ? msg.embeds : []

  return {
    source_id: sourceId,
    import_run_id: runDbId,
    external_message_id: msg.id,
    external_channel_id: (msg.channel_id as string) ?? fallbackChannelId,
    discord_message_type: typeof msg.type === 'number' ? msg.type : null,
    author_external_id: (msg['author.id'] as string | undefined) ?? null,
    author_username: (msg['author.username'] as string | undefined) ?? null,
    author_global_name: (msg['author.global_name'] as string | null | undefined) ?? null,
    content,
    content_hash: contentHash,
    created_at_source: (msg.timestamp as string | undefined) ?? null,
    edited_at_source: (msg.edited_timestamp as string | null | undefined) ?? null,
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

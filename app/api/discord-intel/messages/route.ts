export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/discord-intel/supabase-admin'

const MAX_LIMIT = 500
const DEFAULT_LIMIT = 100

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const channelId = searchParams.get('channelId') ?? undefined
    const sourceId = searchParams.get('sourceId') ?? undefined
    const q = searchParams.get('q') ?? undefined
    const from = searchParams.get('from') ?? undefined
    const to = searchParams.get('to') ?? undefined
    const hasAttachments = searchParams.get('hasAttachments') ?? undefined
    const rawLimit = parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10)
    const rawOffset = parseInt(searchParams.get('offset') ?? '0', 10)

    const limit = Math.min(isNaN(rawLimit) ? DEFAULT_LIMIT : rawLimit, MAX_LIMIT)
    const offset = isNaN(rawOffset) ? 0 : Math.max(0, rawOffset)

    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('discord_messages')
      .select(
        `
        id,
        external_message_id,
        external_channel_id,
        content,
        author_external_id,
        author_username,
        author_global_name,
        created_at_source,
        edited_at_source,
        has_attachments,
        has_embeds,
        mention_everyone,
        pinned,
        source:discord_sources ( server_name_clean, channel_name_clean ),
        attachments:discord_attachments (
          id,
          external_attachment_id,
          filename,
          title,
          content_type,
          size_bytes,
          width,
          height,
          url,
          proxy_url
        ),
        embeds:discord_embeds (
          id,
          position,
          embed_type,
          title,
          description,
          url,
          color,
          image_url,
          image_proxy_url,
          image_width,
          image_height,
          thumbnail_url,
          thumbnail_proxy_url,
          footer_text,
          author_name
        )
      `,
        { count: 'exact' }
      )
      .order('created_at_source', { ascending: false })
      .range(offset, offset + limit - 1)

    if (channelId) query = query.eq('external_channel_id', channelId)
    if (sourceId) query = query.eq('source_id', sourceId)
    if (q) query = query.ilike('content', `%${q}%`)
    if (from) query = query.gte('created_at_source', from)
    if (to) query = query.lte('created_at_source', to)

    if (hasAttachments === 'true') {
      query = query.eq('has_attachments', true)
    } else if (hasAttachments === 'false') {
      query = query.eq('has_attachments', false)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      items: data ?? [],
      totalApprox: count ?? 0,
      limit,
      offset,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

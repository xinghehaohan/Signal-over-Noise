export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/discord-intel/supabase-admin'
import type { DiscordSource } from '@/lib/discord-intel/types'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data: sources, error } = await supabase
      .from('discord_sources')
      .select(
        'id, external_channel_id, external_server_id, server_name_clean, channel_name_clean, category, tags, priority, enabled'
      )
      .eq('enabled', true)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!sources || sources.length === 0) {
      return NextResponse.json({ items: [] })
    }

    // Fetch message count and latest timestamp per source in parallel
    const statsResults = await Promise.all(
      sources.map(src =>
        Promise.all([
          supabase
            .from('discord_messages')
            .select('*', { count: 'exact', head: true })
            .eq('source_id', src.id),
          supabase
            .from('discord_messages')
            .select('created_at_source')
            .eq('source_id', src.id)
            .order('created_at_source', { ascending: false })
            .limit(1)
            .maybeSingle(),
        ])
      )
    )

    const items: DiscordSource[] = sources.map((src, i) => {
      const [countRes, lastRes] = statsResults[i]
      return {
        id: src.id as string,
        external_channel_id: src.external_channel_id as string,
        external_server_id: (src.external_server_id as string | null) ?? null,
        server_name_clean: (src.server_name_clean as string | null) ?? null,
        channel_name_clean: (src.channel_name_clean as string | null) ?? null,
        category: (src.category as string | null) ?? null,
        tags: (src.tags as string[]) ?? [],
        priority: (src.priority as number) ?? 3,
        enabled: (src.enabled as boolean) ?? true,
        message_count: countRes.count ?? 0,
        attachment_count: 0,
        last_message_at: (lastRes.data?.created_at_source as string | null) ?? null,
      }
    })

    items.sort((a, b) => {
      const s = (a.server_name_clean ?? '').localeCompare(b.server_name_clean ?? '', 'zh')
      if (s !== 0) return s
      const c = (a.category ?? 'Channels').localeCompare(b.category ?? 'Channels', 'zh')
      if (c !== 0) return c
      return (a.channel_name_clean ?? '').localeCompare(b.channel_name_clean ?? '', 'zh')
    })

    return NextResponse.json({ items })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

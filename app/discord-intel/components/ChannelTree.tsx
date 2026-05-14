import React from 'react'
import type { DiscordSource } from '@/lib/discord-intel/types'

interface ChannelTreeProps {
  sources: DiscordSource[]
  selectedId: string | null
  onSelect: (channelId: string) => void
}

type CategoryMap = Map<string, DiscordSource[]>
type ServerMap = Map<string, CategoryMap>

function buildTree(sources: DiscordSource[]): ServerMap {
  const tree: ServerMap = new Map()
  for (const src of sources) {
    const server = src.server_name_clean ?? 'Unknown Server'
    const category = src.category ?? 'Channels'
    if (!tree.has(server)) tree.set(server, new Map())
    const catMap = tree.get(server)!
    if (!catMap.has(category)) catMap.set(category, [])
    catMap.get(category)!.push(src)
  }
  return tree
}

function formatCount(n: number): string {
  if (n === 0) return ''
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function ChannelTree({ sources, selectedId, onSelect }: ChannelTreeProps) {
  const tree = buildTree(sources)

  return (
    <>
      {Array.from(tree.entries()).map(([serverName, categoryMap]) => (
        <div key={serverName} className="dc-server-group">
          <div className="dc-server-label">{serverName}</div>
          {Array.from(categoryMap.entries()).map(([catName, chSources]) => (
            <div key={catName}>
              {categoryMap.size > 1 || catName !== 'Channels' ? (
                <div className="dc-category-label">{catName}</div>
              ) : null}
              {chSources.map(src => (
                <div
                  key={src.external_channel_id}
                  className={`dc-ch-item${src.external_channel_id === selectedId ? ' dc-selected' : ''}`}
                  onClick={() => onSelect(src.external_channel_id)}
                >
                  <span className="dc-ch-hash">#</span>
                  <span className="dc-ch-name">
                    {src.channel_name_clean ?? src.external_channel_id}
                  </span>
                  {src.message_count > 0 && (
                    <span className="dc-ch-badge">{formatCount(src.message_count)}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </>
  )
}

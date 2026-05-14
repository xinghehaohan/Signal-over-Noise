import React from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { DiscordSource } from '@/lib/discord-intel/types'
import { ChannelTree } from './ChannelTree'

interface ChannelSidebarProps {
  sources: DiscordSource[]
  loading: boolean
  selectedId: string | null
  onSelect: (channelId: string) => void
  isOpen?: boolean
  onClose?: () => void
}

export function ChannelSidebar({ sources, loading, selectedId, onSelect, isOpen, onClose }: ChannelSidebarProps) {
  return (
    <div className={`dc-sidebar${isOpen ? ' dc-open' : ''}`}>
      <div className="dc-sb-header">
        <span className="dc-sb-title">Discord Intel</span>
        <Link href="/discord-intel/import" className="dc-sb-action" title="Import">
          <Plus size={14} />
        </Link>
      </div>

      <div className="dc-sb-scroll">
        {loading && <div className="dc-sb-loading">Loading…</div>}
        {!loading && sources.length === 0 && (
          <div className="dc-sb-empty">
            No channels yet.
            <br />
            <Link href="/discord-intel/import" style={{ color: '#9e1b1b', textDecoration: 'underline' }}>
              Import a file
            </Link>
          </div>
        )}
        {!loading && sources.length > 0 && (
          <ChannelTree
            sources={sources}
            selectedId={selectedId}
            onSelect={(id) => {
              onSelect(id)
              onClose?.()
            }}
          />
        )}
      </div>
    </div>
  )
}

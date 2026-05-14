import React from 'react'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { DiscordMessageTimelineItem } from '@/lib/discord-intel/types'
import { MessageRow, formatDateKey } from './MessageRow'

interface MessageListProps {
  messages: DiscordMessageTimelineItem[]
  loading: boolean
  loadingMore: boolean
  totalApprox: number
  channelName?: string
  onLoadMore: () => void
  onScroll?: React.UIEventHandler<HTMLDivElement>
}

export function MessageList({
  messages,
  loading,
  loadingMore,
  totalApprox,
  channelName,
  onLoadMore,
  onScroll,
}: MessageListProps) {
  if (loading) {
    return (
      <div className="dc-empty">
        <Loader2 size={22} className="dc-spin" style={{ color: '#9b8e7a', marginBottom: 12 }} />
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="dc-empty">
        <div className="dc-empty-title">
          {channelName ? `No messages in #${channelName}` : 'No messages found'}
        </div>
        <div className="dc-empty-sub">
          Try adjusting filters, or{' '}
          <Link href="/discord-intel/import" style={{ color: '#8b6b56' }}>
            import a file
          </Link>
          .
        </div>
      </div>
    )
  }

  return (
    <div className="dc-msgs-wrap" onScroll={onScroll}>
      {messages.length > 0 && (
        <div className="dc-msgs-meta">
          {messages.length} of {totalApprox} messages
        </div>
      )}

      {messages.map((msg, idx) => {
        const prev = messages[idx + 1] // list is newest-first, so "prev in time" is next in array
        const curKey = formatDateKey(msg.created_at_source)
        const prevKey = prev ? formatDateKey(prev.created_at_source) : null
        const showDateSep = curKey !== prevKey

        return (
          <MessageRow
            key={msg.id}
            message={msg}
            showDateSep={showDateSep}
          />
        )
      })}

      {messages.length < totalApprox && (
        <div className="dc-load-more">
          <button
            className="dc-load-more-btn"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore
              ? <><Loader2 size={13} className="dc-spin" /> Loading…</>
              : `Load ${Math.min(100, totalApprox - messages.length)} more`
            }
          </button>
        </div>
      )}
    </div>
  )
}

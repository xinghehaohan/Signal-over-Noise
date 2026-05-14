import React from 'react'
import type { DiscordMessageTimelineItem } from '@/lib/discord-intel/types'
import { AttachmentPreview } from './AttachmentPreview'

const AVATAR_COLORS = [
  '#8B1A1A', '#1A5C8B', '#1A8B45', '#7A5C1A',
  '#5C1A8B', '#1A7A8B', '#8B3D1A', '#2E6B2E',
]

function avatarColor(id: string | null): string {
  if (!id) return '#6B6359'
  let h = 0
  for (let i = 0; i < id.length; i++) h = ((h * 31) + id.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

function displayName(msg: DiscordMessageTimelineItem): string {
  return msg.author_global_name || msg.author_username || msg.author_external_id || 'Unknown'
}

function formatTime(ts: string | null): string {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return ts
  }
}

export function formatDateKey(ts: string | null): string {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export function formatDateLabel(ts: string | null): string {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

interface MessageRowProps {
  message: DiscordMessageTimelineItem
  showDateSep: boolean
}

export function MessageRow({ message: msg, showDateSep }: MessageRowProps) {
  const name = displayName(msg)
  const color = avatarColor(msg.author_external_id)
  const initial = name ? name[0].toUpperCase() : '?'
  const hasBadges = msg.mention_everyone || msg.pinned || !!msg.edited_at_source
  return (
    <>
      {showDateSep && (
        <div className="dc-date-sep">
          <span className="dc-date-sep-line" />
          <span>{formatDateLabel(msg.created_at_source)}</span>
          <span className="dc-date-sep-line" />
        </div>
      )}

      <div className="dc-msg-row">
        <div className="dc-avatar" style={{ background: color }}>
          {initial}
        </div>

        <div className="dc-msg-body">
          <div className="dc-msg-header">
            {/* <span className="dc-msg-author">{formatTime(msg.created_at_source)}</span> */}
            <span className="dc-msg-time">{formatTime(msg.created_at_source)}</span>
          </div>

          {msg.content && (
            <div className="dc-msg-content">{msg.content}</div>
          )}

          {hasBadges && (
            <div className="dc-msg-badges">
              {msg.mention_everyone && (
                <span className="dc-badge dc-badge-everyone">@everyone</span>
              )}
              {msg.pinned && (
                <span className="dc-badge dc-badge-pinned">pinned</span>
              )}
              {msg.edited_at_source && (
                <span className="dc-badge dc-badge-edited">edited</span>
              )}
            </div>
          )}

          {msg.attachments && msg.attachments.length > 0 && (
            <AttachmentPreview attachments={msg.attachments} />
          )}
        </div>
      </div>
    </>
  )
}

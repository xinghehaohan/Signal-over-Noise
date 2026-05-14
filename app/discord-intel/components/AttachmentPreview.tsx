import React from 'react'
import { Paperclip, ExternalLink } from 'lucide-react'
import type { DiscordTimelineAttachment } from '@/lib/discord-intel/types'

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1_048_576).toFixed(1)} MB`
}

interface AttachmentPreviewProps {
  attachments: DiscordTimelineAttachment[]
}

export function AttachmentPreview({ attachments }: AttachmentPreviewProps) {
  if (!attachments || attachments.length === 0) return null

  return (
    <div className="dc-atts">
      {attachments.map((att, idx) => {
        const isImage = att.content_type?.startsWith('image/')
        const src = att.proxy_url ?? att.url
        const label = att.title || att.filename || 'attachment'

        if (isImage && src) {
          return (
            <div key={att.id ?? idx}>
              <a
                href={att.url ?? src}
                target="_blank"
                rel="noopener noreferrer"
                className="dc-att-img-wrap"
                style={{ display: 'inline-block' }}
              >
                <img
                  src={src}
                  alt={label}
                  className="dc-att-img"
                  loading="lazy"
                  style={
                    att.width && att.height
                      ? {
                          maxWidth: Math.min(att.width, 420),
                          maxHeight: Math.min(att.height, 320),
                        }
                      : undefined
                  }
                />
              </a>
              <div className="dc-att-img-cap">{label}</div>
            </div>
          )
        }

        return (
          <div key={att.id ?? idx} className="dc-att-file">
            <Paperclip size={16} className="dc-att-file-icon" />
            <div className="dc-att-file-info">
              <div className="dc-att-file-name">{label}</div>
              <div className="dc-att-file-meta">
                {att.content_type && <span>{att.content_type}</span>}
                {att.size_bytes ? <span> · {formatBytes(att.size_bytes)}</span> : null}
              </div>
            </div>
            {att.url && (
              <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="dc-att-link"
              >
                Open <ExternalLink size={10} />
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}

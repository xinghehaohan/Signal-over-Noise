import React from 'react'
import type { DiscordTimelineEmbed } from '@/lib/discord-intel/types'

function intToHex(color: number | null): string | undefined {
  if (color == null) return undefined
  return `#${color.toString(16).padStart(6, '0')}`
}

interface EmbedPreviewProps {
  embeds: DiscordTimelineEmbed[]
}

export function EmbedPreview({ embeds }: EmbedPreviewProps) {
  if (!embeds || embeds.length === 0) return null

  const sorted = [...embeds].sort((a, b) => a.position - b.position)

  return (
    <div className="dc-embeds">
      {sorted.map(emb => {
        const accentColor = intToHex(emb.color)
        const imgSrc = emb.image_proxy_url ?? emb.image_url
        const thumbSrc = emb.thumbnail_proxy_url ?? emb.thumbnail_url

        return (
          <div
            key={emb.id}
            className="dc-embed"
            style={accentColor ? { borderLeftColor: accentColor } : undefined}
          >
            {emb.author_name && (
              <div className="dc-embed-author">{emb.author_name}</div>
            )}

            {emb.title && (
              emb.url
                ? <a href={emb.url} target="_blank" rel="noopener noreferrer" className="dc-embed-title">{emb.title}</a>
                : <div className="dc-embed-title">{emb.title}</div>
            )}

            {emb.description && (
              <div className="dc-embed-desc">{emb.description}</div>
            )}

            {imgSrc && (
              <a
                href={emb.image_url ?? imgSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="dc-embed-img-wrap"
              >
                <img
                  src={imgSrc}
                  alt={emb.title ?? 'embed image'}
                  className="dc-embed-img"
                  loading="lazy"
                  style={
                    emb.image_width && emb.image_height
                      ? { maxWidth: Math.min(emb.image_width, 420), maxHeight: Math.min(emb.image_height, 280) }
                      : undefined
                  }
                />
              </a>
            )}

            {!imgSrc && thumbSrc && (
              <a
                href={emb.thumbnail_url ?? thumbSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="dc-embed-img-wrap"
              >
                <img
                  src={thumbSrc}
                  alt="thumbnail"
                  className="dc-embed-img"
                  loading="lazy"
                />
              </a>
            )}

            {emb.footer_text && (
              <div className="dc-embed-footer">{emb.footer_text}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

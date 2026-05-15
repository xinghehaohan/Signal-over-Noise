export interface DiscordIntelManifest {
  type: 'manifest'
  schema_version: string
  channel_id: string
  server_id: string
  channel_name: string
  server_name: string
  chat_type: string
  start_date: string
  end_date: string
  message_count: number
  exported_at: string
  run_id?: string
}

export interface DiscordRawEmbed {
  type?: string
  title?: string
  description?: string
  url?: string
  color?: number
  image?: {
    url?: string
    proxy_url?: string
    width?: number
    height?: number
    content_type?: string
    [key: string]: unknown
  }
  thumbnail?: {
    url?: string
    proxy_url?: string
    width?: number
    height?: number
    [key: string]: unknown
  }
  footer?: {
    text?: string
    [key: string]: unknown
  }
  author?: {
    name?: string
    url?: string
    icon_url?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

export interface DiscordRawAttachment {
  id: string
  filename: string
  title?: string
  size: number
  url: string
  proxy_url: string
  width?: number
  height?: number
  content_type?: string
  original_content_type?: string
  [key: string]: unknown
}

export interface DiscordRawMessage {
  id: string
  channel_id: string
  type: number
  content: string
  timestamp: string
  edited_timestamp: string | null
  mention_everyone: boolean
  pinned: boolean
  tts: boolean
  flags: number
  attachments: DiscordRawAttachment[]
  embeds: DiscordRawEmbed[]
  mentions: unknown[]
  mention_roles: unknown[]
  components: unknown[]
  'author.id': string
  'author.username': string
  'author.global_name': string | null
  'author.avatar': string | null
  'author.discriminator': string
  'author.public_flags': number
  'author.flags': number
  [key: string]: unknown
}

export interface ParsedJsonlResult {
  manifest: DiscordIntelManifest
  messages: DiscordRawMessage[]
  errors: Array<{ line: number; error: string }>
}

export interface ImportSummary {
  runId: string
  sourceId: string
  externalChannelId: string
  channelName: string
  serverName: string
  declaredCount: number
  parsedCount: number
  insertedOrUpdatedCount: number
  duplicateCount: number
  attachmentCount: number
  embedCount: number
  errors: string[]
}

export interface DiscordSource {
  id: string
  external_channel_id: string
  external_server_id: string | null
  server_name_clean: string | null
  channel_name_clean: string | null
  category: string | null
  tags: string[]
  priority: number
  enabled: boolean
  message_count: number
  attachment_count: number
  last_message_at: string | null
}

export interface DiscordTimelineEmbed {
  id: string
  position: number
  embed_type: string | null
  title: string | null
  description: string | null
  url: string | null
  color: number | null
  image_url: string | null
  image_proxy_url: string | null
  image_width: number | null
  image_height: number | null
  thumbnail_url: string | null
  thumbnail_proxy_url: string | null
  footer_text: string | null
  author_name: string | null
}

export interface DiscordTimelineAttachment {
  id: string
  external_attachment_id: string | null
  filename: string | null
  title: string | null
  content_type: string | null
  size_bytes: number | null
  width: number | null
  height: number | null
  url: string | null
  proxy_url: string | null
}

export interface DiscordMessageTimelineItem {
  id: string
  external_message_id: string
  external_channel_id: string
  content: string
  author_external_id: string | null
  author_username: string | null
  author_global_name: string | null
  created_at_source: string | null
  edited_at_source: string | null
  has_attachments: boolean
  has_embeds: boolean
  mention_everyone: boolean
  pinned: boolean
  source: {
    server_name_clean: string | null
    channel_name_clean: string | null
  } | null
  attachments: DiscordTimelineAttachment[]
  embeds: DiscordTimelineEmbed[]
}

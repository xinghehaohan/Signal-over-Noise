-- Discord Intelligence Archive Schema
-- raw jsonb columns are intentionally preserved on every row so that future
-- AI, OCR, vector-search, and re-processing pipelines can work from the
-- original data without needing a re-import.

-- ─── discord_sources ──────────────────────────────────────────────────────
-- One row per Discord channel. Tracks metadata about the source channel and
-- normalises the raw server/channel names that come from the Chrome extension.
create table if not exists discord_sources (
  id                  uuid primary key default gen_random_uuid(),
  platform            text             default 'discord',
  external_server_id  text,
  external_channel_id text unique not null,
  server_name_raw     text,
  channel_name_raw    text,
  server_name_clean   text,
  channel_name_clean  text,
  chat_type           text,
  category            text,
  tags                text[]           default '{}',
  priority            integer          default 3,
  enabled             boolean          default true,
  created_at          timestamptz      default now(),
  updated_at          timestamptz      default now()
);

-- ─── discord_import_runs ──────────────────────────────────────────────────
-- One row per JSONL file import. Records what was declared in the manifest
-- vs. what was actually ingested, so drift is always visible.
create table if not exists discord_import_runs (
  id                       uuid    primary key default gen_random_uuid(),
  source_id                uuid    references discord_sources(id) on delete cascade,
  run_id                   text    unique not null,
  schema_version           text,
  range_start              date,
  range_end                date,
  message_count_declared   integer,
  message_count_ingested   integer default 0,
  duplicate_count          integer default 0,
  exported_at              timestamptz,
  imported_at              timestamptz default now(),
  status                   text    default 'completed',
  error                    text,
  manifest_raw             jsonb   not null
);

-- ─── discord_messages ─────────────────────────────────────────────────────
-- One row per Discord message. The unique constraint on
-- (external_channel_id, external_message_id) makes repeated imports safe —
-- upserts update existing rows rather than creating duplicates.
create table if not exists discord_messages (
  id                   uuid        primary key default gen_random_uuid(),
  source_id            uuid        references discord_sources(id) on delete cascade,
  import_run_id        uuid        references discord_import_runs(id) on delete set null,
  external_message_id  text        not null,
  external_channel_id  text        not null,
  discord_message_type integer,
  author_external_id   text,
  author_username      text,
  author_global_name   text,
  content              text,
  content_hash         text,
  created_at_source    timestamptz,
  edited_at_source     timestamptz,
  mention_everyone     boolean     default false,
  pinned               boolean     default false,
  tts                  boolean     default false,
  flags                integer,
  has_attachments      boolean     default false,
  has_embeds           boolean     default false,
  raw                  jsonb       not null,   -- full original message object preserved for future processing
  imported_at          timestamptz default now(),
  updated_at           timestamptz default now(),
  unique(external_channel_id, external_message_id)
);

-- ─── discord_attachments ──────────────────────────────────────────────────
-- One row per file attachment. Attachments are deleted and re-inserted on
-- each import so the latest CDN URLs are always current.
create table if not exists discord_attachments (
  id                       uuid    primary key default gen_random_uuid(),
  message_id               uuid    references discord_messages(id) on delete cascade,
  external_attachment_id   text,
  filename                 text,
  title                    text,
  content_type             text,
  original_content_type    text,
  size_bytes               bigint,
  width                    integer,
  height                   integer,
  url                      text,
  proxy_url                text,
  raw                      jsonb,  -- full original attachment object preserved for future processing
  created_at               timestamptz default now(),
  unique(message_id, external_attachment_id)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────
create index if not exists idx_discord_messages_channel_time
  on discord_messages(external_channel_id, created_at_source desc);

create index if not exists idx_discord_messages_time
  on discord_messages(created_at_source desc);

create index if not exists idx_discord_messages_author
  on discord_messages(author_external_id);

create index if not exists idx_discord_messages_has_attachments
  on discord_messages(has_attachments);

create index if not exists idx_discord_sources_channel_id
  on discord_sources(external_channel_id);

create index if not exists idx_discord_attachments_message
  on discord_attachments(message_id);

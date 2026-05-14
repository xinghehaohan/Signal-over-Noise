You are working inside my existing Next.js project.

Project context:
- Next.js: ^15.3.0
- React: ^19.1.0
- Supabase client: @supabase/supabase-js ^2.105.1
- lucide-react is available
- The project uses the app router under /app
- This is a great product, so keep it UI align, isolated, and easy to read.

Goal:
Integrate a main part for the app as the private Discord intelligence archive module into this existing Next.js app.

The data comes from my modified Chrome extension. Each exported JSONL file contains array []:
1. First line: a manifest object
2. Following lines: Discord message rows

Example manifest:

{
  "type": "manifest",
  "schema_version": "1",
  "channel_id": "1484200645316710573",
  "server_id": "1412445465907167394",
  "channel_name": "美股会员网:\\n六便士-股票中长线-s0",
  "server_name": "美股会员网\\n邀请至服务器",
  "chat_type": "guild",
  "start_date": "2026-03-01",
  "end_date": "2026-05-13",
  "message_count": 87,
  "exported_at": "2026-05-13T18:01:43.631Z"
}

Example message row:

    {
        "type": 0,
        "content": "@everyone \n美港a持仓组合更新-20260301",
        "mentions": [],
        "mention_roles": [],
        "attachments": [
            {
                "id": "1484201997417844806",
                "filename": "a-20260301.png",
                "size": 875998,
                "url": "https://cdn.discordapp.com/attachments/1484200645316710573/1484201997417844806/a-20260301.png?ex=6a05e0d3&is=6a048f53&hm=dc440fb08095a92642aeba7fa800a0d726b00c8644cb0a5b4248aa76ff79c4bc&",
                "proxy_url": "https://media.discordapp.net/attachments/1484200645316710573/1484201997417844806/a-20260301.png?ex=6a05e0d3&is=6a048f53&hm=dc440fb08095a92642aeba7fa800a0d726b00c8644cb0a5b4248aa76ff79c4bc&",
                "width": 1766,
                "height": 1716,
                "content_type": "image/png",
                "original_content_type": "image/png",
                "content_scan_version": 4,
                "placeholder": "NvgFH4B3d5d2d3d0hwh4KIeFeAdXdnAG",
                "placeholder_version": 1,
                "title": "美港a持仓组合更新-20260301"
            }
        ],
        "embeds": [],
        "timestamp": "2026-03-19T14:48:51.377000+00:00",
        "edited_timestamp": null,
        "flags": 0,
        "components": [],
        "id": "1484201997640011826",
        "channel_id": "1484200645316710573",
        "author.id": "1098937850168365176",
        "author.username": "us_stock_vip",
        "author.avatar": "6929839c3db522eb3fbc833af4659aaa",
        "author.discriminator": "0",
        "author.public_flags": 0,
        "author.flags": 0,
        "author.banner": null,
        "author.accent_color": null,
        "author.global_name": "美股会员网-群主",
        "author.avatar_decoration_data.asset": "a_d3da36040163ee0f9176dfe7ced45cdc",
        "author.avatar_decoration_data.sku_id": "1144058522808614923",
        "author.avatar_decoration_data.expires_at": null,
        "author.collectibles": null,
        "author.display_name_styles.font_id": 3,
        "author.display_name_styles.effect_id": 4,
        "author.display_name_styles.colors": [
            11080677
        ],
        "author.banner_color": null,
        "author.clan": null,
        "author.primary_guild": null,
        "pinned": false,
        "mention_everyone": true,
        "tts": false
    }

Important:
 the Next.js side should treat JSONL as the stable input format.

First version product goal:
-it have a lot different chanels and eatch jsonl have manifest of upload data
- Upload JSONL file
- Parse manifest + message rows
- Save them to Supabase
- Deduplicate by channel_id + message_id
- Show all imported messages in a simple timeline
- Support basic filters: channel, date range, has attachments
- Preserve raw JSON for future processing
- Extract useful top-level fields for easy querying

Architecture:
Add this as an isolated module under:

app/discord-intel/import/page.tsx
app/discord-intel/timeline/page.tsx
app/api/discord-intel/import/route.ts
app/api/discord-intel/messages/route.ts

lib/discord-intel/
  parse-jsonl.ts
  import-jsonl.ts
  supabase-admin.ts
  clean-names.ts
  types.ts

docs/discord-intel/
  schema.sql
  manual-test-checklist.md

Do not touch unrelated existing app logic unless needed for navigation.

Environment variables:
Use these existing or expected variables or others you need:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

Rules:
- Keep UI simple and clean.
- Keep the module namespaced with discord-intel.

Database:
Create docs/discord-intel/schema.sql with these tables.

Use prefixed table names:

discord_sources
discord_import_runs
discord_messages
discord_attachments

Schema requirements:

1. discord_sources

Fields:
- id uuid primary key default gen_random_uuid()
- platform text default 'discord'
- external_server_id text
- external_channel_id text unique not null
- server_name_raw text
- channel_name_raw text
- server_name_clean text
- channel_name_clean text
- chat_type text
- category text nullable
- tags text[] default '{}'
- priority integer default 3
- enabled boolean default true
- created_at timestamptz default now()
- updated_at timestamptz default now()

2. discord_import_runs

Fields:
- id uuid primary key default gen_random_uuid()
- source_id uuid references discord_sources(id) on delete cascade
- run_id text unique not null
- schema_version text
- range_start date
- range_end date
- message_count_declared integer
- message_count_ingested integer default 0
- duplicate_count integer default 0
- exported_at timestamptz
- imported_at timestamptz default now()
- status text default 'completed'
- error text
- manifest_raw jsonb not null

3. discord_messages

Fields:
- id uuid primary key default gen_random_uuid()
- source_id uuid references discord_sources(id) on delete cascade
- import_run_id uuid references discord_import_runs(id) on delete set null
- external_message_id text not null
- external_channel_id text not null
- discord_message_type integer
- author_external_id text
- author_username text
- author_global_name text
- content text
- content_hash text
- created_at_source timestamptz
- edited_at_source timestamptz
- mention_everyone boolean default false
- pinned boolean default false
- tts boolean default false
- flags integer
- has_attachments boolean default false
- has_embeds boolean default false
- raw jsonb not null
- imported_at timestamptz default now()
- updated_at timestamptz default now()
- unique(external_channel_id, external_message_id)

4. discord_attachments

Fields:
- id uuid primary key default gen_random_uuid()
- message_id uuid references discord_messages(id) on delete cascade
- external_attachment_id text
- filename text
- title text
- content_type text
- original_content_type text
- size_bytes bigint
- width integer
- height integer
- url text
- proxy_url text
- raw jsonb
- created_at timestamptz default now()
- unique(message_id, external_attachment_id)

Indexes:
- discord_messages(external_channel_id, created_at_source desc)
- discord_messages(created_at_source desc)
- discord_messages(author_external_id)
- discord_messages(has_attachments)
- discord_sources(external_channel_id)
- discord_attachments(message_id)

Add comments in schema.sql explaining that raw jsonb is intentionally preserved for future AI/OCR/search processing.

Parsing logic:
Implement lib/discord-intel/parse-jsonl.ts.

Requirements:
- Accept raw text
- Split by newline
- Ignore empty lines
- Parse first JSON line as manifest
- Validate manifest.type === "manifest"
- Parse remaining lines as message rows
- Return:
  {
    manifest,
    messages,
    errors
  }
- If some message rows fail parsing, collect errors with line number, but do not crash the entire file unless manifest fails.
- Keep original row object as raw.

Types:
Implement lib/discord-intel/types.ts with TypeScript types:

DiscordIntelManifest
DiscordRawMessage
ParsedJsonlResult
ImportSummary
DiscordMessageTimelineItem

Name cleaning:
Implement lib/discord-intel/clean-names.ts.

Functions:
cleanServerName(value: string | null | undefined): string | null
cleanChannelName(value: string | null | undefined): string | null

Rules:
- Remove newline noise
- For server_name like "美股会员网\n邀请至服务器", return "美股会员网"
- For channel_name like "美股会员网:\n六便士-股票中长线-s0", return "六便士-股票中长线-s0"
- Trim whitespace
- Do not over-normalize Chinese text

Supabase admin:
Implement lib/discord-intel/supabase-admin.ts.

Requirements:
- Create Supabase server client using:
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
- Throw clear error if env vars missing
- This file must only be imported by server routes or server-only utilities

Import logic:
Implement lib/discord-intel/import-jsonl.ts.

Function:
importDiscordJsonlText(text: string): Promise<ImportSummary>

Behavior:
1. Parse JSONL.
2. Upsert discord_sources using external_channel_id from manifest.channel_id.
3. Create a unique run_id.
   - If manifest has run_id, use it.
   - Else generate from channel_id + exported_at + Date.now().
4. Insert discord_import_runs.
5. For each parsed message:
   - external_message_id = message.id
   - external_channel_id = message.channel_id || manifest.channel_id
   - discord_message_type = message.type if number
   - author_external_id = message["author.id"]
   - author_username = message["author.username"]
   - author_global_name = message["author.global_name"]
   - content = message.content || ""
   - content_hash = sha256(content)
   - created_at_source = message.timestamp
   - edited_at_source = message.edited_timestamp
   - mention_everyone = Boolean(message.mention_everyone)
   - pinned = Boolean(message.pinned)
   - tts = Boolean(message.tts)
   - flags = message.flags if number
   - has_attachments = attachments.length > 0
   - has_embeds = embeds.length > 0
   - raw = full message object
6. Upsert messages by unique(external_channel_id, external_message_id).
7. For attachments:
   - After upserting message, delete existing attachments for that message and insert current attachments.
   - Extract attachment id, filename, title, content_type, original_content_type, size, width, height, url, proxy_url, raw.
8. Update discord_import_runs with:
   - message_count_ingested
   - duplicate_count
   - status completed or partial
9. Return summary:
   {
     runId,
     sourceId,
     channelName,
     serverName,
     declaredCount,
     parsedCount,
     insertedOrUpdatedCount,
     duplicateCount,
     attachmentCount,
     errors
   }

Important:
- Upsert should make repeated imports safe.
- If I import the same JSONL twice, messages must not duplicate.
- If I import the latest two days every day, old messages should update but not duplicate.
- Preserve raw JSON.

Import API:
Implement app/api/discord-intel/import/route.ts.

Requirements:
- POST multipart/form-data with file field named "file"
- Accept .jsonl or .ndjson
- Read file text
- Call importDiscordJsonlText(text)
- Return JSON summary
- Handle errors clearly
- Set runtime to nodejs if needed
- Do not use edge runtime

Messages API:
Implement app/api/discord-intel/messages/route.ts.

GET query params:
- channelId optional
- from optional ISO/date
- to optional ISO/date
- hasAttachments optional true/false
- limit default 100 max 500
- offset default 0

Return:
{
  items: [
    {
      id,
      external_message_id,
      external_channel_id,
      content,
      author_username,
      author_global_name,
      created_at_source,
      has_attachments,
      has_embeds,
      source: {
        server_name_clean,
        channel_name_clean
      },
      attachments: [...]
    }
  ],
  totalApprox,
  limit,
  offset
}

Implementation:
- Query discord_messages ordered by created_at_source desc.
- Join source if easy through Supabase select.
- Include attachments.
- Keep it simple and stable.

Import page:
Implement app/discord-intel/import/page.tsx.

Client component is okay.

UI requirements:
- Title: Discord Intel Import
- File input / drag area for .jsonl or .ndjson
- Upload button for files
- Loading state
- Show summary after import:
  - server/channel
  - declared messages
  - parsed messages
  - inserted/updated
  - duplicates
  - attachments
  - errors count
- Link to /discord-intel/timeline

Timeline page:
Implement app/discord-intel/timeline/page.tsx.

Can be client component using fetch to /api/discord-intel/messages.

UI requirements:
- Title: Discord Intel Timeline
- Filters:
  - channelId text input
  - from date
  - to date
  - has attachments checkbox
  - limit selector: 50 / 100 / 200
- Message list ordered newest first
- Each message card shows:
  - server/channel
  - author display name
  - timestamp
  - content preserving line breaks
  - badges: has attachments, mention everyone, pinned
  - attachments list with filename/title/content type/size and link to URL
- Simple pagination: Load more button using offset

Do not make it fancy. Make it readable.

Manual test checklist:
Create docs/discord-intel/manual-test-checklist.md.

Include:
1. Run schema.sql in Supabase SQL editor.
2. Add env vars.
3. Start Next.js locally.
4. Open /discord-intel/import.
5. Upload one JSONL file.
6. Confirm import summary.
7. Open /discord-intel/timeline.
8. Confirm messages display.
9. Upload same JSONL again.
10. Confirm no duplicate messages.
11. Upload another channel JSONL.
12. Confirm timeline shows both channels.
13. Filter by channel ID.
14. Filter by date.
15. Check attachments display.

Do not implement:
- AI
- translation
- OCR
- pgvector
- Meilisearch
- background jobs
- plugin direct upload
- auth system
- image downloading

After implementation, report:
- files added
- files changed
- SQL I need to run in Supabase
- env vars required
- how to test import
- how to test timeline
- known limitations